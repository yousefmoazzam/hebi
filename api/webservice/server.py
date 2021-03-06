import glob
import os
from io import BytesIO

from flask import (Flask, jsonify, request, abort, make_response, send_file)
from flask.json import JSONEncoder
from flask_api import status
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from fuzzywuzzy import fuzz
import json_tricks
import voluptuous
import requests

import savu.plugins as savu_plugins
import savu.plugins.utils as pu
import savu.data.framework_citations as fc
import scripts.config_generator.parameter_utils as param_utils
import scripts.config_generator.config_utils as config_utils
from scripts.config_generator.content import Content
from scripts.config_generator.completer import Completer

from webservice.utils import (plugin_to_dict, plugin_list_entry_to_dict,
                   is_file_a_data_file, is_file_a_process_list, validate_file,
                   to_bool, create_process_list_from_user_data,
                   find_files_recursive)
from webservice.execution import NoSuchJobError
from webservice import const
from webservice import validation


class BetterJsonEncoder(JSONEncoder):
    def default(self, o):
        return json_tricks.dumps(o)


app = Flask('savu')
app.json_encoder = BetterJsonEncoder
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins='*')
CORS(app)


def setup_runners():
    import importlib
    for queue_name, runner in app.config[const.CONFIG_NAMESPACE_SAVU][
            const.CONFIG_KEY_JOB_RUNNERS].items():
        # Create an instance of the job runner
        m = importlib.import_module(runner[const.CONFIG_KEY_RUNNER_MODULE])
        c = getattr(m, runner[const.CONFIG_KEY_RUNNER_CLASS])
        params = runner[const.CONFIG_KEY_RUNNER_PARAMETERS]
        runner[const.CONFIG_KEY_RUNNER_INSTANCE] = c(**params)

        def send_updates_thread_fun(qn, runner):
            """
            Function which loops forever and periodically sneds out job stattus updates
            TODO: check if the job status has actually changed before sending an update
            """
            while True:
                for job_id, job in runner._jobs.items():
                    ws_send_job_status(qn, job_id)
                socketio.sleep(2)

        socketio.start_background_task(send_updates_thread_fun, queue_name,
                                       runner[const.CONFIG_KEY_RUNNER_INSTANCE])


def teardown_runners():
    for _, v in app.config[const.CONFIG_NAMESPACE_SAVU][
            const.CONFIG_KEY_JOB_RUNNERS]:
        v[const.CONFIG_KEY_RUNNER_INSTANCE].close()


def validate_config():
    validation.server_configuration_schema(
        app.config[const.CONFIG_NAMESPACE_SAVU])


@app.route('/plugin')
def query_plugin_list():
    query = request.args.get(const.KEY_QUERY)

    if query:
        query = query.lower()
        plugin_names = [k for k, v in pu.plugins.items() \
                        if fuzz.partial_ratio(k.lower(), query) > 75]
    else:
        plugin_names = [k for k, v in pu.plugins.items()]

    validation.query_plugin_list_schema(plugin_names)
    return jsonify(plugin_names)


@app.route('/plugin_browser/info')
def get_plugin_browser_info():
    plugin_name = request.args.get(const.KEY_QUERY)
    plugin = pu.plugins[plugin_name]()
    plugin.get_plugin_tools()._populate_default_parameters()
    plugin_info = {
        'doc_link': str(plugin.docstring_info.get('documentation_link')),
        'info': plugin.docstring_info.get('info'),
        'synopsis': plugin.docstring_info.get('synopsis')
    }

    return jsonify(plugin_info)


@app.route('/plugin/search')
def search_plugins():
    query = request.args.get(const.KEY_QUERY)

    if query:
        # use search in configurator
        matched_plugins = config_utils.__get_filtered_plugins(query)
    else:
        # empty query, all plugins match this
        matched_plugins = [k for k, v in pu.plugins.items()]

    validation.query_plugin_list_schema(matched_plugins)
    return jsonify(matched_plugins)


