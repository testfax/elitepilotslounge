let myClassSave = null;
const windowLoaded = new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { myClassSave = new ClassSave('EngineerProgress'); });

//! DECLARE The Event!
const event = "EngineerProgress"

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
      drop(clickedEvent[0]) //review function for HTML class requirements.
    }
}

//Get engineering arrays from file.
const FET = {
  method: "GET",
  filePath: ["../../events/Appendix/engineers.json","../../events/Appendix/blueprints/personalEquipment.json"]
}
//Gets data from electron-store.
let data = getEventFromStore(event);
let incomingData = data
let combinedEngineering = arrayCombiner(fetcher(FET),incomingData);
async function arrayCombiner(engineer_array, incomingArray) {
  let appendix = await engineer_array
  let = space_Appendix = await appendix[0]
  let = ground_Appendix = await appendix[1]
  //reduce the event data with the engineers json file to show where you are at with all engineers.
  let updatedEngineerArray = await incomingArray.Engineers.reduce((engineerArray, incomingEngineer) => {
    const existingIndex = engineerArray.Engineers.findIndex((engineer) => engineer.Engineer === incomingEngineer.Engineer);

    if (existingIndex === -1) { engineerArray.Engineers.push(incomingEngineer); } 
    else {  engineerArray.Engineers[existingIndex] = { ...engineerArray.Engineers[existingIndex], ...incomingEngineer }; }

    return engineerArray;
  }, space_Appendix);
  // console.log(updatedEngineerArray.Engineers)
  //After the above is completed, next step is to add the "Modifications".name to the blueprints array per engineer.
  const masterEngineerArray = await updatedEngineerArray.Engineers.reduce((acc, engineer) => {
    const matchingMods = ground_Appendix.Modifications.filter(mod => {
      return mod.Engineers.some(modEngineer => modEngineer.Engineer === engineer.Engineer)
    })
    const blueprints = matchingMods.map(mod => mod.name)
    return [
      ...acc,
      {
        ...engineer,
        blueprints: [...engineer.blueprints, ...blueprints]
      }
    ]
  }, [])
  return await masterEngineerArray
}

if (combinedEngineering) { innerStuff(combinedEngineering,event); }
//Gets data from event handler. (real time data)
ipcRenderer.on('EngineerProgress', (combinedEngineering) => { innerStuff(combinedEngineering,event); });


