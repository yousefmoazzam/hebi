import os
import pkgutil
import sys
import importlib.util

import h5py

import savu.plugins.utils as pu
from savu.data.plugin_list import CitationInformation
from scripts.config_generator.content import Content

from . import const


def populate_plugins():
    """
    Loads plugins from plugin paths.

    Almost identical to the function in scripts.config_generator.config_utils
    """

    def _load_module(finder, module_name):
        if module_name not in sys.modules:
            try:
                spec = finder.find_spec(module_name)
                mod = importlib.util.module_from_spec(spec)
                sys.modules[spec.name] = mod
                spec.loader.exec_module(mod)
            except Exception:
                pass

    # load all the plugins
    plugins_paths = pu.get_plugins_paths()

    for path, name in plugins_paths.items():
        for finder, module_name, is_pkg in pkgutil.walk_packages([path], name):
            if not is_pkg:
                _load_module(finder, module_name)


def plugin_to_dict(name, p):
    """
    Returns a dictionary representation of a plugin in a given state.
    """
    parameters = []
    keys = pu.set_order_by_visibility(p.tools.param.get_dictionary())
    for param_name in keys:
        param_dict = p.tools.param.get_dictionary()[param_name]
        description = param_dict['description']
        if not isinstance(description, str):
            description = param_dict['description']['summary']

        parameters.append({
            'name': param_name,
            'value': stringify_parameter_value(p.parameters[param_name]),
            'type': param_dict['dtype'],
            'description': description,
            'visibility': param_dict['visibility']
        })

    return {
        'name': name,
        'info': p.docstring_info.get('info'),
        'synopsis': p.docstring_info.get('synopsis'),
        'warn': str(p.docstring_info.get('warn')),
        'parameters': parameters,
    }


def plugin_list_entry_to_dict(p):
    # Get plugin details
    pl = pu.plugins[p['name']]()
    pl._populate_default_parameters()

    # Format parameters
    parameters = []
    keys = pu.set_order_by_visibility(p['param'])
    for param_name in keys:
        param_dict = p['param'][param_name]
        description = param_dict['description']
        if not isinstance(description, str):
            # the description is a dict containing more info about the param,
            # and the param description is in the summary key of this dict
            description = param_dict['description']['summary']
            if 'options' in param_dict:
                options = list(param_dict['description']['options'].items())
                for i, (param, desc) in enumerate(options):
                    if desc is None:
                        options[i] = (param, str(desc))
        else:
            # the description is just a string
            if 'options' in param_dict:
                # If the options had descriptions as well, then the param
                # description would be a dict and not a string. Therefore,
                # since the param description is just a string, it can be
                # assumed that the options have no descriptions either
                options = [(option, 'None') for option in param_dict['options']]

        parameter_info = {
            'name': param_name,
            'value': stringify_parameter_value(p['data'][param_name]),
            'description': description,
            'visibility': param_dict['visibility']
        }

        if 'options' in param_dict:
            parameter_info['options'] = options

        parameters.append(parameter_info)

    return {
        'name': p['name'] ,
        'info': pl.docstring_info.get('info'),
        'synopsis': pl.docstring_info.get('synopsis'),
        'warn': str(pl.docstring_info.get('warn')),
        'doc_link': str(pl.docstring_info['documentation_link']),
        'parameters': parameters,
        'id': p['id'],
        'active': bool(p['active']),  # Convert from numpy bool
    }


def check_hdf5_file(filename, hdf5_paths):
    """
    Checks if a file is a valid HDF5 file and contains a set of paths.

    @param hdf5_paths List of paths to check exist in the HDF5 file
    """
    # Ignore files that do not have a .nxs extension
    if os.path.splitext(filename)[-1] not in ['.nxs']:
        return False

    try:
        # Open the NeXus file
        with h5py.File(filename, 'r') as f:
            for p in hdf5_paths:
                if p not in f:
                    return False
            return True
    except IOError:
        # If we can't open the NeXus file just assume it isn't valid
        # (even in the case where it is valid and just in use elsewhere we
        # couldn't use this file anyway)
        return False


def is_file_a_data_file(filename):
    """
    Checks if a file is valid raw tomography data.

    File is valid if:
        - Filename has .nxs extension
        - File is a valid HDF5 file
    """
    # TODO: can this check be improved? (e.g. checking for specific entries)
    return check_hdf5_file(filename, [])


def is_file_a_process_list(filename):
    """
    Checks if a file is a process list.

    File is valid if:
        - Filename has .nxs extension
        - File is a valid HDF5 file
        - HDF5 path /entry/plugin is present in file
    """
    return check_hdf5_file(filename, ['/entry/plugin'])


def validate_file(filename, pred):
    """
    Checks that a file exists and passes a validation step.
    """
    if not filename:
        return False

    if not os.path.exists(filename):
        return False

    return pred(filename)


def to_bool(val, default=False):
    """
    Attempts to convert something to a boolean in a sensible way.
    """
    if val is None:
        return default

    if isinstance(val, bool):
        return val

    from distutils.util import strtobool
    return bool(strtobool(val))


def create_process_list_from_user_data(data):
    """
    Creates a process list from user supplied data.
    """
    process_list = Content()

    # For each plugin
    for i, pl in enumerate(data['plugins']):
        pos = str(i + 1)

        # Add plugin
        process_list.add(pl['name'], pos)

        # Set plugin enable state
        process_list.on_and_off(
            pos,
            const.PLUGIN_ENABLED if pl['active'] else const.PLUGIN_DISABLED)

        # Set parameter values
        for param in pl['parameters']:
            cast_param_val = process_list.value(param['value'])
            process_list.modify(pos, param['name'], cast_param_val, ref=True)

    return process_list


def find_files_recursive(path, pred):
    for dirpath, dirnames, filenames in os.walk(path, followlinks=False):
        for fn in filenames:
            ffn = os.path.join(dirpath, fn)
            if pred(ffn):
                yield ffn


def stringify_parameter_value(value):
    """
    See display_formatter.py
    """
    return str(value).replace("'", "")
