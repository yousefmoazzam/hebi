from voluptuous import Schema, Required, Optional, All, Any, Length, Number, Extra

_string = Any(str, unicode)

_non_empty_string = All(_string, Length(min=1))

_parameter_value = _string

_citation = {
    Required('bibtex'): _string,
    Required('description'): _string,
    Required('endnote'): _string,
    Required('doi'): _string,
}

_parameter_basic = {
    Required('name'): _non_empty_string,
    Required('value'): _parameter_value,
}

_parameter_full = _parameter_basic.copy()
_parameter_full.update({
    Required('description'): _non_empty_string,
    Optional('type'): _non_empty_string,
    Optional('visibility'): _non_empty_string,
})

_plugin_basic = {
    Required('name'): _non_empty_string,
    Required('active'): bool,
    Required('parameters'): [_parameter_basic],
}

_plugin_full = {
    Required('name'): _non_empty_string,
    Required('active'): bool,
    Required('info'): _string,
    Required('synopsis'): _string,
    Required('warn'): _string,
    Required('citation'): [_citation],
    Required('id'): _non_empty_string,
    Required('parameters'): [_parameter_full],
}

server_configuration_schema = Schema({
    Required("data_location"): {
        Required("default"): _non_empty_string,
    },
    Required("process_list_location"): {
        Required("default"): _non_empty_string,
    },
    Required("output_location"): {
        Required("default"): _non_empty_string,
    },
    Required("job_runners"): {
        Extra: {
            Required("module"): _non_empty_string,
            Required("class"): _non_empty_string,
            Required("parameters"): dict,
        }
    }
})

query_plugin_list_schema = Schema([_non_empty_string])

get_plugin_info_schema = Schema({
    Required('name'): _non_empty_string,
    Required('info'): _string,
    Required('synopsis'): _string,
    Required('warn'): _string,
    Required('citation'): [_citation],
    Required('parameters'): [_parameter_full],
})

filename_listing_schema = Schema({
    Required('path'): _non_empty_string,
    Required('files'): [_non_empty_string],
})

process_list_list_filename_schema = Schema({
    Required('filename'): _non_empty_string,
    Required('plugins'): [_plugin_full],
})

process_list_update_schema = Schema({
    Required('plugins'): [_plugin_basic],
})

process_list_delete_schema = Schema({
    Required('filename'): _non_empty_string,
})

jobs_queue_info_schema = Schema({
    Required('queue'): _non_empty_string,
    Required('job'): {
        Required('id'): _non_empty_string,
        Required('running'): bool,
        Required('successful'): bool,
        Required('status'): _non_empty_string,
        Required('output_dataset'): Any(None, _non_empty_string),
        Required('logfile'): [_string],
    },
})