@app.route('/plugin_collections')
def get_plugin_collecions():

    # helper functions for creating the data structure containing collections
    # and the plugins in them
    def create_collection_dict(coll_name):
        child = {
            'collections': {},
            'plugins': config_utils.__get_filtered_plugins(coll_name)
        }
        return child

    def find_parent_collection_dict(colls_dict, collection_path):
        split_subcollections = collection_path.split('/')
        innermost_subcollection = split_subcollections[-1]

        if not split_subcollections[0]:
            # a top level collection
            return colls_dict['collections']
        else:
            # a subcollection: walk through the collections dict to the correct
            # level
            subcollection = colls_dict
            for subcoll in split_subcollections:
                subcollection = subcollection['collections'][subcoll]
            return subcollection['collections']


    # use a similar strategy to the code in Completer._get_collections() in
    # Savu to get all the plugin collections
    path = savu_plugins.__path__[0]
    exclude_dir = ['driver', 'utils']

    colls = {
        'collections': {},
        'plugins': []
    }

    for root, dirs, files in os.walk(path):
        depth = root.count(os.path.sep) - path.count(os.path.sep)
        dirs[:] = [d for d in dirs if d not in exclude_dir]

        if depth == 0:
            plugin_collection_path = ''
        else:
            plugin_collection_path = root.split('plugins/')[1]

        parent_coll = find_parent_collection_dict(colls, plugin_collection_path)

        for coll in dirs:
            parent_coll[coll] = create_collection_dict(coll)

    return jsonify(colls)


@app.route('/plugin/<name>')
def get_plugin_info(name):
    if name not in pu.plugins:
        abort(status.HTTP_404_NOT_FOUND)

    # Create plugin instance with default parameter values
    p = pu.plugins[name]()
    p.get_plugin_tools()._populate_default_parameters()

    data = plugin_to_dict(name, p)

    validation.get_plugin_info_schema(data)
    return jsonify(data)


@app.route('/add_plugin', methods=['PUT'])
def add_plugin_to_process_list():
    request_data = request.get_json()

    if request_data['pluginName'] not in pu.plugins:
        abort(status.HTTP_404_NOT_FOUND)

    # create a process list with a single plugin in it (an instance of the
    # plugin desired to be added to the process list editor) so then plugin
    # data of the desired format can be passed to plugin_list_entry_to_dict()
    process_list = Content()
    dummy_pos = "1"
    process_list.add(request_data['pluginName'], dummy_pos)
    process_list.on_and_off(dummy_pos, const.PLUGIN_ENABLED)
    plugin = process_list.plugin_list.plugin_list[0]
    data = plugin_list_entry_to_dict(plugin)
    # update with the desired pos value
    data['pos'] = request_data['pluginIndex']
    validation.process_list_entry_schema(data)
    return jsonify(data)


@app.route('/plugin/modify_param_val', methods=['PUT'])
def modify_param_val():
    data = request.get_json()
    user_pl_data = data["processList"]
    plugin_index = int(data["pluginIndex"])
    param_name = data["paramName"]
    param_value = data["newParamVal"]

    process_list = create_process_list_from_user_data(user_pl_data)

    # check if the type of the given param value is the same as the required
    # type for the param
    plugin = process_list.plugin_list.plugin_list[plugin_index - 1]
    cast_param_value = pu._dumps(param_value)
    param_valid, error_str = param_utils.is_valid(param_name, cast_param_value,
        plugin['tools'].param.get_dictionary()[param_name])

    if param_valid:
        # modify the plugin param value to be the new value submitted in the UI
        process_list.modify(data["pluginIndex"], param_name, param_value)

        # get the new state of the plugin with any changes to param display
        modified_plugin = process_list.plugin_list.plugin_list[plugin_index - 1]
        modified_plugin_data = plugin_list_entry_to_dict(modified_plugin)
        validation.process_list_entry_schema(modified_plugin_data)

        return jsonify({
            'is_valid': param_valid,
            'plugin_data': modified_plugin_data,
            'plugin_index': plugin_index,
            'param_name': param_name
        })
    else:
        required_type = plugin['param'][param_name]['dtype']

        return jsonify({
            'is_valid': param_valid,
            'dtype': required_type,
            'plugin_index': plugin_index,
            'param_name': param_name,
            'errored_param_value': param_value,
            'error_str': error_str
        })


@app.route('/process_list')
def process_list_list():
    # Listing process list files in a given search directory
    if const.KEY_PATH in request.args:
        # Get the absolute path being searched
        user_path = request.args.get(const.KEY_PATH)
        abs_path = os.path.abspath(os.path.expanduser(user_path))

        data = {
            const.KEY_PATH: abs_path,
            const.KEY_FILES: list(
                find_files_recursive(abs_path, is_file_a_process_list)),
        }

        validation.filename_listing_schema(data)
        return jsonify(data)

    # Listing details of a specific process list
    elif const.KEY_FILENAME in request.args:
        fname = const.ROOT_MOUNT_POINT + request.args.get(const.KEY_FILENAME)

        # Ensure file is a valid process list
        if not validate_file(fname, is_file_a_process_list):
            abort(status.HTTP_404_NOT_FOUND)

        # Open process list
        process_list = Content()
        process_list.fopen(fname)

        # Refresh all plugins in the process list once it has been opened
        positions = process_list.get_positions()
        for pos_str in positions:
            process_list.refresh(pos_str)

        # Format plugin list
        plugins = [plugin_list_entry_to_dict(p) for \
                   p in process_list.plugin_list.plugin_list]

        data = {
            const.KEY_FILENAME: fname,
            const.KEY_PLUGINS: plugins
        }

        validation.process_list_list_filename_schema(data)
        return jsonify(data)

    else:
        abort(status.HTTP_400_BAD_REQUEST)


