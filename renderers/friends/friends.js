let myClassSave = null;
const windowLoaded =  new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { 

  //FUNCTIONS FROM MOUSEOVER
  const pointer = document.getElementsByClassName("pointer")
  Array.from(pointer).forEach((point)=>{
    point.addEventListener("mouseover", function(event) {
      let target = event.target
      if (target.classList.contains("pointer")) {
        target.classList.remove('w3-black')
        target.classList.add('w3-idontexist')
      }
    })
    point.addEventListener("mouseout", function(event) {
      let target = event.target
      if (target.classList.contains("pointer")) {
        target.classList.remove('w3-idontexist')
        target.classList.add('w3-black')
      }
    });
  })


});

//resource variables
// const journalEvent = "Materials"
const tooltipObject = {
  launchResearchLimpet: "Research Limpets Launched",
  launchCollectorLimpet: "Collector Limpets Launched",
  launchRepairLimpet: "Repair Limpets Launched",
};
// Find all elements with the "tooltip-element" class and create a Tooltip instance for each
const elementsWithTooltip = document.querySelectorAll(".tooltip-element");
elementsWithTooltip.forEach(element => new Tooltip(element));
//FUNCTIONS FROM CLICKING
window.addEventListener("click", clickedEvent);
function clickedEvent(evt) {
  //Use arraySearch(f) to parse through something your looking for in an array or if you are comparing multiple arrays. 
  //    Combines forEach and find loop methods.
  //    In this parent function, we are only selecting one item to look for, which we will put in an array anyways for the 
  //        arraySearch() function to properly work.
    const clickedEvent = [evt.target.getAttribute('id')] //id="guardian_moduleblueprint_checkbox"
    
    let clickedEventMod = clickedEvent[0]
    let clickedNameEvent = null;
    try {
      clickedEventMod = clickedEventMod.split("_")
      clickedNameEvent = [clickedEventMod.pop()]
      if (clickedEventMod.length >= 2) { clickedEventMod = [clickedEventMod.join("_")]; }

    }
    catch (e) {
    }
    const nonUiEvents = ['expandall','collapseall','checkbox']
    const events = arraySearch(nonUiEvents,clickedNameEvent)
    if (events.found.length) {
      if (evt.target.hasAttribute('expandall')) {
        const allExpansion = document.getElementsByClassName('expansion')
        document.getElementById('collapseall').innerText = "radio_button_unchecked"
        document.getElementById('expandall').innerText = "radio_button_checked"
        Array.from(allExpansion).forEach(item => {
          if (item.classList.contains('w3-hide')) {
            item.classList.remove('w3-hide')
            
          }
        })
      }
      if (evt.target.hasAttribute('collapseall')) { 
        const allExpansion = document.getElementsByClassName('expansion')
        document.getElementById('collapseall').innerText = "radio_button_checked"
        document.getElementById('expandall').innerText = "radio_button_unchecked"
        Array.from(allExpansion).forEach(item => {
          if (!item.classList.contains('w3-hide')) {
            item.classList.add('w3-hide')
          }
        })
      }
      if (events.found.find(i => i ==='checkbox') == 'checkbox') {
        const iname = document.getElementById(clickedEvent[0]); 
        let boxStatus = null;
        if (iname.innerText == 'check_box') { iname.innerText = 'check_box_outline_blank'; boxStatus = 0 }
        else { iname.innerText = 'check_box'; boxStatus = 1 }
        //Add code for checkboxes
      }
    }
    else {
      drop(clickedEvent[0])
    }
}
