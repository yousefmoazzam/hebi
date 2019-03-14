function generateId() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return "_"+(S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function newElement(tag, elemParent) {
  var e = document.createElement(tag);
  if (elemParent != null) {
    elemParent.appendChild(e);
  }
  return e;
}
function newElementOfClass(tag, elemClass, elemParent) {
  var e = newElement(tag, elemParent);
  e.setAttribute("class", elemClass);
  return e;
}

function checkbox(id, checked, text, elemParent) {
  var container = newElementOfClass("div", "switch", elemParent);

  // Add the active checkbox
  var input = newElementOfClass("input", "switch-input", container);
  input.setAttribute("id", id);
  input.setAttribute("type", "checkbox");
  input.checked = checked;

  // Add the label for the active checkbox
  var label = newElement("label", container);
  label.setAttribute("class", "switch-paddle");
  label.setAttribute("for", id);

  // Set label text
  var labelText = newElementOfClass("span", "show-for-sr", label);
  labelText.innerText = text;

  return input;
}

function icon(faId, onClick, elemParent) {
  var i = newElementOfClass("i", "fas " + faId, elemParent);
  i.addEventListener("click", onClick);
  return i;
}

function foundationInputLabel(label, elemParent) {
  var elem = newElementOfClass("span", "input-group-label", elemParent);
  elem.innerText = label;
  return elem;
}

function foundationTextInput(elemParent) {
  var elem = newElementOfClass("input", "input-group-field", elemParent);
  elem.setAttribute("type", "text");
  return elem;
}

function foundationButton(label, additionalStyle, elemParent) {
  var container = newElementOfClass("div", "input-group-button", elemParent);

  var elem = newElementOfClass("button", "button " + additionalStyle, container);
  elem.innerText = label;
  return elem;
}

function helpIcon(helpText, elemParent) {
  var span = newElement("span", elemParent);
  span.setAttribute("data-tooltip", "");
  span.setAttribute("class", "help top");
  span.setAttribute("title", helpText);

  var i = icon("fa-question", null, span);

  // Needed to draw tooltips correctly
  $(span).foundation();

  return i;
}