@app.route('/check_pl_exists')
def check_pl_exists():
    fname = const.ROOT_MOUNT_POINT + request.args.get(const.KEY_FILENAME)
    return jsonify({
        'doesFileExist': validate_file(fname, is_file_a_process_list)
    })


@app.route('/process_list', methods=['POST'])
def process_list_create():
    fname = const.ROOT_MOUNT_POINT + request.args.get(const.KEY_FILENAME)

    # Ensure file does not already exist
    if validate_file(fname, is_file_a_process_list):
        abort(status.HTTP_409_CONFLICT)

    # Get user supplied JSON and validate it
    user_pl_data = request.get_json()
    try:
        validation.process_list_update_schema(user_pl_data)
    except voluptuous.error.Error:
        abort(status.HTTP_400_BAD_REQUEST)

    # Create new process list
    process_list = create_process_list_from_user_data(user_pl_data)

    # Save process list
    process_list.save(fname)

    # Handle process list view
    return process_list_list()


@app.route('/process_list', methods=['PUT'])
def process_list_update():
    fname = const.ROOT_MOUNT_POINT + request.args.get(const.KEY_FILENAME)

    # Get user supplied JSON and validate it
    user_pl_data = request.get_json()
    try:
        validation.process_list_update_schema(user_pl_data)
    except voluptuous.error.Error:
        abort(status.HTTP_400_BAD_REQUEST)

    # Create new process list
    process_list = create_process_list_from_user_data(user_pl_data)

    # Delete existing process list
    process_list_delete()

    # Save new process list
    process_list.save(fname)

    # Handle process list view
    return process_list_list()


@app.route('/process_list', methods=['DELETE'])
def process_list_delete():
    fname = const.ROOT_MOUNT_POINT + request.args.get(const.KEY_FILENAME)

    # Ensure file is a valid process list
    if not validate_file(fname, is_file_a_process_list):
        abort(status.HTTP_404_NOT_FOUND)

    # Delete file
    os.remove(fname)

    data = {
        const.KEY_FILENAME: fname,
    }

    validation.process_list_delete_schema(data)
    return jsonify(data)


@app.route('/process_list/download')
def process_list_download():
    fname = const.ROOT_MOUNT_POINT + request.args.get(const.KEY_FILENAME)

    # Ensure file is a valid process list
    if not validate_file(fname, is_file_a_process_list):
        abort(status.HTTP_404_NOT_FOUND)

    return send_file(fname)


@app.route('/plugin/download/citation/<plugin_name>')
def plugin_citation_download(plugin_name):
    citation_type = request.args.get(const.KEY_QUERY)
    plugin = pu.plugins[plugin_name]()
    plugin.get_plugin_tools()._populate_default_parameters()
    citations = plugin.tools.get_citations()
    contents = ''

    for (k, v) in citations.items():
        if citation_type == 'bibtex':
            contents += v.bibtex.rstrip('\n') + '\n\n'
        elif citation_type == 'endnote':
            contents += v.endnote.rstrip('\n') + '\n\n'

    if citation_type == 'bibtex':
        filename = plugin_name + '.bibtex'
    elif citation_type == 'endnote':
        filename = plugin_name + '.endnote'

    f = BytesIO(contents.encode('utf-8'))

    return send_file(f, mimetype='text', as_attachment=True,
        attachment_filename=filename)


@app.route('/framework_citations')
def get_framework_citations():
    # get the latest Savu DOI
    # this url always redirects to the latest Savu DOI
    url = 'https://doi.org/10.5281/zenodo.592215'
    r = requests.get(url)
    # get the specific DOI suffix that the url redirected to
    doi_suffix = r.url.split('/')[-1]
    ZENODO_PREFIX = '10.5281/zenodo.'
    savu_doi = ZENODO_PREFIX + doi_suffix

    framework_citations = fc.get_framework_citations()
    for citation in framework_citations:
        if citation['short_name_article'] == 'Savu':
            citation['doi'] = savu_doi

    return jsonify(framework_citations)


