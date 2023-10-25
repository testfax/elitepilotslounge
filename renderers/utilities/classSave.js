class ClassSave {
  constructor(className) {
    this.className = className;
    this.elements = document.querySelectorAll('.' + className);
    this.innerHtmlValues = [];
    

    // Restore saved state from electron-store
    const savedState = window.electronStore.get(className);
    if (savedState) {
      this.restoreState(savedState);
    }

    // Attach event listeners to save state on input change
    this.elements.forEach((element, index) => {
      element.addEventListener('input', () => {
        this.innerHtmlValues[index] = element.innerHTML;
        this.saveState();
      });
      this.innerHtmlValues.push(element.innerHTML);
    });
  }
  
  clearAll() {
    window.electronStore.clear()
    console.log("Clear -> Get Store",window.electronStore.store);
  }

  showAll() {
    let info = window.electronStore.store
    console.log(info)
  }

  saveState(jsonArr = null) {
    if (jsonArr) {
      this.innerHtmlValues = jsonArr;
    } else {
      this.elements.forEach((element, a) => {
        this.innerHtmlValues[a] = element.innerHTML;
      });
    }
    window.electronStore.set(this.className, this.innerHtmlValues);
    // console.log("Name:",this.className, "Data", this.innerHtmlValues)
  }
  
  restoreState(savedState) {
    const state = savedState;
    this.elements.forEach((element, a) => {
      element.innerHTML = state[a];
      this.innerHtmlValues[a] = state[a];
    });
  }
}