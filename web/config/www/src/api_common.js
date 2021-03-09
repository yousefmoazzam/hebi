import $ from 'jquery'
// TODO: these functions could likely use fetch() instead

// Performs a GET request and receives a plain text response.
export function plainTextGet(url, callback, error) {
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
export function xmlGet(url, callback, error) {
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
export function jsonGet(url, callback, error) {
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
export function jsonPost(url, inData, callback, error) {
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
export function jsonPut(url, inData, callback, error) {
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
export function jsonDelete(url, callback, error) {
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

export function textDownload(url) {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/text'
      }
    }).then(resp => {
      var a = resp.body.getReader()
      a.read().then(({ done, value }) => {
        // get filename from Content-Disposition in response header
        // regex taken from https://stackoverflow.com/a/23054920
        var contentDisposition = resp.headers.get('Content-Disposition')
        var filename = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1]
        var text = new TextDecoder("utf-8").decode(value)
        var data = {
          'text': text,
          'type': 'application/' + resp.type,
          'filename': filename
        }
        resolve(data)
      })
    })
  })
}
