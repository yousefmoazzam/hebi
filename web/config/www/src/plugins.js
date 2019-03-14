function addTableItem(row, text) {
  var rowItem = newElement("td", row);
  var itemText = document.createTextNode(text);
  rowItem.appendChild(itemText);
}

function selectPlugin(name) {
  getPluginDetails(name, function(plugin) {
    // Set text fields
    document.getElementById("selected_plugin_name").innerText = name;
    document.getElementById("selected_plugin_synopsis").innerText = plugin.synopsis;
    document.getElementById("selected_plugin_info").innerText = plugin.info;

    // Remove old parameters and citations
    $("#selected_plugin_parameter_table_body >").remove();
    $("#selected_plugin_citation_table_body >").remove();

    // Add new parameters
    var parameterTable = document.getElementById("selected_plugin_parameter_table_body");
    for (var param of plugin.parameters) {
      var row = newElement("tr", parameterTable);
      addTableItem(row, param.name);
      addTableItem(row, param.description);
      addTableItem(row, param.type);
      addTableItem(row, param.value);
    }

    // Citation
    var citationTable = document.getElementById("selected_plugin_citation_table_body");
    for (var cite of plugin.citation) {
      var row = newElement("tr", citationTable);
      addTableItem(row, cite.description);
      addTableItem(row, cite.doi);
      addTableItem(row, cite.bibtex);
      addTableItem(row, cite.endnote);
    }
    document.getElementById("citation").hidden = (plugin.citation.length == 0);

    // Show plugin pane
    document.getElementById("plugin-pane").hidden = false;
  }, function() {
    console.log("Failed to query plugin details");
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  var searchField = document.getElementById("search_field");

  var updatePluginListSearch = function() {
    // Get query string
    var query = document.getElementById("search_field").value;

    // Get search results
    searchAvailablePlugins(query, function(plugins) {
      var table = document.getElementById("plugin_table_body");

      // Remove old search results
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }

      // Add new results
      for (var pl of plugins) {
        var row = document.createElement("tr");
        table.appendChild(row);
        addTableItem(row, pl);
        row.addEventListener("click", function(e) {
          var pluginName = e.target.textContent;
          selectPlugin(pluginName);
        });
      }

      // Automatically select top result when searching
      selectPlugin(plugins[0]);
    }, function() {
      console.log("Failed to list available plugins");
    });
  };

  // Add enough event listeners to track any change in the text box
  searchField.addEventListener("change", updatePluginListSearch);
  searchField.addEventListener("keypress", updatePluginListSearch);
  searchField.addEventListener("paste", updatePluginListSearch);
  searchField.addEventListener("input", updatePluginListSearch);

  // Set initial search text box state
  searchField.value = "";
  updatePluginListSearch();

  // Initially hide plugin pane
  document.getElementById("plugin-pane").hidden = true;
});
