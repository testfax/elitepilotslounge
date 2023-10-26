let myClassSave = null;
const windowLoaded = new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { });

//! DECLARE The Event!
const event = "Statistics"

//FUNCTIONS FROM CLICKING
window.addEventListener("click", clickedEvent);
function clickedEvent(evt) {
  //Use arraySearch(f) to parse through something your looking for in an array or if you are comparing multiple arrays. 
  //    Combines forEach and find loop methods.
  //    In this parent function, we are only selecting one item to look for, which we will put in an array anyways for the 
  //        arraySearch() function to properly work.
  const clickedEvent = [evt.target.getAttribute('id')]
    const nonUiEvents = []
    const events = arraySearch(nonUiEvents,clickedEvent)
    if (events.found.length) {
      // if (evt.target.hasAttribute('getbutton')) { myClassSave.showAll(); }
    }
    else {
      drop(clickedEvent) //review function for HTML class requirements.
    }
}
