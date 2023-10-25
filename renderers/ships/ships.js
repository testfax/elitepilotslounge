let myClassSave = null;
const windowLoaded = new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { myClassSave = new ClassSave('ships'); });

//FUNCTIONS FROM CLICKING
window.addEventListener("click", clickedEvent);
function clickedEvent(evt) {
  //Use arraySearch(f) to parse through something your looking for in an array or if you are comparing multiple arrays. 
  //    Combines forEach and find loop methods.
  //    In this parent function, we are only selecting one item to look for, which we will put in an array anyways for the 
  //        arraySearch() function to properly work.
  const clickedEvent = [evt.target.getAttribute('id')]
  const buttonEvents = ['clearbutton','savebutton','getbutton','launchEdsyButton']
  const events = arraySearch(buttonEvents,clickedEvent)
  if (events.found.length) {
    if (evt.target.hasAttribute('launchEdsyButton')) { 
      let LoadoutData = getEventFromStore('Loadout'); 
      if (LoadoutData) { LoadoutDataF(LoadoutData); } 
      else { console.log("Loadout, No Event Data") } 
      function LoadoutDataF(LoadoutData) {  ipcRenderer.send('launchEDSY',LoadoutData); }
    }
    if (evt.target.hasAttribute('clearbutton')) { myClassSave.clearAll(); }
    if (evt.target.hasAttribute('savebutton')) { myClassSave.saveState(); }
    if (evt.target.hasAttribute('getbutton')) { myClassSave.showAll(); }
  }
  else {
    try {
      drop(clickedEvent[0]) //review function for HTML class requirements.
    }
    catch(e) { 
      console.log("buttonEvents Array not defined with the button requested")
    }
  }
}
let music = null
let save = 1;
//FUNCTIONS FROM MAIN PROCESS: Event Handler files.
//! MUSIC
let musicData = getEventFromStore('Music'); 
if (musicData) { musicDataF(musicData); }
else { console.log("Music, No Event Data") }
function musicDataF(musicData) {
  // document.getElementById('commanderName').innerText = "CMDR " + musicData['Name'];
  music = musicData.MusicTrack;
  console.log(music);
}
ipcRenderer.on('Music', (musicData) => { if (musicData) { musicDataF(musicData); } else { console.log("Music, No Event Data") } });

//! COMMANDER DATA
let commanderData = getEventFromStore('Commander'); 
if (commanderData) { commanderDataF(commanderData); }
else { console.log("Commander, No Event Data") }
function commanderDataF(commanderData) {
  document.getElementById('commanderName').innerText = "CMDR " + commanderData['Name'];
}
ipcRenderer.on('Commander', (commanderData) => { if (commanderData) { commanderDataF(commanderData); } else { console.log("Commander, No Event Data") } });

