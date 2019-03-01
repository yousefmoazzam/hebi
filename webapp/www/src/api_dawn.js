function getDataInfo(filename, callback, error) {
  plainTextGet("/data/info?path=" + filename, (rawData) => {
    var dataParts = rawData.split("\n");
    var data = {
      "datasetName": dataParts[0],
      "shape": JSON.parse(dataParts[1]),
      "datatypeClass": dataParts[2],
      "elementsPerItem": dataParts[3],
    };
    callback(data);
  }, error);
}

function jpegSliceUrl(filename, slice) {
  return "/data/slice?format=JPG&path=" + filename + "&slice=" + slice;
}
