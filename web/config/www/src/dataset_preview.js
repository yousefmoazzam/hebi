// Used to display dataset previews with user defined slice parameters.
class DatasetPreview {
  constructor(container, alwaysResetSliceParameters) {
    this.alwaysResetSliceParameters = alwaysResetSliceParameters;

    this.dataFile = null;
    this.shape = null;

    // Slice controls: text box and "Apply" button
    var slice = newElementOfClass("div", "input-group no-bottom-margin", container);
    // Slice parameters must be supplied as a string by the user and manually
    // applied.
    foundationInputLabel("Slice", slice);
    this.sliceInput = foundationTextInput(slice);
    // Image is updated when the user clicks on the "Apply" button
    var sliceButton = foundationButton("Apply", "", slice);
    sliceButton.addEventListener("click", () => {
      this.updateImage();
    });

    // Image element
    this.image = newElementOfClass("img", "preview", container);
  }

  // Sets the currently displayed data file.
  setDataFile = (filename) => {
    // Record filename
    this.dataFile = filename;

    getDataInfo(filename, (data) => {
      // Record dataset shape
      this.shape = data.shape.slice();

      // Set default slice parameters
      if (this.sliceInput.value.length == 0 || this.alwaysResetSliceParameters) {
        var slice = data.shape.slice();
        for (var i = 0; i < slice.length; i++) {
          if (i < 2) {
            slice[i] = ":";
          } else {
            slice[i] = 0;
          }
        }
        this.sliceInput.value = slice;
      }

      this.updateImage();
    }, () => {
      console.log("Failed to get file info for preview.");
    });
  }

  // Updates the image URL triggering the image to be reloaded in the browser.
  updateImage = () => {
    var url = jpegSliceUrl(this.dataFile, this.sliceInput.value);
    this.image.setAttribute("src", url);
  }
}