//! STATUS DATA
let statusData = getEventFromStore('Status'); 
if (statusData) { statusDataF(statusData); }
else { console.log("Status, No Event Data") }
function statusDataF(statusData) {
  try{
    const dockedQuery = ["Docked"]
    let dockedQueryResult = arraySearch(dockedQuery,statusData.Flags1)
    if(statusData['Balance']) { 
      const credits = statusData['Balance'].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      document.getElementById('credits').innerText = "Credits: " + credits 
    }
    document.getElementById('LegalState').innerText = "Legal State: " + statusData['LegalState']
    if (dockedQueryResult.found[0] == dockedQuery[0]) { document.getElementById('Docked').innerText = "Currently\n Docked" }
    else { document.getElementById('Docked').innerText = "Currently\n Undocked" }
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('Status', (statusData) => { if (statusData) { statusDataF(statusData); } else { console.log("Status, No Event Data") } });

//! MISSION DATA
let missionsData = getEventFromStore('Missions'); 
if (missionsData) { missionsDataF(missionsData); }
else { console.log("Missions, No Event Data") }
function missionsDataF(missionsData) {
  try{
    let activeNumber = missionsData.Active.length
    let failedNumber = missionsData.Failed.length
    let completeNumber = missionsData.Complete.length
    // if (missionsData.Active.length === undefined) { activeNumber = 0; }
    // if (missionsData.Failed.length === undefined) { failedNumber = 0; }
    // if (missionsData.Complete.length === undefined) { completeNumber = 0; }
    document.getElementById('Active').innerText = "Active: \n" + activeNumber
    document.getElementById('Complete').innerText = "Complete: \n" + completeNumber
    document.getElementById('Failed').innerText = "Failed: \n" + failedNumber
    if (activeNumber) { 
      missionsData.Active.forEach((missionEntry) => {
        document.getElementById('activeList').innerText += `<div class='w3-border w3-round-large w3-black' >${missionEntry.Name} - ${missionEntry.Expires}</div>`
      });
    }
    if (completeNumber) { 
      missionsData.Complete.forEach((missionEntry) => {
        document.getElementById('completeList').innerText += `<div class='w3-border w3-round-large w3-black'>${missionEntry.Name} - ${missionEntry.Expires}</div>`
      });
    }
    if (failedNumber) { 
      missionsData.Failed.forEach((missionEntry) => {
        document.getElementById('failedList').innerText += `<div class='w3-border w3-round-large w3-black'>${missionEntry.Name} - ${missionEntry.Expires}</div>`
      });
    }
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('Missions', (missionsData) => {if (missionsData) { missionsDataF(missionsData); } else { console.log("Missions, No Event Data") }});

//! DOCKED DATA
let dockedData = getEventFromStore('Docked'); 
if (dockedData) { dockedDataF(dockedData); }
else { console.log("Docked, No Event Data. JSON") }
function dockedDataF(dockedData) {
  try {
    if (dockedData['StationName']) { 
      document.getElementById('StationName').classList.remove("w3-hide"); 
      const EE = document.getElementById('StationName'); 
      EE.innerText = "Station Name:\n" + dockedData['StationName'].toUpperCase() 
    }
    else { document.getElementById('StationName').classList.add("w3-hide") }
    if (dockedData['StationType']) { document.getElementById('StationName').classList.remove("w3-hide"); const EE = document.getElementById('StationType'); EE.innerText = "Station Type:\n" + dockedData['StationType'] }
    else { document.getElementById('StationType').classList.add("w3-hide") }
    document.getElementById('StarSystem').innerText = "Star System:\n" + dockedData['StarSystem']
    // document.getElementById('Body').innerText = "Body:\n" + dockedData['Body']
    // document.getElementById('Population').innerText = "Population:\n" + dockedData['Population'].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    // document.getElementById('SystemAllegiance').innerText = "System Allegiance:\n" + dockedData['SystemAllegiance']
    // document.getElementById('SystemEconomy_Localised').innerText = "Economy:\n" + locatiodockedDatanData['SystemEconomy_Localised']
    // document.getElementById('SystemGovernment_Localised').innerText = "Government:\n" + dockedData['SystemGovernment_Localised']
    // document.getElementById('SystemSecurity_Localised').innerText = "Security:\n" + dockedData['SystemSecurity_Localised']
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('Docked', (dockedData) => { if (dockedDataF) { dockedDataF(dockedData); } else { console.log("Docked, No Event Data. EVENT") } });

// //! UNDOCKED DATA
// let undockedData = getEventFromStore('Undocked'); 
// if (undockedData) { undockedDataF(dockedData); }
// else { console.log("Undocked, No Event Data.") }
// function undockedDataF(undockedData) {
//   try {
//     if (undockedData['StationName']) { 
//       document.getElementById('StationName').classList.remove("w3-hide"); 
//       const EE = document.getElementById('StationName'); 
//       EE.innerText = "Station Name:\n" + undockedData['StationName'].toUpperCase() 
//     }
//     else { document.getElementById('StationName').classList.add("w3-hide") }
//     if (undockedData['StationType']) { document.getElementById('StationName').classList.remove("w3-hide"); const EE = document.getElementById('StationType'); EE.innerText = "Station Type:\n" + dockedData['StationType'] }
//     else { document.getElementById('StationType').classList.add("w3-hide") }
//     document.getElementById('StarSystem').innerText = "Star System:\n" + undockedData['StarSystem']
//     // document.getElementById('Body').innerText = "Body:\n" + dockedData['Body']
//     // document.getElementById('Population').innerText = "Population:\n" + dockedData['Population'].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
//     // document.getElementById('SystemAllegiance').innerText = "System Allegiance:\n" + dockedData['SystemAllegiance']
//     // document.getElementById('SystemEconomy_Localised').innerText = "Economy:\n" + locatiodockedDatanData['SystemEconomy_Localised']
//     // document.getElementById('SystemGovernment_Localised').innerText = "Government:\n" + dockedData['SystemGovernment_Localised']
//     // document.getElementById('SystemSecurity_Localised').innerText = "Security:\n" + dockedData['SystemSecurity_Localised']
//   }
//   catch(e){console.log(e);}
// }
// ipcRenderer.on('Undocked', (undockedData) => { if (undockedDataF) { undockedDataF(undockedData); } else { console.log("Undocked, No Event Data. EVENT") } });

//! LOCATION DATA
let locationData = getEventFromStore('Location'); 
if (locationData) { locationDataF(locationData); }
else { console.log("Location, No Event Data") }
function locationDataF(locationData) {
  try {
    let dockedStatus = null
    const dockedQuery = ["Docked"]
    let dockedQueryResult = arraySearch(dockedQuery,statusData.Flags1)
    
    if (dockedQueryResult.found[0] == dockedQuery[0]) { dockedStatus = dockedQueryResult.found[0] }
    if (dockedStatus != "Docked") { document.getElementById('StationName').classList.add("w3-hide"); document.getElementById('StationType').classList.add("w3-hide") }
    if (locationData['StationName']) { document.getElementById('StationName').classList.remove("w3-hide"); const EE = document.getElementById('StationName'); EE.innerText = "Station Name:\n" + locationData['StationName'].toUpperCase() }
    if (locationData['StationType']) { document.getElementById('StationType').classList.remove("w3-hide"); const EE = document.getElementById('StationType'); EE.innerText = "Station Type:\n" + locationData['StationType'] }
    
    document.getElementById('StarSystem').innerText = "Star System:\n" + locationData['StarSystem']
    document.getElementById('Body').innerText = "Body:\n" + locationData['Body']
    document.getElementById('Population').innerText = "Population:\n" + locationData['Population'].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    document.getElementById('SystemAllegiance').innerText = "System Allegiance:\n" + locationData['SystemAllegiance']
    document.getElementById('SystemEconomy_Localised').innerText = "Economy:\n" + locationData['SystemEconomy_Localised']
    document.getElementById('SystemGovernment_Localised').innerText = "Government:\n" + locationData['SystemGovernment_Localised']
    document.getElementById('SystemSecurity_Localised').innerText = "Security:\n" + locationData['SystemSecurity_Localised']
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('Location', (locationData) => { if (locationData) { locationDataF(locationData); } else { console.log("Location, No Event Data") } });

//! LOADGAME DATA
let loadGameData = getEventFromStore('LoadGame'); 
if (loadGameData) { loadGameDataF(loadGameData); }
else { console.log("LoadGame, No Event Data") }
function loadGameDataF(loadGameData) { 
  try {
    if(loadGameData['Ship_Localised']) { document.getElementById('ShipType').innerText = loadGameData['Ship_Localised']; }
    else { document.getElementById('ShipType').innerText = loadGameData['Ship']}
    document.getElementById('ShipIdent').innerText = loadGameData['ShipIdent'].toUpperCase()
    document.getElementById('ShipName').innerText = loadGameData['ShipName'].toUpperCase()
    if (loadGameData['GameMode'] != 'Group') { document.getElementById('gameMode').innerText = "Game Mode: " + loadGameData['GameMode'] }
    else { document.getElementById('gameMode').innerText = "Game Mode: \n" + loadGameData['Group'] }
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('LoadGame', (loadGameData) => { if (loadGameData) { loadGameDataF(loadGameData); } else { console.log("LoadGame, No Event Data") } });

//! COMMUNITYGOAL DATA
let communityGoalData = getEventFromStore('CommunityGoal'); 
if (communityGoalData) { communityGoalDataF(communityGoalData); }
else { console.log("CommunityGoal, No Event Data") }
function communityGoalDataF(communityGoalData) {
  const container = document.getElementById("communitygoal_container")
  const cgExists = document.getElementById("CG-Existance")
  if (cgExists) { cgExists.classList.remove("w3-hide") } 
  else { 
    if (cgExists.classList.contains('w3-hide')) { return }
    else (cgExists.classList.add('w3-hide'))
  }

  //ITERATE NEW DATA INTO CG-DOM
  if (container.classList.contains("CG-Dom-Created")) {
    communityGoalData.CurrentGoals.forEach(goal => {
      if (document.getElementById(`${Object.keys(goal)}`)) {
        console.log(goal);
        document.getElementById(`${Object.keys(goal)}`).innerText = Object.values(goal)
      }
    });
  }
  //CREATE THE DOM
  if (!container.classList.contains("CG-Dom-Created")) {
    container.classList.add("CG-Dom-Created")
    communityGoalData.CurrentGoals.forEach(goal=> {
      const newDiv1 = document.createElement("div")
      container.appendChild(newDiv1)
      if (communityGoalData.CurrentGoals.length >= 2) {
        newDiv1.setAttribute("class","w3-col s6 m6 l6")
      }
      if (communityGoalData.CurrentGoals.length == 1) {
        newDiv1.setAttribute("class","w3-col s12 m12 l12")
      }
      // else {
      //   newDiv1.setAttribute("class",`w3-col s${communityGoalData.CurrentGoals.length} m${communityGoalData.CurrentGoals.length} l${communityGoalData.CurrentGoals.length}`)
      // }
      
      const newDiv2 = document.createElement("div")
      newDiv1.appendChild(newDiv2)
      newDiv2.classList.add("w3-border")
      newDiv2.classList.add("w3-round-large")
      newDiv2.classList.add("w3-black")
      
      const h51 = document.createElement("h3")
      newDiv2.appendChild(h51);
      h51.setAttribute("id","Title")
      h51.classList.add("w3-vivid-yellowfg2")
      h51.classList.add("dashboardData")
      h51.classList.add("font-BLOCKY")
      h51.innerHTML = goal.Title
      
      const newDiv3 = document.createElement("div")
      newDiv2.appendChild(newDiv3)
      newDiv3.classList.add("w3-border")
      newDiv3.classList.add("w3-round-large")
      newDiv3.classList.add("w3-black")
  
      const h52 = document.createElement("h5")
      newDiv3.appendChild(h52);
      h52.setAttribute("id","SystemName")
      h52.classList.add("w3-vivid-yellowfg2")
      h52.classList.add("dashboardData")
      h52.classList.add("font-BLOCKY")
      h52.innerHTML = "System Name: " + goal.SystemName.toUpperCase()

      const h510 = document.createElement("h5")
      newDiv3.appendChild(h510);
      h510.setAttribute("id","SystemName")
      h510.classList.add("w3-vivid-yellowfg2")
      h510.classList.add("dashboardData")
      h510.classList.add("font-BLOCKY")
      h510.innerHTML = "System Name: " + goal.MarketName.toUpperCase()

      const h53 = document.createElement("h5")
      newDiv3.appendChild(h53);
      h53.setAttribute("id","Expiry")
      h53.classList.add("w3-vivid-yellowfg2")
      h53.classList.add("dashboardData")
      h53.classList.add("font-BLOCKY")
      h53.innerHTML = "Expires: " + goal.Expiry

      const h54 = document.createElement("h5")
      newDiv3.appendChild(h54);
      h54.setAttribute("id","TierReached")
      h54.classList.add("w3-vivid-yellowfg2")
      h54.classList.add("dashboardData")
      h54.classList.add("font-BLOCKY")
      if (goal.TierReached) {
        h54.innerHTML = "Tier Reached: " + goal.TierReached.toUpperCase() + "/" + goal.TopTier.Name.split(" ")[1]
      }
      else {
        const tier = "0"
        h54.innerHTML = "Tier Reached: " + tier.toUpperCase() + "/" + goal.TopTier.Name.split(" ")[1]
      }
      
      const h58 = document.createElement("h5")
      newDiv3.appendChild(h58);
      h58.setAttribute("id","CurrentTotal")
      h58.classList.add("w3-vivid-yellowfg2")
      h58.classList.add("dashboardData")
      h58.classList.add("font-BLOCKY")
      h58.innerHTML = "Current Total: " + goal.CurrentTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    
      if (!goal.PlayerInTopRank) { 
        const h55 = document.createElement("h5")
        newDiv3.appendChild(h55);
        h55.setAttribute("id","PlayerPercentileBand")
        h55.classList.add("w3-vivid-yellowfg2")
        h55.classList.add("dashboardData")
        h55.classList.add("font-BLOCKY")
        h55.innerHTML = "You are in the top: " + goal.PlayerPercentileBand + "%"
      }

      if (goal.PlayerInTopRank) { 
        const h59 = document.createElement("h5")
        newDiv3.appendChild(h59);
        h59.setAttribute("id","PlayerInTopRank")
        h59.classList.add("w3-vivid-yellowfg2")
        h59.classList.add("dashboardData")
        h59.classList.add("font-BLOCKY")
        h59.innerHTML = `You are in the top ranking ${goal.TopRankSize}: Congradulations`
      }
      
      const h56 = document.createElement("h5")
      newDiv3.appendChild(h56);
      h56.setAttribute("id","PlayerContribution")
      h56.classList.add("w3-vivid-yellowfg2")
      h56.classList.add("dashboardData")
      h56.classList.add("font-BLOCKY")
      h56.innerHTML = "You've Contributed: " + goal.PlayerContribution.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      
      const h57 = document.createElement("h5")
      newDiv3.appendChild(h57);
      h57.setAttribute("id","NumContributors")
      h57.classList.add("w3-vivid-yellowfg2")
      h57.classList.add("dashboardData")
      h57.classList.add("font-BLOCKY")
      h57.innerHTML = "Total #Player Contributors: " + goal.NumContributors.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

    })
  }
}
ipcRenderer.on('CommunityGoal', (communityGoalData) => { if (communityGoalData) { communityGoalDataF(communityGoalData); } else { console.log("Community Goal, No Event Data") } });

//! ShipyardSwap DATA
let ShipyardSwapData = getEventFromStore('ShipyardSwap'); 
if (ShipyardSwapData) { ShipyardSwapDataF(ShipyardSwapData); }
else { console.log("ShipyardSwap, No Event Data") }
function ShipyardSwapDataF(ShipyardSwapData) { 
  try {
    if(ShipyardSwapData['ShipType_Localised']) { document.getElementById('ShipType').innerText = ShipyardSwapData['ShipType_Localised'].toUpperCase(); }
    else { document.getElementById('ShipType').innerText = ShipyardSwapData['ShipType'].toUpperCase() }
  }
  catch(e) {console.log(e);}
}
ipcRenderer.on('ShipyardSwap', (ShipyardSwapData) => { if (ShipyardSwapData) { ShipyardSwapDataF(ShipyardSwapData); } else { console.log("ShipyardSwap, No Event Data") } });

//! LOADOUT DATA
let LoadoutData = getEventFromStore('Loadout'); 
if (LoadoutData) { LoadoutDataF(LoadoutData); }
else { console.log("Loadout, No Event Data") }
function LoadoutDataF(LoadoutData) {
  try {
    document.getElementById('ShipIdent').innerText = LoadoutData['ShipIdent'].toUpperCase()
    document.getElementById('ShipName').innerText = LoadoutData['ShipName'].toUpperCase()
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('Loadout', (LoadoutData) => { if (LoadoutData) { LoadoutDataF(LoadoutData); } else { console.log("Loadout, No Event Data") } });

//! FSDJUMP DATA
let FSDJumpData = getEventFromStore('FSDJump')
if (FSDJumpData) { FSDJumpDataF(FSDJumpData) }
else { console.log("FSDJump, No Event Data") }
function FSDJumpDataF(FSDJumpData) {
  try {
    if (FSDJumpData['StationName']) { 
      if (document.getElementById('StationName').classList.contains("w3-hide")) { document.getElementById('StationName').classList.remove("w3-hide") }
      const EE = document.getElementById('StationName'); 
      EE.innerText = "Station Name:\n" + FSDJumpData['StationName'].toUpperCase() 
    }
    // else { document.getElementById('StationName').classList.add("w3-hide") }
    if (FSDJumpData['StationType']) { 
      if (document.getElementById('StationType').classList.contains("w3-hide")) { document.getElementById('StationType').classList.remove("w3-hide") }
      const EE = document.getElementById('StationType'); 
      EE.innerText = "Station Type:\n" + FSDJumpData['StationType'] 
    }
    // else { document.getElementById('StationType').classList.add("w3-hide") }
    document.getElementById('StarSystem').innerText = "Star System:\n" + FSDJumpData['StarSystem']
    document.getElementById('Body').innerText = "Body:\n" + FSDJumpData['Body']
    document.getElementById('Population').innerText = "Population:\n" + FSDJumpData['Population'].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    document.getElementById('SystemAllegiance').innerText = "System Allegiance:\n" + FSDJumpData['SystemAllegiance']
    document.getElementById('SystemEconomy_Localised').innerText = "Economy:\n" + FSDJumpData['SystemEconomy_Localised']
    document.getElementById('SystemGovernment_Localised').innerText = "Government:\n" + FSDJumpData['SystemGovernment_Localised']
    document.getElementById('SystemSecurity_Localised').innerText = "Security:\n" + FSDJumpData['SystemSecurity_Localised']
  }
  catch(e){console.log(e);}
}
ipcRenderer.on('FSDJump', (FSDJumpData) => { if (FSDJumpData) { FSDJumpDataF(FSDJumpData); } else { console.log("FSDJump, No Event Data") } });
// ipcRenderer.on('WingInvite', (data) => {
//   //Ship_Localised doesn't exist with all names.
//   let incoming = JSON.parse(data)
//   document.getElementById('data4').innerText = "Invite Data:" + incoming.invitee.commander;
  
//   const eventData = document.querySelectorAll('.dashboardData');
//   console.log(data);
//   myClassSave.saveState();
// });

// ipcRenderer.on('WingJoin', (data) => {
//   //Ship_Localised doesn't exist with all names.
//   let incoming2 = JSON.parse(data)
//   document.getElementById('data5').innerText = "Join Data:" + incoming2.Inviter;
//   const eventData = document.querySelectorAll('.dashboardData');
//   console.log(data);
//   myClassSave.saveState();
// });

// ipcRenderer.on('WingAdd', (data) => {
//   //Ship_Localised doesn't exist with all names.
//   let incoming = JSON.parse(data)
//   document.getElementById('data6').innerText = "Add Data:" + incoming.Inviter;
//   const eventData = document.querySelectorAll('.dashboardData');
//   console.log(data);
//   myClassSave.saveState();
// });

// document.getElementById("myButton").addEventListener("click", function() {
//   // location.href = "../test/test.html"
//   myClassSave.clearAll();
// });
// document.getElementById("myButton2").addEventListener("click", function() {
//   // location.href = "../test/test.html"
//   myClassSave.saveState();
// });

