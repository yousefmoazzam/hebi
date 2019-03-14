class PluginEditor {
  pluginElements = [];

  constructor(container, onFileModify) {
    // Add filename editor
    var fileSelection = newElementOfClass("div", "input-group", container);
    foundationInputLabel("File", fileSelection);
    this.fileSelectionInput = foundationTextInput(fileSelection);
    this.fileSelectionInput.setAttribute("placeholder", "process_list.nxs");

    // "Save Changes" button, updates an existing process list
    var fileSelectionSaveChangesButton = foundationButton("Save Changes", "", fileSelection);
    fileSelectionSaveChangesButton.addEventListener("click", () => {
      var filename = this.fileSelectionInput.value;
      updateProcessList(filename, this.generateProcessListObject(), (pl) => {
        console.log("Process list save (update) done");
        this.update(pl);
        onFileModify();
      }, () => {
        alert("Failed to save (update) process list");
      });
    });

    // "Save As New" button, saves a new proocess list
    var fileSelectionSaveAsNewButton = foundationButton("Save As New", "secondary", fileSelection);
    fileSelectionSaveAsNewButton.addEventListener("click", () => {
      var filename = this.fileSelectionInput.value;
      newProcessList(filename, this.generateProcessListObject(), (pl) => {
        console.log("Process list save (new) done");
        this.update(pl);
        onFileModify();
      }, () => {
        alert("Failed to save (new) process list");
      });
    });

    var scrollArea = newElementOfClass("div", "scroll", container);

    // Container <div> for plugin configuration
    this.pluginContainer = newElement("div", scrollArea);

    var pluginSelection = newElementOfClass("div", "input-group", scrollArea);

    // List of autocomplete options for plugin names
    this.pluginDatalist = newElement("datalist", pluginSelection);
    this.pluginDatalist.setAttribute("id", "available_plugins");
    getAvailablePlugins((plugins) => {
      for (var p of plugins) {
        var o = newElement("option", this.pluginDatalist);
        o.innerText = p;
      }
    }, () => {
      console.log("Failed to download list of available plugins");
    });

    // Plugin selection text box
    this.pluginSelectionInput = foundationTextInput(pluginSelection);
    this.pluginSelectionInput.setAttribute("type", "search");
    this.pluginSelectionInput.setAttribute("list", "available_plugins");

    // "Add Plugin" button, adds the selected plugin to the end of the process list
    var pluginSelectionButton = foundationButton("Add Plugin", "", pluginSelection);
    pluginSelectionButton.addEventListener("click", (e) => {
      var pluginName = this.pluginSelectionInput.value;
      this.addPluginByName(pluginName);
    });
  }

  generateProcessListObject = () => {
    var plugins = [];

    // For each plugin
    for (var plugin of this.pluginElements) {
      var parameters = [];
      // For each parameter
      for (var parameter of plugin.parameters) {
        // Add the parameter value
        parameters.push({
          "name": parameter.name,
          "value": parameter.field.value,
        });
      }

      // Add name, active/enabled flag and parameter list
      plugins.push({
        "name": plugin.name,
        "active": plugin.active.checked,
        "parameters": parameters,
      });
    }

    return {
      "plugins": plugins
    };
  }

  addPlugin = plugin => {
    var idx = this.pluginElements.length + 1;

    // Add a <div> to contain this plugin
    var pluginDiv = newElementOfClass("div", "plugin", this.pluginContainer);

    var pl = newElement("div", pluginDiv);

    // Header row for plugin details
    var header = newElementOfClass("div", "grid-x", pl);

    // Plugin name
    var headerName = newElementOfClass("div", "cell shrink", header);
    var headerNameH3 = newElementOfClass("h3", "plugin-title", headerName);
    var headerNameH3Index = newElementOfClass("span", "plugin-index", headerNameH3);
    headerNameH3Index.innerText = idx;
    var headerNameH3Name = newElement("span", headerNameH3);
    headerNameH3Name.innerText = plugin.name;
    helpIcon(plugin.synopsis, headerNameH3);

    // Plugin active/enabled switch
    var headerSwitch = newElementOfClass("div", "cell shrink action", header);
    var activeSwitch = checkbox("", plugin.active, "Active", headerSwitch);

    // Add some padding between name + enable switch and action icons
    newElementOfClass("div", "cell auto", header);

    // Add action icons
    var headerIcons = newElementOfClass("div", "cell shrink", header);
    icon("action fa-lg fa-trash", (e) => {
      var pluginIndexElement = e.target.parentNode.parentNode.getElementsByClassName("plugin-index")[0];
      var pluginIndex = parseInt(pluginIndexElement.innerText);
      this.deletePluginByIndex(pluginIndex);
    }, headerIcons);
    icon("action fa-lg fa-arrow-up", (e) => {
      var pluginIndexElement = e.target.parentNode.parentNode.getElementsByClassName("plugin-index")[0];
      var pluginIndex = parseInt(pluginIndexElement.innerText);
      this.movePluginByIndex(pluginIndex, -1);
    }, headerIcons);
    icon("action fa-lg fa-arrow-down", (e) => {
      var pluginIndexElement = e.target.parentNode.parentNode.getElementsByClassName("plugin-index")[0];
      var pluginIndex = parseInt(pluginIndexElement.innerText);
      this.movePluginByIndex(pluginIndex, 1);
    }, headerIcons);

    // Add a <table> to contain the plugin parameters
    var parameterTable = newElement("table", pluginDiv);
    var tableBody = newElement("tbody", parameterTable);

    // Record UI elements
    var elements = {
      "name": plugin.name,
      "active": activeSwitch,
      "parameters": [],
    };

    // Add parameters
    for (var parameterIdx in plugin.parameters) {
      var parameter = plugin.parameters[parameterIdx];
      var tableRow = newElement("tr", tableBody);

      // Parameter label
      var labelTd = newElementOfClass("td", "parameter-name", tableRow);
      labelTd.innerText = parameter.name;
      helpIcon(parameter.description, labelTd);

      // Parameter value
      var valueTd = newElement("td", tableRow);
      var valueEdit = newElementOfClass("input", "parameter-value", valueTd);
      valueEdit.setAttribute("type", "text");
      valueEdit.value = parameter.value;

      // Record UI elements
      elements.parameters.push({
        "name": parameter.name,
        "field": valueEdit,
      });
    }

    // Record UI elements
    this.pluginElements.push(elements);
  }

  update = processList => {
    // Set loaded process list filename
    this.fileSelectionInput.value = processList.filename;

    // Remove existing plugin listing
    $(this.pluginContainer).empty();

    // Reset state
    this.pluginElements = [];

    // Add plugins
    for (var pl of processList.plugins) {
      this.addPlugin(pl);
    }
    this.updatePluginIndices();
  }

  addPluginByName = name => {
    // Get plugin details
    getPluginDetails(name, (plugin) => {
      // Default to plugin being active/enabled
      plugin.active = true;
      // Add to UI
      this.addPlugin(plugin);
      this.updatePluginIndices();
    }, () => {
      alert("Plugin \"" + name + "\" not found");
    });
  }

  deletePluginByIndex = idx => {
    // Remove section from UI
    var pluginDiv = this.pluginContainer.getElementsByClassName("plugin")[idx];
    pluginDiv.remove();

    // Remove cached elements
    this.pluginElements.splice(idx, 1);

    this.updatePluginIndices();
  }

  movePluginByIndex = (idx, direction) => {
    // Nothing to do in this case
    if (direction == 0) {
      return;
    }

    // Calculate new position (plugin to swap position with
    var newPosition = idx + direction;

    // Check the new position is within the valid plugin indices
    if (newPosition < 0 || newPosition > this.pluginElements.length - 1) {
      console.log("New position (" + newPosition + ") not valid");
      return;
    }

    var pluginDivs = this.pluginContainer.getElementsByClassName("plugin");
    var thisPluginDiv = pluginDivs[idx];
    var otherPluginDiv = pluginDivs[newPosition];

    // Reorder UI elements
    if (direction < 0) {
      otherPluginDiv.before(thisPluginDiv);
    } else {
      otherPluginDiv.after(thisPluginDiv);
    }

    // Reorder cached elements
    var thisCache = this.pluginElements.splice(idx, 1)[0];
    this.pluginElements.splice(newPosition, 0, thisCache);

    this.updatePluginIndices();
  }

  updatePluginIndices = () => {
    var pluginDivs = this.pluginContainer.getElementsByClassName("plugin");

    for (var i = 0; i < pluginDivs.length; i++) {
      var d = pluginDivs[i];

      // Set the visible index
      d.getElementsByClassName("plugin-index")[0].innerText = i;

      // Set the switch IDs
      var activeId = "active_pligin_idx_" + i;
      var activeSwitch = d.getElementsByClassName("switch")[0];
      activeSwitch.getElementsByTagName("input")[0].setAttribute("id", activeId);
      activeSwitch.getElementsByTagName("label")[0].setAttribute("for", activeId);
    }
  }
}
