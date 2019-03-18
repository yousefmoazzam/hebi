// Provides user controls for finding files.
class FileFinder {
  constructor(container, findFunc, actions) {
    this.findFunc = findFunc;
    this.actions = actions;

    var searchPath = newElementOfClass("div", "input-group", container);

    // Search path text box and "Refresh" button
    foundationInputLabel("Search Path", searchPath);
    this.searchPathInput = foundationTextInput(searchPath);
    var searchPathButton = foundationButton("Refresh", "", searchPath);
    searchPathButton.addEventListener("click", () => {
      this.updateListing();
    });

    // Results table
    var results = newElementOfClass("div", "scroll", container);
    var resultsTable = newElement("table", results);

    // Results table header, add at least "Filename" column header
    var tableHeader = newElement("thead", resultsTable);
    var tableHeaderRow = newElement("tr", tableHeader);
    var filenameHeader = newElement("th", tableHeaderRow);
    filenameHeader.innerText = "Filename";

    // Add empty headers for each action (each action icon is in a new table
    // cell)
    for (var i in actions) {
      newElement("th", tableHeaderRow);
    }

    // Store table body for dynamic population later
    this.tableBody = newElement("tbody", resultsTable);
  }

  // Updates the listed files with those found at a given path.
  updateListing = (searchPath) => {
    if (searchPath == null) {
      // Get search path from input field
      searchPath = this.searchPathInput.value;
    }

    // Get search results
    this.findFunc(searchPath, (data) => {
      // Update search path field with actual query path
      this.searchPathInput.value = data.path;

      // Remove old process list listings
      $(this.tableBody).empty();

      // List new process lists
      for (var filename of data.files) {
        // Create new table row
        var tr = newElement("tr", this.tableBody);

        // Add a cell with the filename
        var td = newElement("td", tr);
        td.innerText = filename;

        for (var actionName in this.actions) {
          var td = newElement("td", tr);

          var i = icon(this.actions[actionName].icon, (e) => {
            var processListName = e.target.getAttribute("pl-filename");
            var targetAction = e.target.getAttribute("pl-action");

            this.actions[targetAction].func(processListName);
          }, td);

          i.setAttribute("pl-filename", filename);
          i.setAttribute("pl-action", actionName);
        }
      }
    });
  }
}