@app.route('/framework_citations/download')
def download_framework_citations():
    citation_type = request.args.get(const.KEY_QUERY)
    contents = ''
    framework_citations = fc.get_framework_citations()

    for citation in framework_citations:
        if citation_type == 'bibtex':
            contents += citation['bibtex'].rstrip('\n') + '\n\n'
        elif citation_type == 'endnote':
            contents += citation['endnote'].rstrip('\n') + '\n\n'

    if citation_type == 'bibtex':
        filename = 'framework_citations.bibtex'
    elif citation_type == 'endnote':
        filename = 'framework_citations.endnote'

    f = BytesIO(contents.encode('utf-8'))

    return send_file(f, mimetype='text', as_attachment=True,
        attachment_filename=filename)


@app.route('/data/find')
def data_find():
    user_path = request.args.get(const.KEY_PATH)
    if not user_path:
        return abort(status.HTTP_400_BAD_REQUEST)

    # Get the absolute path being searched
    abs_path = os.path.abspath(os.path.expanduser(user_path))

    data = {
        const.KEY_PATH: abs_path,
        const.KEY_FILES: list(
            find_files_recursive(abs_path, is_file_a_data_file)),
    }

    validation.filename_listing_schema(data)
    return jsonify(data)


@app.route('/jobs/<queue>/submit')
def jobs_queue_submit(queue):
    dataset = request.args.get(const.KEY_DATASET)
    process_list = request.args.get(const.KEY_PROCESS_LIST_FILE)
    output = request.args.get(const.KEY_OUTPUT_PATH)

    # Ensure file is a valid dataset
    if not validate_file(dataset, is_file_a_data_file):
        abort(status.HTTP_404_NOT_FOUND)

    # Ensure file is a valid process list
    if not validate_file(process_list, is_file_a_process_list):
        abort(status.HTTP_404_NOT_FOUND)

    # Start job
    job = app.config[const.CONFIG_NAMESPACE_SAVU][
        const.CONFIG_KEY_JOB_RUNNERS][queue][
            const.CONFIG_KEY_RUNNER_INSTANCE].start_job(dataset, process_list,
                                                        output)

    return jobs_queue_info(queue, job)


@app.route('/jobs/<queue_name>/<job_id>')
def jobs_queue_info(queue_name, job_id):
    queue = app.config[const.CONFIG_NAMESPACE_SAVU][
        const.CONFIG_KEY_JOB_RUNNERS].get(queue_name)
    if queue is None:
        abort(status.HTTP_404_NOT_FOUND)

    try:
        data = {
            const.KEY_QUEUE_ID: queue_name,
            const.KEY_JOB_ID: queue[const.CONFIG_KEY_RUNNER_INSTANCE].job(
                job_id).to_dict(),
        }

        validation.jobs_queue_info_schema(data)
        return jsonify(data)

    except NoSuchJobError:
        abort(status.HTTP_404_NOT_FOUND)


@app.route('/default_paths')
def data_default_path():
    data = {}

    def get_path(ns, key):
        data[key] = app.config[const.CONFIG_NAMESPACE_SAVU][ns]['default']

    get_path('data_location', 'data')
    get_path('process_list_location', 'process_list')
    get_path('output_location', 'output')

    return jsonify(data)


def ws_send_job_status(queue_name, job_id):
    queue = app.config[const.CONFIG_NAMESPACE_SAVU]['job_runners'].get(
        queue_name)
    data = {
        const.KEY_QUEUE_ID: queue_name,
        const.KEY_JOB_ID: queue['instance'].job(job_id).to_dict(),
    }

    validation.jobs_queue_info_schema(data)

    room = queue_name + '/' + job_id
    socketio.emit(
        const.EVENT_JOB_STATUS,
        data,
        room=room,
        namespace=const.WS_NAMESPACE_JOB_STATUS)


@socketio.on('join', namespace=const.WS_NAMESPACE_JOB_STATUS)
def ws_on_join_job_status(data):
    room = data[const.KEY_QUEUE_ID] + '/' + data[const.KEY_JOB_ID]
    join_room(room)
    # Send an update now to ensure client is up to date
    ws_send_job_status(data[const.KEY_QUEUE_ID], data[const.KEY_JOB_ID])


@socketio.on('leave', namespace=const.WS_NAMESPACE_JOB_STATUS)
def ws_on_leave_job_status(data):
    room = data[const.KEY_QUEUE_ID] + '/' + data[const.KEY_JOB_ID]
    leave_room(room)
