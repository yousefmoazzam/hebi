document.addEventListener("DOMContentLoaded", function(event) {
  $(document).foundation();

  var dataPreview = new DatasetPreview(document.getElementById("data-preview"), true);
  var processingPreview = new DatasetPreview(document.getElementById("processing-preview"), false);

  var jobWidget = new JobWidget(document.getElementById("job"), (resultsFilename) => {
    // Populate the processed dataset in the preview
    processingPreview.setDataFile(resultsFilename);

    // Switch to result preview tab
    $("#right-pane-tabs").foundation("selectTab", $("#right-pane-preview"));
  });

  var dataFileFinder = new FileFinder(document.getElementById("data-finder"), getAvailableDatasets, {
    "open": {
      "icon": "fa-folder-open",
      "func": (name) => {
        // Set filename in job submission widget
        jobWidget.setDataFile(name);
        // Set filename in dataset preview
        dataPreview.setDataFile(name);
      }
    }
  });

  var pluginEditor = new PluginEditor(document.getElementById("process-list-editor"), () => {
    processListFileFinder.updateListing();
  });

  var processListFileFinder = new FileFinder(document.getElementById("process-list-finder"), getAvailableProcessLists, {
    "open": {
      "icon": "fa-folder-open",
      "func": (name) => {
        // Set filename in job submission widget
        jobWidget.setProcessList(name);

        // Open process list
        getProcessList(name, (data) => {
          pluginEditor.update(data);
        }, () => {
          alert("Failed to get process list");
        });
      }
    },
    "download": {
      "icon": "fa-download",
      "func": (name) => {
        // Open process list download URL
        var url = getProcessListDownloadUrl(name);
        window.open(url, "_blank");
      }
    },
    "delete": {
      "icon": "fa-trash",
      "func": (name) => {
        deleteProcessList(name, () => {
          // Update process list listing when one is deleted
          processListFileFinder.updateListing();
        }, () => {
          alert("Failed to delete process list");
        });
      }
    }
  });

  // Set default paths
  getDefaultPaths((paths) => {
    dataFileFinder.updateListing(paths.data);
    processListFileFinder.updateListing(paths.process_list);
    jobWidget.setOutputPath(paths.output);
  }, () => {
    console.log("Could not set default paths");
  });
});
