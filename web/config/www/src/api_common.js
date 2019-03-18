// TODO: these functions could likely use fetch() instead

// Performs a GET request and receives a plain text response.
function plainTextGet(url, callback, error) {
  $.ajax({
    url: url,
    method: "GET",
    dataType: "text",
    success: function(data) {
      callback(data);
    },
    error: function(resp) {
      console.log("GET request failed: " + resp.status);
      error();
    }
  });
}

// Performs a GET request and receives an XML response.
function xmlGet(url, callback, error) {
  $.ajax({
    url: url,
    method: "GET",
    dataType: "xml",
    success: function(data) {
      callback(data);
    },
    error: function(resp) {
      console.log("GET request failed: " + resp.status);
      error();
    }
  });
}

// Performs a GET request and receives a JSON response.
function jsonGet(url, callback, error) {
  $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
    success: function(data) {
      callback(data);
    },
    error: function(resp) {
      console.log("GET request failed: " + resp.status);
      error();
    }
  });
}

// Performs a POST request and receives a JSON response.
function jsonPost(url, inData, callback, error) {
  $.ajax({
    url: url,
    method: "POST",
    data: JSON.stringify(inData),
    contentType: "application/json",
    dataType: "json",
    success: function(data) {
      callback(data);
    },
    error: function(resp) {
      console.log("POST request failed: " + resp.status);
      error();
    }
  });
}

// Performs a PUT request and receives a JSON response.
function jsonPut(url, inData, callback, error) {
  $.ajax({
    url: url,
    method: "PUT",
    data: JSON.stringify(inData),
    contentType: "application/json",
    dataType: "json",
    success: function(data) {
      callback(data);
    },
    error: function(resp) {
      console.log("PUT request failed: " + resp.status);
      error();
    }
  });
}

// Performs a DELETE request and receives a JSON response.
function jsonDelete(url, callback, error) {
  $.ajax({
    url: url,
    method: "DELETE",
    dataType: "json",
    success: function(data) {
      callback(data);
    },
    error: function(resp) {
      console.log("DELETE request failed: " + resp.status);
      error();
    }
  });
}
