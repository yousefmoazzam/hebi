class JobWidget {
  queue = null;
  jobId = null;

  constructor(container, resultsAvailable) {
    // Callback for when job results become available
    this.resultsAvailable = resultsAvailable;

    // Socket.io client for job status updates
    this.socket = io.connect(":" + location.port + "/job_status");
    this.socket.on("status", this.updateJobStatus);

    var grid = newElementOfClass("div", "grid-y", container);

    // Data file selection
    var dataInputContainer = newElementOfClass("div", "cell input-group", grid);
    foundationInputLabel("Data", dataInputContainer);
    this.dataInput = foundationTextInput(dataInputContainer);
    this.dataInput.setAttribute("placeholder", "data.nxs");

    // Process list selection
    var processListInputContainer = newElementOfClass("div", "cell input-group", grid);
    foundationInputLabel("Process List", processListInputContainer);
    this.processListInput = foundationTextInput(processListInputContainer);
    this.processListInput.setAttribute("placeholder", "process_list.nxs");

    // Output path selection
    var outputInputContainer = newElementOfClass("div", "cell input-group", grid);
    foundationInputLabel("Output", outputInputContainer);
    this.outputInput = foundationTextInput(outputInputContainer);
    this.outputInput.setAttribute("placeholder", "/path/to/output");

    // Run job buttons
    var runButtonContainer = newElementOfClass("div", "cell", grid);
    var runButtonGroup = newElementOfClass("div", "button-group expanded", grid);

    // Handle submission request buttons for a given queue
    var buttonHandler = (e) => {
      var queue = e.target.getAttribute("data-job-queue");
      var dataFile = this.dataInput.value;
      var processList = this.processListInput.value;
      var outputPath = this.outputInput.value;
      submitJob(queue, dataFile, processList, outputPath, (data) => {
        this.queue = data.queue;
        this.jobId = data.job.id;

        // Subscribe to job updates
        this.socket.emit("join", {"queue": this.queue, "job": this.jobId});
      }, () => {
        this.setStatusText("Failed to submit job.", "bad");
      });
    };

    // Preview queue
    var runPreviewButton = newElementOfClass("button", "button", runButtonGroup);
    runPreviewButton.innerText = "Preview";
    runPreviewButton.setAttribute("data-job-queue", "preview");
    runPreviewButton.addEventListener("click", buttonHandler);

    // Full queue
    var runFullButton = newElementOfClass("button", "button warning", runButtonGroup);
    runFullButton.innerText = "Full";
    runFullButton.setAttribute("data-job-queue", "full");
    runFullButton.addEventListener("click", buttonHandler);

    // Job status indicator
    var statusContainer = newElementOfClass("div", "cell", grid);
    var statusGrid = newElementOfClass("div", "grid-x", statusContainer);

    var statusLineContainer = newElementOfClass("div", "cell auto", statusGrid);
    var statusLine = newElement("p", statusLineContainer);
    statusLine.innerText = "Status: ";
    this.statusText = newElement("span", statusLine);

    // simple display of user.log output using a div to contain the text
    var logContainer = newElementOfClass("div", "cell", grid);
    var logLine = newElement("div", logContainer);
    this.logText = newElement("span", logLine);
  }

  setStatusText = (text, textClass) => {
    this.statusText.innerText = text;
    this.statusText.className = textClass;
  }

  updateJobStatus = (data) => {
    var text = "job " + data.job.id + " ";
    var style = "bad";

    if (data.job.running) {
      text += "running";
      style = "amber";
    } else if (data.job.successful) {
      text += "success";
      style = "good";
    } else {
      text += "failed (" + data.job.status + ")";
    }

    if (!data.job.running) {
      // Unsubscribe from job updates
      this.socket.emit("leave", {"queue": this.queue, "job": this.jobId});
    }

    this.setStatusText(text, style);
    this.logText.innerText = data.job.logfile.join("\n");

    // Check for available results
    if (data.job.successful) {
      this.resultsAvailable(data.job.output_dataset);
    }
  }

  setDataFile = (filename) => {
    this.dataInput.value = filename;
  }

  setProcessList = (filename) => {
    this.processListInput.value = filename;
  }

  setOutputPath = (path) => {
    this.outputInput.value = path;
  }
}
