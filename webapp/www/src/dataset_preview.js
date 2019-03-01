class DatasetPreview {
  constructor(container, alwaysResetSliceParameters) {
    this.alwaysResetSliceParameters = alwaysResetSliceParameters;

    this.dataFile = null;
    this.shape = null;

    // Slice controls
    var slice = newElementOfClass("div", "input-group no-bottom-margin", container);
    foundationInputLabel("Slice", slice);
    this.sliceInput = foundationTextInput(slice);
    var sliceButton = foundationButton("Apply", "", slice);
    sliceButton.addEventListener("click", () => {
      this.updateImage();
    });

    // Image element
    this.image = newElementOfClass("img", "preview", container);
  }

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

  updateImage = () => {
    var url = jpegSliceUrl(this.dataFile, this.sliceInput.value);
    this.image.setAttribute("src", url);
  }
}
