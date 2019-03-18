// Gets information about a dataset using the DAWN info API.
// Accepts a filename and returns on object desribing the dataset.
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

// Gets the URL to a slice of a dataset as a JPEG image.
// Accepts a filename and slice parameters as a string.
// Only two dimensions are allowed to be of size greater than one (no error will
// be raised but no image will be available at the returned URL).
function jpegSliceUrl(filename, slice) {
  return "/data/slice?format=JPG&path=" + filename + "&slice=" + slice;
}