async function innerStuff(combinedEngineering,event) {
  //document.getElementById('someElementId').innerHTML = 'Some Change';  //edits go here
 
    const container = document.getElementById("engineers-Dom-Container")
 
  
    //ITERATE NEW DATA INTO CG-DOM
    if (container.classList.contains("engineers-Dom-Created")) {
      
      combinedEngineering.then(theEngineers=>{
        // console.log(theEngineers);
        data.Engineers.forEach(engineer => {
          if (document.getElementById(`${Object.keys(engineer)}`)) {
            document.getElementById(`engineer-${Object.keys(engineer.EngineerID)}`).innerText = Object.values(engineer.Engineer)
          }
        });
      })
    }
    //CREATE THE DOM
    if (!container.classList.contains("engineers-Dom-Created")) {
      container.classList.add("engineers-Dom-Created")
      combinedEngineering.then(theEngineers=>{
        // setTimeout(() => {
        //   console.log(theEngineers[4]) 
        // },500);
        const orderArray = [
          "blueprints",
          "Location_Name",
          "Location_System",
          "Location_Distance",
          "Engineer_type",
          "howDiscover",
          "meetingRequirement",
          "unlockRequirement",
          "repGain",
          "RankProgress",
          "Progress",
          "Rank",
          "Engineer",
          "EngineerID"
        ]
        const reorderedEngineers = theEngineers.map((anEngineer) => {
          return orderArray.reduce((newEngineer, key) => {
           
              newEngineer[key] = anEngineer[key];
              return newEngineer;
            
          }, {});
        });
        reorderedEngineers.forEach(anEngineer=> {
          const div1 = document.createElement("div")
          container.appendChild(div1)
          const br1 = document.createElement("br")
          container.appendChild(br1)
          div1.setAttribute("class","w3-row w3-border w3-round w3-xlarge w3-dark-gray")

          const div2 = document.createElement("div");
          div1.appendChild(div2);
          div2.setAttribute('id',`engineer-${anEngineer.EngineerID}`)
          div2.setAttribute('class',"w3-text-orange pointer w3-black w3-border w3-round font-BLOCKY")
          div2.setAttribute('data-attribute',`engineer-${anEngineer.EngineerID}`)

          const i1 = document.createElement('i')
          div2.appendChild(i1);
          i1.setAttribute('id',`engineer-${anEngineer.EngineerID}_arrow`)
          i1.setAttribute('class',"w3-text-brightgreen material-icons")
          i1.innerHTML = 'arrow_drop_up'
          div2.innerHTML = div2.innerHTML + "&nbsp;&nbsp;" + anEngineer.Engineer.toUpperCase();

          const div3 = document.createElement('div')
          div1.appendChild(div3)
          div3.setAttribute('id',`engineer-${anEngineer.EngineerID}_container`)
          div3.setAttribute('class',"w3-row w3-center w3-hide ")

          // const div4 = document.createElement('div')
          // div3.appendChild(div4)
          // div4.setAttribute('class',"w3-col s6 m6 l6")

          const div5 = document.createElement('div')
          div3.appendChild(div5)
          div5.setAttribute('class',"w3-border w3-round-large w3-black")
          let imageUrl = `../../public/images/engineers/${anEngineer.EngineerID}.jpg`
          fetch(imageUrl).then(response => {
          // fetch doesn't necessarily need to exist, however its just being used as a identifier if the .jpg exists.
          // due to this being the renderer, fs and path can not be utilized in the renderer process, only utilized in the main process.
                const img1 = document.createElement('img')
                div5.appendChild(img1)
                img1.setAttribute('id',`engineer-${anEngineer.EngineerID}_portrait`)
                img1.setAttribute('class',`w3-border w3-border-red w3-vivid-yellowfg2 ${event} font-BLOCKY`)
                const img1_pic = document.getElementById(`engineer-${anEngineer.EngineerID}_portrait`)
                img1_pic.setAttribute('src',`../../public/images/engineers/${anEngineer.EngineerID}.jpg`)
                img1_pic.setAttribute('width','200')
                img1_pic.setAttribute('height','150')
              })
              .catch(error => {let h51 = document.createElement('h5')
              console.log("*********** If errors above, its expected as picture is not available ***********")
              div5.appendChild(h51)
              h51.setAttribute('id',`engineer-${anEngineer.EngineerID}_portrait`)
              h51.setAttribute('class',`w3-vivid-yellowfg2 ${event} font-BLOCKY`)
              h51 = document.getElementById(`engineer-${anEngineer.EngineerID}_portrait`)
              h51.innerHTML = "Picture Not Available..."
          });
          
          const reorderedArrayValues = Array.from(Object.values(anEngineer))
          const reorderedArrayKeys = Array.from(Object.keys(anEngineer))
          const reLableKeys = [
          "Blueprints",
          "Location Name",
          "Location System",
          "Location Distance",
          "Engineer Type",
          "How to Discover",
          "Meeting Requirement",
          "Unlock Requirement",
          "Reputation Gain",
          "Rank Progress",
          "Progress",
          "Rank",
          "Engineer",
          "EngineerID"
        ]
        const orderedKeys = [];
        reLableKeys.forEach((key) => {
            const index = reorderedArrayKeys.indexOf(key);
            if (index >= 0) {
              orderedKeys.push(reorderedArrayKeys[index]);
            }
          });
          function blocks(values,index) {
              const individual_div1 = document.createElement('div')
              div3.appendChild(individual_div1)
              individual_div1.setAttribute('class',"w3-col s6 m6 l3")
              const individual_div2 = document.createElement('div')
              individual_div1.appendChild(individual_div2)
              individual_div2.setAttribute('class',"w3-border w3-round-large w3-black")
              const individual_h5 = document.createElement('h5')
              individual_div2.appendChild(individual_h5)
              individual_h5.setAttribute('id',`engineer-${anEngineer.EngineerID}_${reLableKeys[index].replace(" ","_")}`)
              individual_h5.setAttribute('class',`w3-vivid-yellowfg2 ${event} font-BLOCKY`)
              
              if (reorderedArrayKeys[index] == 'blueprints') {
                const blueprints_array = values
                individual_h5.innerHTML = `Blueprints:<br>`
                blueprints_array.forEach((item)=>{
                  individual_h5.innerHTML += item+'<br>'
                })
              }
              else {
                  individual_h5.innerHTML = `${reLableKeys[index]}: <br> ${values}`
              }
          }
          reorderedArrayValues.forEach((values,index) => {
            if (!values) { values = ""}
            if (reorderedArrayKeys[index] != 'Engineer' && reorderedArrayKeys[index] != 'EngineerID') {
              blocks(values,index)
            }
          })
        })
      })
    }
    // const eventData = document.querySelectorAll('.EngineerProgress');
    // if (save == 1) { myClassSave.saveState(); }
}