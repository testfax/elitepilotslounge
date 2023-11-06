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
const journalEvent = "Logs"

//FUNCTIONS FROM CLICKING
window.addEventListener("click", clickedEvent);
function clickedEvent(evt) {
  //Use arraySearch(f) to parse through something your looking for in an array or if you are comparing multiple arrays. 
  //    Combines forEach and find loop methods.
  //    In this parent function, we are only selecting one item to look for, which we will put in an array anyways for the 
  //        arraySearch() function to properly work.
    const clickedEvent = [evt.target.getAttribute('id')]

    const nonUiEvents = ['expandall','collapseall']
    const events = arraySearch(nonUiEvents,clickedEvent)
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
    }
    else {
      drop(clickedEvent[0],journalEvent) //review function for HTML class requirements.
    }
}

ipcRenderer.send('fetchLatestLog',"derp");
ipcRenderer.on('LogsDisplay', (event) => { 
    insertAtTop(event);
    function insertAtTop(elements) {
        const container = document.getElementById("Logs_container");
        const firstChild = findFirstElementChild(container)
        function findFirstElementChild(node) {
            let child = node.firstChild;
            while (child && child.nodeType !== 1 /* Node.ELEMENT_NODE */) {
              child = child.nextSibling;
            }
            return child;
        }
        logNestede(elements)
        function logNestede(obj, parentKey = '', indent = 0) {
            const indentation = '&nbsp;&nbsp;'.repeat(indent); // Two spaces for each level of indentation
            
            Object.entries(obj).forEach(([key, value]) => {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                
                if (typeof value === 'object' && value !== null) {
                const header = document.createElement('div');
                  header.innerHTML = `          ${indentation}${key}: {`;
                
                firstChild.appendChild(header);
            
                logNestede(value, fullKey, indent + 1); // Recursively call the function for nested objects.
            
                const footer = document.createElement('div');
                footer.innerHTML = `${indentation}},`;
                firstChild.appendChild(footer);
                } else {
                const logEntry = document.createElement('div');
                logEntry.innerHTML = `${indentation}${key}: ${value},`;
                firstChild.appendChild(logEntry);
                }
            });
        }
      }
})
ipcRenderer.on('buildLogsDisplay', (event) => { 
    const container = document.getElementById("Logs_container")
    logNestedItems(event.reverse())
    function logNestedItems(obj, parentKey = '', indent = 0) {
        const indentation = '&nbsp;&nbsp;'.repeat(indent); // Two spaces for each level of indentation
      
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
            
          if (typeof value === 'object' && value !== null) {
            const header = document.createElement('div');
            if (typeof key == 'number' || key == '') { 
              header.innerHTML = `          ${indentation}${key}: {`;
            }
            else {
              header.innerHTML = `          ${indentation} {`;
            }
            container.appendChild(header);
      
            logNestedItems(value, fullKey, indent + 1); // Recursively call the function for nested objects.
      
            const footer = document.createElement('div');
            footer.innerHTML = `${indentation}},`;
            container.appendChild(footer);
          } else {
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `${indentation}${key}: ${value},`;
            container.appendChild(logEntry);
          }
        });
      }
      
 })