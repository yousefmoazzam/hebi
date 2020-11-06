function getAvailablePlugins(callback, error) {
  jsonGet("/api/plugin", callback, error);
}

function getPluginCollections(callback, error) {
  jsonGet("api/plugin_collections", callback, error)
}

function searchAvailablePlugins(query, callback, error) {
  jsonGet("/api/plugin?q=" + query, callback, error);
}

function getPluginDetails(pluginName, callback, error) {
  jsonGet("/api/plugin/" + pluginName, callback, error);
}

function getAvailableProcessLists(searchPath, callback, error) {
  jsonGet("/api/process_list?path=" + searchPath, callback, error);
}

function getProcessList(filename, callback, error) {
  jsonGet("/api/process_list?filename=" + filename, callback, error);
}

function newProcessList(filename, content, callback, error) {
  jsonPost("/api/process_list?filename=" + filename, content, callback, error);
}

function updateProcessList(filename, content, callback, error) {
  jsonPut("/api/process_list?filename=" + filename, content, callback, error);
}

function deleteProcessList(filename, callback, error) {
  jsonDelete("/api/process_list?filename=" + filename, callback, error);
}

function getAvailableDatasets(searchPath, callback, error) {
  jsonGet("/api/data/find?path=" + searchPath, callback, error);
}

function submitJob(queue, dataset, process_list, output_path, callback, error) {
  jsonGet("/api/jobs/" + queue + "/submit?process_list=" + process_list + "&dataset=" + dataset + "&output=" + output_path, callback, error);
}

function getJobStatus(queue, jobId, callback, error) {
  jsonGet("/api/jobs/" + queue + "/" + jobId, callback, error);
}

function getDefaultPaths(callback, error) {
  jsonGet("/api/default_paths", callback, error);
}

function getProcessListDownloadUrl(filename) {
  return "/api/process_list/download?filename=" + filename;
}

function modifyParamVal(data, callback, error) {
  jsonPut("/api/plugin/modify_param_val", data, callback, error);
}

function getDirStructure(callback, error) {
  jsonGet("/api/dir_structure", callback, error)
}
