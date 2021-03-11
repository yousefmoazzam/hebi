import { jsonGet, jsonPut, jsonPost, jsonDelete, textDownload } from './api_common.js'

export function getAvailablePlugins(callback, error) {
  jsonGet("/api/plugin", callback, error);
}

export function getPluginCollections(callback, error) {
  jsonGet("api/plugin_collections", callback, error)
}

export function searchAvailablePlugins(query, callback, error) {
  jsonGet("/api/plugin?q=" + query, callback, error);
}

export function getPluginDetails(pluginName, callback, error) {
  jsonGet("/api/plugin/" + pluginName, callback, error);
}

export function addPluginToProcessList(pluginName, callback, error) {
  jsonGet("/api/add_plugin/" + pluginName, callback, error);
}

export function getAvailableProcessLists(searchPath, callback, error) {
  jsonGet("/api/process_list?path=" + searchPath, callback, error);
}

export function getProcessList(filename, callback, error) {
  jsonGet("/api/process_list?filename=" + filename, callback, error);
}

export function newProcessList(filename, content, callback, error) {
  jsonPost("/api/process_list?filename=" + filename, content, callback, error);
}

export function updateProcessList(filename, content, callback, error) {
  jsonPut("/api/process_list?filename=" + filename, content, callback, error);
}

export function deleteProcessList(filename, callback, error) {
  jsonDelete("/api/process_list?filename=" + filename, callback, error);
}

export function getAvailableDatasets(searchPath, callback, error) {
  jsonGet("/api/data/find?path=" + searchPath, callback, error);
}

export function submitJob(queue, dataset, process_list, output_path, callback, error) {
  jsonGet("/api/jobs/" + queue + "/submit?process_list=" + process_list + "&dataset=" + dataset + "&output=" + output_path, callback, error);
}

export function getJobStatus(queue, jobId, callback, error) {
  jsonGet("/api/jobs/" + queue + "/" + jobId, callback, error);
}

export function getDefaultPaths(callback, error) {
  jsonGet("/api/default_paths", callback, error);
}

export function getProcessListDownloadUrl(filename) {
  return "/api/process_list/download?filename=" + filename;
}

export function modifyParamVal(data, callback, error) {
  jsonPut("/api/plugin/modify_param_val", data, callback, error);
}

export function checkPlExists(filename, callback, error) {
  jsonGet("/api/check_pl_exists?filename=" + filename, callback, error)
}

export function searchPlugins(query, callback, error) {
  jsonGet("/api/plugin/search?q=" + query, callback, error);
}

export function getPluginBrowserInfo(query, callback, error) {
  jsonGet("/api/plugin_browser/info?q=" + query, callback, error)
}

export async function downloadPluginCitation(info, type) {
  var file_content = ''

  // get framework citations first
  var frameworkCitationsUrl = "/api/framework_citations/download" + "?q=" + type
  var frameworkCitations = await textDownload(frameworkCitationsUrl)
  file_content += frameworkCitations['text']

  // then get plugin citations
  for (var idx = 0; idx < info['plugins'].length; idx++) {
    var url = "/api/plugin/download/citation/" + info['plugins'][idx] + "?q=" +
      type
    var data = await textDownload(url)
    file_content += data['text']
  }

  var blob = new Blob([file_content], {type: data['type']})
  var url = window.URL.createObjectURL(blob)
  var a = document.createElement('a');
  a.download = info['filename'] + '.' + type
  a.href = url;
  a.click();
}

export function getFrameworkCitations(callback, error) {
  jsonGet("/api/framework_citations", callback, error)
}
