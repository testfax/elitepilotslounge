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


//Retrieve events for this page's initial startup.
let brains = [
    "Loadout",
    "Commander",
    "Cargo",
    "Market",
    "CollectCargo",
    "EjectCargo",
    "MarketSell",
    "MarketBuy",
    "Died",
    "ShieldState",
    "Shutdown",
    "RebootRepair",
    "CockpitBreached",
    "CargoTransfer",
    "SupercruiseDestinationDrop",
    "Music",
    "LaunchDrone",
    "ReceiveText",
    "USSDrop",
    "WingJoin",
    "WingAdd",
    "WingLeave",
    "WingInvite",
    "FSSSignalDiscovered",
    "FSDJump",
    "FSDTarget",
    "StartJump",
    "Location",
    "SupercruiseExit",
    "SupercruiseEntry",
    "NavRouteClear",
    "Docked",
    "Undocked",
    "FactionKillBond",
    "CarrierNameChanged",
    "CarrierJumpRequest",
    "CarrierJump",
    "CarrierJumpCancelled",
    "ShipyardSwap"
]
let brainData = []
brains.forEach(brain => {
  const dat = getEventFromStore(brain)
  if (dat) {
    brainData.push(dat)
  }
  if (!dat) {
    brainData.push({"NoData":brain})
  }
})
//Startup variables
let titlebar_sort = {
  "titan": 'desc',
  "distance": 'desc',
  "progress": 'desc',
  "system": 'desc',
  "population": 'desc',
  "samples": 'desc',
}
let systems = {}
let titanState = null;
let titans = {}
let titanDetails = null;
const colorit = {
  Controlled: "w3-text-green",
  Alert: "w3-vivid-yellowfg2",
  Invasion: "w3-vivid-orange2",
  thargoidpod: "w3-vivid-red2"

}
let tooltipObject = {
  limpetsLaunched: "Research | Collector | Repair"
};
let readyToRecieve = null;
// Find all elements with the "tooltip-element" class and create a Tooltip instance for each
function newToolTip() {
  const elementsWithTooltip = document.querySelectorAll(".tooltip-element");
  elementsWithTooltip.forEach(element => new Tooltip(element))
}
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
    // console.log("clickedEventMod:",clickedEventMod,"clickedNameEvent",clickedNameEvent)
    //nonUiEvents are everything but the dropdowns
    const nonUiEvents = ['titlebar-sort','expandall','collapseall','checkbox','maelstrom']
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
      if (events.found.find(i => i ==='maelstrom') == 'maelstrom') { //clicking on invasion,alert,controlled
        titanState = clickedEventMod[0].split("_")
        if (titanState[0] != 'r') {

          const clickedIname = document.getElementById(`r_${clickedEventMod[0]}_${clickedNameEvent[0]}`);
          
          let stateRadio = document.getElementsByClassName('stateRadio')
          stateRadio = Array.from(stateRadio)
          stateRadio.forEach(dom => { 
            dom.innerText = 'radio_button_unchecked'
          })
          let SysTit = document.getElementsByClassName('SysTit-Dom-Created')
          SysTit = Array.from(SysTit)
          if (SysTit) { SysTit.forEach(dom => { 
            const [,,third,fourth] = dom.id.split("_")
            const thisTitan = {"brain":"brain-ThargoidSample","name":third,"state":fourth}
            if (thisTitan.name != 'titan' && thisTitan.state != 'wait') { ipcRenderer.send('leaveSamplingRoom',thisTitan); }
            dom.remove() }) }

          clickedIname.innerText = `radio_button_checked`
          buildSystemTitleBar(titanState)
          readyToRecieve = true
        }
        
        // document.getElementById(iname).innerText = "radio_button_unchecked"
        // document.getElementById(iname).innerText = "radio_button_checked"
      }
      if (events.found.find(i => i ==='titlebar-sort') == 'titlebar-sort') {
        const type = clickedEventMod[0]
        let SysTit = document.getElementsByClassName('SysTit-Dom-Created')
        SysTit = Array.from(SysTit)
        if (SysTit) { SysTit.forEach(dom => { dom.remove() }) }
        function sortItOut(a, b, type) {
          if (titlebar_sort[type] === 'asc' && type !== 'system') {
            return a - b; // Numerical comparison in ascending order
          } else if (titlebar_sort[type] === 'desc' && type !== 'system') {
            return b - a; // Numerical comparison in descending order
          } else if (type === 'system' && titlebar_sort[type] === 'asc') {
            return a.localeCompare(b); // String comparison in ascending order
          } else if (titlebar_sort[type] === 'desc') {
            return b.localeCompare(a); // String comparison in descending order
          }
        }
        function toggleSortOrder(type) {
          titlebar_sort[type] = titlebar_sort[type] === 'asc' ? 'desc' : 'asc';
        }
        if (type == 'titan') {
          toggleSortOrder(type);
          systems = systems.sort((a,b) => sortItOut(a.titan,b.titan,type))
          buildSystemTitleBar(titanState)
        }
        if (type == 'distance') {
          toggleSortOrder(type);
          systems = systems.sort((a,b) => sortItOut(a.distanceToMaelstrom,b.distanceToMaelstrom,type))
          buildSystemTitleBar(titanState)
        }
        if (type == 'progress') {
          toggleSortOrder(type);
          systems = systems.sort((a,b) => sortItOut(a.stateProgress.progressPercent,b.stateProgress.progressPercent,type,))
          buildSystemTitleBar(titanState)
        }
        if (type == 'system') {
          toggleSortOrder(type);
          systems = systems.sort((a,b) => sortItOut(a.name,b.name,type))
          buildSystemTitleBar(titanState)
        }
        if (type == 'population') {
          toggleSortOrder(type);
          systems = systems.sort((a,b) => sortItOut(a.population,b.population,type))
          buildSystemTitleBar(titanState)
        }
        if (type == 'samples') {
          toggleSortOrder(type);
          systems = systems.sort((a,b) => sortItOut(a.name,b.name,type))
          buildSystemTitleBar(titanState)
        }
      }
    }
    else {
      drop(clickedEvent[0])
    }
}
function isWordPresent(array,item) {
  array = array.toLowerCase();
  item = item.toLowerCase();
  return array.includes(item)
}
function timeConversion(dateString) {
  let date = new Date(dateString);
  let day = date.getDate();
  let month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  let year = date.getFullYear().toString().slice(-2);
  let hours = date.getUTCHours().toString().padStart(2, '0'); 
  let minutes = date.getUTCMinutes().toString().padStart(2, '0');
  let formattedDate = `${day}-${month} ${hours}:${minutes}`;
  return formattedDate + "Z"
}
function progressBar(currentPercentage){
  const calc = currentPercentage
  const percentColorArray = [
    { percent: "100", color: "#00FF00" },
    { percent: "90", color: "#70ac00" },
    { percent: "70", color: "#eeff04" },
    { percent: "50", color: "#abbe00" },
    { percent: "30", color: "#FF4500" },
    { percent: "0", color: "#FF0000" }
  ]
  let findColor = null
  let closestDiff = Infinity;
  percentColorArray.forEach((color) => {
    const diff = Math.abs(Number(color.percent) / 100 - calc);
    if (diff < closestDiff) {
      findColor = color.color;
      closestDiff = diff;
    }
  });
  //console.log(findColor,calc)
  return [ findColor, calc ];
}
//restartAnimation(`WarProgressPercent_${item.name}`)
function restartAnimation(progressBarId) {
  const progressBar = document.getElementById(progressBarId);
  progressBar.style.animation = 'none';
  void progressBar.offsetWidth; // Trigger reflow to reset the animation
  progressBar.style.animation = 'grow-h 2.5s ease-out forwards';
}
//Request system structure
//fromRenderer.js will have a redis structure validator.
//    Will fail if a key is missing or value is not a string or object
const requests = [
  {
    "from": "dcohSystems-sample",
    "description":"maelstroms",
    "type": "redisRequest",
    "method": "GET",
    "data": {
      "dcohSystems": [
        "$.maelstroms[*]",
      ]
    },
    "keys": [
      "maelstroms",
      
    ]
  },
  {
    "from": "dcohSystems-sample",
    "description":"systems",
    "type": "redisRequest",
    "method": "GET",
    "data": {
      "dcohSystems": [
        "$.systems[*].name",
        "$.systems[*].populationOriginal",
        "$.systems[*].thargoidLevel['name']",
        "$.systems[*].stateProgress",
        "$.systems[*].maelstrom['name']",
        "$.systems[*].systemAddress",
        "$.systems[*].distanceToMaelstrom",
        "$.systems[*].features",
      ]
    },
    "keys": [
      "name",
      "population",
      "state",
      "stateProgress",
      "titan",
      "systemAddress",
      "distanceToMaelstrom",
      "features",
    ]
  }
]  
//Startup initial value
requests.forEach(i=>{ ipcRenderer.send('RedisData',i); })
ipcRenderer.on('dcohSystems-sample', (data) => {
  if (data.response.redisQueryResult == "systems") {
    const sortedSystems = data.response.redisResult.sort((a, b) => b.stateProgress.progressPercent - (a.stateProgress.progressPercent));
    systems = sortedSystems //Startup variable
    buildTitanList(sortedTitans,buildTitanStats(systems,1))
  }
  if (data.response.redisQueryResult == "maelstroms") {
    sortedTitans = data.response.redisResult.sort((a, b) => a.maelstroms.ingameNumber - (b.maelstroms.ingameNumber));
    sortedTitans.forEach(item=>{ titans[item.maelstroms.ingameNumber] = item.maelstroms.name })
    titans['total'] = data.response.redisResult.length //Startup variable
  }
  if (data.response.redisQueryResult == 'dcohSystems-updated') {
    const sortedSystems = data.response.redisResult.sort((a, b) => b.stateProgress.progressPercent - (a.stateProgress.progressPercent));
    systems = sortedSystems
    updaterTitanList(buildTitanStats(systems,1))
    updaterSystemTitleList(systems)
  }
})

function updaterSystemTitleList(systems) {
  // Updates the progress % of the Title Bar
  let updateItem = document.getElementsByClassName(`warprogresspercent`)
  if (updateItem) { 
    Array.from(updateItem).forEach(ele => { 
      const systemAddy = ele.id.split("_")
      const foundSystem = systems.find(x => x.systemAddress == systemAddy[0]);
      const progress = foundSystem.stateProgress.progressPercent
      const formattedNumber = (progress).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:1});
      document.getElementById(ele.id).innerText = formattedNumber
    })
  }
}
function updaterTitanList(titanDetails) {
  try {
    //Updates the number and percentages for the Titan Bar
    const orderedTitanDetails = {};
  for (const key in titans) {
    if (key !== "total") {
      const titanName = titans[key];
      orderedTitanDetails[titanName] = titanDetails[titanName];
    }
  }
  Object.values(orderedTitanDetails).forEach((i,index)=> {
    index = index + 1
    if (i.Controls.quantity >= 1) {
      const amount = i.Controls.quantity - i.Controls.completed
      // const percent = i.Controls.warProgress
      // const formattedNumber2 = (percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:0});
      document.getElementById(`remaining_${index}_Controlled`).innerText = amount
      // document.getElementById(`WarProgressPercent_${index}_Controlled`).innerText = formattedNumber2
    }
    if (i.Alerts.quantity >= 1) {
      const amount = i.Alerts.quantity - i.Alerts.completed
      const percent = i.Alerts.warProgress
      const formattedNumber2 = (percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:0});
      document.getElementById(`remaining_${index}_Alert`).innerText = amount
      document.getElementById(`WarProgressPercent_${index}_Alert`).innerText = formattedNumber2
    }
    if (i.Invasions.quantity >= 1) { 
      const amount = i.Invasions.quantity - i.Invasions.completed
      const percent = i.Invasions.warProgress
      const formattedNumber2 = (percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:0});
      document.getElementById(`remaining_${index}_Invasion`).innerText = amount
      document.getElementById(`WarProgressPercent_${index}_Invasion`).innerText = formattedNumber2
    }
  })
  }
  catch(e) { console.log(e) }
}
//Active Titans
//  setup the table structure and load dynamic systems that are not completed and have progression
function buildTitanList(maelstroms,titanDetails) {
  try{
    function tdLooperState(TR2,state,row){
      const stateCAPS = state.toUpperCase()
      //todo create logic so that it only spans 4 accross
      const loopCountTD1 = maelstroms.length - 4;
      const loopArrayTD1 = Array.from({ length: loopCountTD1 });
      loopArrayTD1.forEach((item,index)=> {
        if (row == 1) { index++ }
        if (row == 2) { 
          index++ 
          index++ 
          index++ 
          index++ 
          index++ 
        }
        const TD1 = document.createElement('td')
        TR2.appendChild(TD1)
        TD1.setAttribute('class','font-DAFONT fitwidth')
        if (state == 'thargoidpod') { 
          TD1.setAttribute('colspan','3')
        }
        
        const I1 = document.createElement('i')
        TD1.appendChild(I1);
        I1.innerText = "radio_button_unchecked"
        I1.setAttribute('class','w3-small w3-text-white material-icons stateRadio')
        I1.setAttribute('id',`r_${index}_${state}_maelstrom`)
        I1.setAttribute('data-attribute',`radio_maelstrom_${index}_${state}`)
        
        const SPAN1 = document.createElement('span')
        TD1.appendChild(SPAN1);
        SPAN1.setAttribute('id',`${index}_${state}_maelstrom`)
        SPAN1.setAttribute('class',`pointerRadio w3-medium ${colorit[state]}`)
        SPAN1.setAttribute('data-attribute',`radio_maelstrom_${index}_${state}`)
        

        let SPAN1textNode = null
        let stateMod = null
        if (state == 'Controlled') { stateMod = 'Controls'; }
        if (state == 'Alert') { stateMod = 'Alerts'; }
        if (state == 'Invasion') { stateMod = 'Invasions'; }
        let percent = null;
        let quantity = null;
        let completed = null;
        let remaining = null;
        if (stateMod == 'Controls' || stateMod == 'Alerts' || stateMod == 'Invasions') {
          percent = ((titanDetails[titans[index]][stateMod].warProgress))
          quantity = titanDetails[titans[index]][stateMod].quantity
          completed = titanDetails[titans[index]][stateMod].completed
          remaining = quantity - completed

        }

        if (state == 'thargoidpod') { SPAN1textNode = `TITAN RESCUES`}
        if (stateMod == 'Controls') { SPAN1textNode = `${stateCAPS}`; td2textNode = `${remaining}` }
        if (stateMod == 'Alerts') { SPAN1textNode = `${stateCAPS}`; td2textNode = `${remaining} ` }
        if (stateMod == 'Invasions' && quantity != 0) {  SPAN1textNode = `${stateCAPS}`; td2textNode = `${remaining}` }
        if (stateMod == 'Invasions' && quantity == 0) {  SPAN1textNode = `${stateCAPS}`; td2textNode = `` }
        // stateSpan.setAttribute('class','')
        SPAN1.innerHTML = `${SPAN1textNode} `
        if (state != 'thargoidpod') {

          
          const TD2 = document.createElement('td')
          TR2.appendChild(TD2)
          TD2.setAttribute('class','font-DAFONT')
          TD2.setAttribute('id',`remaining_${index}_${state}`)
          TD2.innerHTML = td2textNode
  
          const TD3 = document.createElement('td')
          TR2.appendChild(TD3)
          TD3.setAttribute('class','font-DAFONT')
          if (stateMod == 'Alerts' || stateMod == 'Invasions' && stateMod != 'Controls' && quantity != 0) {  
            const currentcolorpercentage = progressBar(percent)
            let distance = percent
            if (distance === 1) { distance = 100; } else if (distance < 1) { distance *= 100; }
            const progress_container = document.createElement('span')
            TD3.appendChild(progress_container)
            progress_container.setAttribute('class','progress-container')
            const progress_bar = document.createElement('span')
            progress_container.appendChild(progress_bar);
            progress_bar.setAttribute("id",`WarProgressPercent_${index}_${state}`)
            progress_bar.setAttribute("class","w3-vivid-highvis progress-bar count-right-align")
            progress_bar.setAttribute("style",`background: linear-gradient(45deg,#ff0000,${currentcolorpercentage[0]} 1%); height: 100%;`)
            const formattedNumber2 = (percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:0});
            if (stateMod == 'Alerts' || stateMod == 'Invasions' && quantity != 0) {  
              progress_bar.innerHTML = `${formattedNumber2} `
            }
          }
        }
      })
    }
    const container = document.getElementById("titanSelectors_container")
    if (!container.classList.contains("TitList-Dom-Created")) {
        container.classList.add("TitList-Dom-Created")
        const TR1 = document.createElement('tr')
        container.appendChild(TR1)
        // TR1.setAttribute('class','')
        maelstroms.forEach((i,index)=> {
          if (index <= 3) {
            const TH1 = document.createElement('th')
            TR1.appendChild(TH1)
            TH1.setAttribute('class','w3-large w3-vivid-gray font-BLOCKY2')
            TH1.setAttribute('colspan','3')
            TH1.setAttribute('id',`maelstrom-${i.maelstroms.name}`)
            TH1.innerText = i.maelstroms.name;
          }
        })
        const TR2 = document.createElement('tr')
        container.appendChild(TR2)
        
        tdLooperState(TR2,"Controlled",1)

        const TR3 = document.createElement('tr')
        container.appendChild(TR3)
        
        tdLooperState(TR3,"Alert",1)

        const TR4 = document.createElement('tr')
        container.appendChild(TR4)
        
        tdLooperState(TR4,"Invasion",1)

        const TR45 = document.createElement('tr')
        container.appendChild(TR45)

        // tdLooperState(TR45,"thargoidpod",1)
      
        const TR5 = document.createElement('tr')
        container.appendChild(TR5)
        maelstroms.forEach((i,index)=> {
          if (index >= 4) {
            const TH2 = document.createElement('th')
            TR5.appendChild(TH2)
            TH2.setAttribute('class','w3-large w3-vivid-gray font-BLOCKY2')
            TH2.setAttribute('colspan','3')
            TH2.setAttribute('id',`maelstrom-${i.maelstroms.name}`)
            TH2.innerText = i.maelstroms.name;
          }
        })
        
        const TR6 = document.createElement('tr')
        container.appendChild(TR6)
        
        tdLooperState(TR6,"Controlled",2)

        const TR7 = document.createElement('tr')
        container.appendChild(TR7)
        
        tdLooperState(TR7,"Alert",2)

        const TR8 = document.createElement('tr')
        container.appendChild(TR8)
        
        tdLooperState(TR8,"Invasion",2)

        const TR85 = document.createElement('tr')
        container.appendChild(TR85)

        // tdLooperState(TR85,"thargoidpod",1)
    }
  }
  catch(e) { console.log(e); }
}
//Adds up all the controls,invasions,alerts and does cumulative remaining percentage of each, except controls.
function buildTitanStats(systems,returnable) {
  let titanStats = {};
    const newTitanNameArray = []
    Object.values(titans).forEach(titan => { 
      if (typeof titan == 'string') { 
        newTitanNameArray.push(titan)
        titanStats[titan] = { 
          Controls: { quantity: 0, completed: 0, warProgress: 0, },
          Alerts: { quantity: 0, completed: 0, warProgress: 0, },
          Invasions: { quantity: 0, completed: 0, warProgress: 0, },
        }; 
        
      }
    })
    const statesJournal = ["Alert","Controlled","Invasion"]; 
    const titanStatsStates = ["Alerts","Controls","Invasions"]; //!!!property names. dont confuse with the Alert,Controlled,Invasion states from the journal
    systems.forEach(system => {
      titanStatsStates.forEach((state,index)=>{
        if (system.state == statesJournal[index]) {
          titanStats[system.titan][state].quantity++; 
          if (system.stateProgress.isCompleted) { titanStats[system.titan][state].completed++;}
          if (!system.stateProgress.isCompleted) { titanStats[system.titan][state].warProgress += system.stateProgress.progressPercent;}
        }
      })
    })
    newTitanNameArray.forEach(titan => {
      titanStatsStates.forEach(state => {
          const quantity = titanStats[titan][state].quantity
          const percent = titanStats[titan][state].warProgress
          const completed = titanStats[titan][state].completed
          const quickMath = (percent / (quantity - completed) * 100)  / 100
          if (state == 'Controls') {titanStats[titan][state].warProgress = ''}
          if (state != 'Controls' && !isNaN(quickMath) && (quantity - completed) != 0) { titanStats[titan][state].warProgress = quickMath } // console.log(titan,state,'quantity',quantity,'completed',completed,'percent',titanStats[titan][state].warProgress,quickMath)
          if (state != 'Controls' && quantity != 0 && (quantity - completed) == 0) { titanStats[titan][state].warProgress = 1 }
          if (state != 'Controls' && quantity == 0) { titanStats[titan][state].warProgress = 0 }
        })
    })
    // console.log(titanStats)
    if (returnable) { return titanStats }
}
//Build the active system sampler chart

function buildSystemTitleBar(titanState,commanderSystemData) {
  const thisTitan = {
    brain:"brain-ThargoidSample",
    name:titans[titanState[0]],
    state:titanState[1]
  }
  
  let filteredSystems = systems.filter(system => (
      system.titan === thisTitan.name &&
      system.state === thisTitan.state 
      // && system.stateProgress.isCompleted === false
  ));
  // console.log(filteredSystems)
  //!Build the redis request. This will send all the systems for the redis server to look for.
  //!    Systems will be returned where a commander has logged work. Must have lounge-client or EDMC-Lounge-Client running data to...
  //!    the Elite Lounge Client webserver.
  let redisRequest = [
    {
      "from": "RedisData-SampleSystems", //for fromRenderer.js, again because i'm dumb...
      "description":"gather systems that have samples from commanders", //because i'm dumb.
      "type": "buildCommanderTitleBar", //for socketserver task manager
      "method": "GET",
      "data": []
    }
  ]
  filteredSystems.forEach(a=>{ redisRequest[0].data.push(a.systemAddress) })
  ipcRenderer.send('RedisData-SampleSystems',redisRequest[0])
  
  ipcRenderer.once('RedisData-SampleSystems', (data) => {
    commanderSystemData = data.response.redisResult
    // console.log("From Redis:",data.response.redisResult);
    
    let container = document.getElementById(`activeSystembar_container_${thisTitan.name}_${thisTitan.state}`)
    if (!container) { 
      const oneUpcontainer = document.getElementById('activeSystembar_containerHost')
      const newContainer = document.createElement('tbody')
      oneUpcontainer.appendChild(newContainer)
      newContainer.setAttribute('id',`activeSystembar_container_${thisTitan.name}_${thisTitan.state}`)
      
      container = newContainer
    }
    if (container && !container.classList.contains("SysTit-Dom-Created")) {
        ipcRenderer.send('joinSamplingRoom',thisTitan);
        container.classList.add("SysTit-Dom-Created")
        const TR0 = document.createElement('tr')
        container.appendChild(TR0)
        TR0.setAttribute('class',`w3-vivid-gray font-BLOCKY pointer`)
        TR0.setAttribute('id',`TitleBarSortBar`)
  
        const TH02 = document.createElement('th')
          TR0.appendChild(TH02)
          TH02.setAttribute('class','w3-vivid-orange2 font-BLOCKY pointer titlebar_asc')
          TH02.setAttribute('id','titan_titlebar-sort')
          TH02.setAttribute('colspan','0')
          TH02.innerText = 'TITAN'
  
        const TH03 = document.createElement('th')
          TR0.appendChild(TH03)
          TH03.setAttribute('class','w3-vivid-orange2 font-BLOCKY pointer titlebar_asc')
          TH03.setAttribute('id','distance_titlebar-sort')
          TH03.setAttribute('data-attribute','distance_titlebar-sort')
          TH03.setAttribute('colspan','0')
          TH03.innerText = 'DISTANCE'
  
        const TH04 = document.createElement('th')
          TR0.appendChild(TH04)
          TH04.setAttribute('class','w3-vivid-orange2 font-BLOCKY pointer titlebar_asc')
          TH04.setAttribute('id','progress_titlebar-sort')
          TH04.setAttribute('data-attribute','progress_titlebar-sort')
          TH04.setAttribute('colspan','0')
          TH04.innerText = 'PROGRESS'
        
        const TH05 = document.createElement('th')
          TR0.appendChild(TH05)
          TH05.setAttribute('class','w3-vivid-orange2 font-BLOCKY pointer titlebar_asc')
          TH05.setAttribute('id','system_titlebar-sort')
          TH05.setAttribute('data-attribute','system_titlebar-sort')
          TH05.setAttribute('colspan','1')
          TH05.innerHTML = '&nbsp;&nbsp; SYSTEM'
  
        const TH06 = document.createElement('th')
          TR0.appendChild(TH06)
          TH06.setAttribute('class','w3-vivid-orange2 font-BLOCKY pointer titlebar_asc')
          TH06.setAttribute('id','population_titlebar-sort')
          TH06.setAttribute('data-attribute','population_titlebar-sort')
          TH06.setAttribute('colspan','0')
          TH06.innerText = 'POPULATION'
        
        const TH07 = document.createElement('th')
          TR0.appendChild(TH07)
          TH07.setAttribute('class','w3-vivid-orange2 font-BLOCKY pointer titlebar_asc')
          TH07.setAttribute('id','samples_titlebar-sort')
          TH07.setAttribute('data-attribute','samples_titlebar-sort')
          TH07.setAttribute('colspan','0')
          TH07.innerText = 'SAMPLES'

        filteredSystems.forEach((item,index)=>{
          
          const currentcolorpercentage = progressBar(item.stateProgress.progressPercent)
          const TR1 = document.createElement('tr')
          container.appendChild(TR1)
          TR1.setAttribute('class',`w3-vivid-gray font-BLOCKY`)
          TR1.setAttribute('id',`systemAddress_${item.systemAddress}`)
    
          const TH1 = document.createElement('th')
          TR1.appendChild(TH1)
          TH1.setAttribute('class',`w3-vivid-gray font-BLOCKY`)
          TH1.setAttribute('id',`activeTitan_${item.titan}`)
          TH1.innerText = (item.titan).toUpperCase();
  
          const TH2 = document.createElement('th')
          TR1.appendChild(TH2)
          TH2.setAttribute('class',`w3-vivid-gray font-BLOCKY `)
          TH2.setAttribute('id',`activeTitanDistance_${item.distanceToMaelstrom}`)
          const formattedNumber = parseFloat(item.distanceToMaelstrom.toFixed(2));
          TH2.innerText = `${formattedNumber} Ly`
          
          const TH3 = document.createElement('th')
          TR1.appendChild(TH3)
          TH3.setAttribute('class','w3-vivid-gray font-BLOCKY ')
          TH3.setAttribute('style','text-align: right;')
          TH3.setAttribute('colspan','0')
          
          let distance = item.stateProgress.progressPercent
          if (distance === 1) {
            distance = 100;
          } else if (distance < 1) {
            distance *= 100;
          }
          const progress_container = document.createElement('span')
          TH3.appendChild(progress_container)
          progress_container.setAttribute('class',' progress-container')
          // progress_container.setAttribute('style','text-align: right;')
        
          const progress_bar = document.createElement('span')
          progress_container.appendChild(progress_bar);
          progress_bar.setAttribute("id",`${item.systemAddress}_WarProgressPercent`)
          progress_bar.setAttribute("class","w3-vivid-highvis progress-bar warprogresspercent")
          progress_bar.setAttribute("style",`background: linear-gradient(45deg,#ff0000,${currentcolorpercentage[0]} 1%);height: 100%; `)
          const formattedNumber2 = (item.stateProgress.progressPercent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:1});
          progress_bar.innerText = `${formattedNumber2} `
          
          const TH35 = document.createElement('th')
          TR1.appendChild(TH35)
          TH35.setAttribute('class','w3-vivid-gray font-BLOCKY')
          TH35.setAttribute('colspan','0')
    
  
          const SPAN2 = document.createElement('span')
          TH35.appendChild(SPAN2)
          SPAN2.setAttribute('id',`StarSystem_${item.systemAddress}`)
          SPAN2.setAttribute('class',`w3-vivid-gray fitwidth`)
          TH35.setAttribute('colspan','1')
          SPAN2.innerHTML = `&nbsp;&nbsp; ${item.name}`
          
          const TH4 = document.createElement('th')
          TR1.appendChild(TH4)
          TH4.setAttribute('class','w3-vivid-gray font-BLOCKY')
          TH4.setAttribute('colspan','1')
          const formattedNumber4 = item.population.toLocaleString();
          TH4.innerText = `${formattedNumber4} Pop`
  
          const TH6 = document.createElement('th')
          TR1.appendChild(TH6)
          TH6.setAttribute('class','w3-vivid-gray font-BLOCKY')
          TH6.setAttribute('colspan','3')
  
          const SPAN3 = document.createElement('span')
          TH6.appendChild(SPAN3)
          SPAN3.setAttribute('id',`sampleProgressPercent_${item.systemAddress}`)
          SPAN3.setAttribute('class',`w3-vivid-grayish percent_square-background`)
          SPAN3.innerHTML = `&nbsp; &nbsp; 0% `
  
          const SPAN4 = document.createElement('span')
          TH6.appendChild(SPAN4)
          SPAN4.setAttribute('class',`w3-vivid-gray`)
          SPAN4.innerHTML = ` &nbsp; &nbsp; «» &nbsp; &nbsp;`
  
          const SPAN5 = document.createElement('span')
          TH6.appendChild(SPAN5)
          SPAN5.setAttribute('id',`sampleProgressCurrent_${item.systemAddress}`)
          SPAN5.innerText = ` 0 / `
  
          const SPAN6 = document.createElement('span')
          TH6.appendChild(SPAN6)
          SPAN6.setAttribute('id',`sampleProgressMax_${item.systemAddress}`)
          SPAN6.innerText = ` 5555 Required`
  
          const TH7 = document.createElement('th')
          TR1.appendChild(TH7)
          TH7.setAttribute('class',`${colorit[item.state]} font-BLOCKY`)
          TH7.setAttribute('colspan','4')
          TH7.innerText = item.state.toUpperCase();
          //Build the titelbar for the Commander
          let specificCommanderSystemData = null;
          if (commanderSystemData) {
            commanderSystemData.forEach(i => {
              if (i.includes(item.systemAddress)) { specificCommanderSystemData = i }
            })
          }
          buildCommanderTitleBar(item.systemAddress,specificCommanderSystemData,thisTitan)
        })
    }
  })
}
//Builds the Titelbar holding the info legend for the commadner
function buildCommanderTitleBar(systemAddress,specificCommanderSystemData,thisTitan) {
  let container = document.getElementById(`activeSystembar_container_${thisTitan.name}_${thisTitan.state}`)
  const TR1 = document.createElement('tr')
  container.appendChild(TR1)
  if (!specificCommanderSystemData) { TR1.setAttribute('class',`font-BLOCKY w3-hide`) }
  else { TR1.setAttribute('class',`font-BLOCKY`) }
  TR1.setAttribute('id',`${systemAddress}_commanderTitleBarSystem`)
  
  const TH1 = document.createElement('th')
  TR1.appendChild(TH1)
  TH1.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH1.innerText = `DATE`

  const TH2 = document.createElement('th')
  TR1.appendChild(TH2)
  TH2.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH2.innerText = `COMMANDER`

  const TH3 = document.createElement('th')
  TR1.appendChild(TH3)
  TH3.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH3.innerText = `SHIP`
  
  const TH35 = document.createElement('th')
  TR1.appendChild(TH35)
  TH35.setAttribute('class',`w3-center w3-text-pink font-BLOCKY`)
  TH35.innerText = `Status`

  const TH4 = document.createElement('th')
  TR1.appendChild(TH4)
  TH4.setAttribute('class',`w3-text-yellow font-BLOCKY`)
  TH4.innerText = `Sample Rating`

  const TH5 = document.createElement('th')
  TR1.appendChild(TH5)
  TH5.setAttribute('class',`w3-text-yellow font-BLOCKY`)
  TH5.innerText = `Samples In Cargo`

  const TH6 = document.createElement('th')
  TR1.appendChild(TH6)
  TH6.setAttribute('class',`w3-text-yellow font-BLOCKY`)
  TH6.innerText = `Limpets Cargo`

  const TH7 = document.createElement('th')
  TR1.appendChild(TH7)
  TH7.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH7.innerText = `Caustic Protection`

  const TH8 = document.createElement('th')
  TR1.appendChild(TH8)
  TH8.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH8.innerText = `Cargo Capacity`

  const TH9 = document.createElement('th')
  TR1.appendChild(TH9)
  TH9.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH9.innerText = `To Carrier/RMS`

  const TH10 = document.createElement('th')
  TR1.appendChild(TH10)
  TH10.setAttribute('class',`w3-text-pink font-BLOCKY`)
  TH10.innerText = `Samples Collected`

  const TH11 = document.createElement('th')
  TR1.appendChild(TH11)
  TH11.setAttribute('id',`limpetsLaunched`)
  TH11.setAttribute('class',`tooltip-element pointer-help w3-text-pink font-BLOCKY`)
  TH11.innerText = `Limpets Launched`
  // newToolTip()
  if (specificCommanderSystemData){
    specificCommanderSystemData.forEach((cmdrData,index) => {
      if (index >= 1) { 
        create_activeCommanders(systemAddress,cmdrData,TR1)
      }
    })
  }

}

//Receive data from either client or Socket .
ipcRenderer.on('from_brain-ThargoidSample', (data) => {
  if (readyToRecieve) { 
    console.log(data);
    try {
      function descriptionContent(data,description) {
        if (document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_date_commanderSystem`)) { 
          document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_date_commanderSystem`).textContent = timeConversion(data.combinedData.timestamp)
          document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_status_commanderSystem`).textContent = description
        }
      }
      if (data.event == 'Initialize') {
        const FID = data.FID
        const checkViewable = document.getElementById(`${data.systemAddress}_commanderTitleBarSystem`)
        if (checkViewable && checkViewable.classList.contains('w3-hide')) { 
          checkViewable.classList.remove('w3-hide')
          let primaryObj = { 
            [FID]: {
              inWing: data.events.find(i => i.event === 'InWing').combinedData.wingStatus,
              timestamp: data.events.find(i => i.event === 'Commander').combinedData.timestamp,
              cargo: data.events.find(i => i.event === 'Cargo').combinedData,
              commanderData: data.events.find(i => i.event === 'Commander').combinedData,
              docked: "",
              undocked: "",
              ejectedCargo: data.events.find(i => i.event === 'EjectCargo') ? data.events.find(i => i.event === 'EjectCargo').combinedData.Count : 0,
              limpetsLaunched: {
                LastLaunchedType: data.events.find(i => i.event === 'LaunchDrone').combinedData.Type,
                Repair: data.events.find(i => i.event === 'LaunchDrone').combinedData.Type == 'Repair' ? 0 : 0,
                Research: data.events.find(i => i.event === 'LaunchDrone').combinedData.Type == 'Research' ? 0 : 0,
                Collection: data.events.find(i => i.event === 'LaunchDrone').combinedData.Type == 'Collection' ? 0 : 0, 
              },
              loadout: data.events.find(i => i.event === 'Loadout').combinedData,
              location: data.events.find(i => i.event === 'Location').combinedData,
              samplesCollected: data.events.find(i => i.event === 'Cargo').combinedData.SampleCargoCount > 0 ? 0 : 0,
              samplesEjected: 0,
              soldToCarrier: 0,
              status: "I'm new here..."
            }
          }
          console.log("init:",primaryObj)
          create_activeCommanders(data.systemAddress,primaryObj,checkViewable,'ipc')
        }
      }
      if (data.event == 'LaunchDrone') {
        const description = `Putting some work in...`
        descriptionContent(data,description)
        if (data.combinedData.Type == "Collection") { 
          const value = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_launchCollectorLimpet_commanderSystem`)
          const currentValue = parseInt(value.textContent, 10);
          const newValue = currentValue + 1;
          value.textContent = newValue;
        }
        if (data.combinedData.Type == "Research") { 
          const value = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_launchResearchLimpet_commanderSystem`)
          const currentValue = parseInt(value.textContent, 10);
          const newValue = currentValue + 1;
          value.textContent = newValue;
        }
        if (data.combinedData.Type == "Repair") { 
          const value = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_launchRepairLimpet_commanderSystem`)
          const currentValue = parseInt(value.textContent, 10);
          const newValue = currentValue + 1;
          value.textContent = newValue;
        }
      }
      if (data.event == 'InWing') {
       const inWing = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_wingIMG_commanderSystem`)
        if (inWing && data.combinedData.wingStatus == 1 && inWing.classList.contains('w3-hide')) { 
          inWing.classList.remove('w3-hide')
          const description = `Joined Wing`
          descriptionContent(data,description)
        }
        if (inWing && data.combinedData.wingStatus == 0 && !inWing.classList.contains('w3-hide'))  { 
          inWing.classList.add('w3-hide')
          const description = `Wingless`
          descriptionContent(data,description)
        }
      }
      if (data.event == 'Location') { 
        const description = `Lost In Space: ${data.systemAddress}`
        descriptionContent(data,description)
      }
      if (data.event == 'FSDJump') {
        const description = `Jumped: ${data.combinedData.StarSystem}`
        descriptionContent(data,description)
      }
      if (data.event == 'Loadout') {
        document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_date_commanderSystem`).textContent = timeConversion(data.combinedData.timestamp)
        document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_causticProtection_commanderSystem`).textContent = data.combinedData.causticProtection
        document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_cargoCapacity_commanderSystem`).textContent = data.combinedData.cargoCapacity
        const description = `Loadout Changed`
        descriptionContent(data,description)
      }
      if (data.event == 'Cargo') {
        document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_date_commanderSystem`).textContent = timeConversion(data.combinedData.timestamp)
        document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_samplesInCargo_commanderSystem`).textContent = data.combinedData.SampleCargoCount
        document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_limpetsCargo_commanderSystem`).textContent = data.combinedData.limpets
       
        //update overload
        const scc = data.combinedData.SampleCargoCount
        let cp = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_causticProtection_commanderSystem`)
        cp = parseInt(cp.textContent, 10);
        const ol = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_OLPercent_commanderSystem`)
        const sampleOLRating = scc >= cp ? ((scc - cp) / cp) : 0
        const formattedNumber_sampleOLRating = (sampleOLRating).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:0});
        if (sampleOLRating > 0) { ol.textContent = formattedNumber_sampleOLRating }
      }
      if (data.event == 'CollectCargo') {
          if(isWordPresent(data.combinedData.Type,'sample')) {try {
            //Update alltime samples collected
            console.log(data.event)
            const value = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_samplesCollected_commanderSystem`)
            const currentValue = parseInt(value.textContent, 10);
            const newValue = currentValue + 1;
            value.textContent = newValue;
            const description = `Collected: ${data.combinedData.Type_Localised}`
            descriptionContent(data,description)
          }
          catch (e) {
            console.log(e)
          }
          }
          else {
            const description = `Collected: ${data.combinedData.Type_Localised}`
            descriptionContent(data,description)
          }
      }
      if (data.event == 'EjectCargo') {
        if(isWordPresent(data.combinedData.Type,'sample')) {
          document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_status_commanderSystem`).textContent = `Samples Ejected ${data.combinedData.Count}`
        }
        if(isWordPresent(data.combinedData.Type,'drones')) {
          document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_status_commanderSystem`).textContent = `Limpets Ejected ${data.combinedData.Count}`
        }
        const description = `Ejected: ${data.combinedData.Count} ${data.combinedData.Type_Localised}`
        descriptionContent(data,description)
      }
      if (data.event == 'MarketSell' || data.event == 'CargoTransfer') {
        const value = document.getElementById(`${data.combinedData.thisSampleSystem}_${data.FID}_soldToCarrier_commanderSystem`)
        const currentValue = parseInt(value.textContent, 10);
        const newValue = currentValue + 1;
        value.textContent = newValue;
        const description = `Sold ${data.combinedData.Count} ${data.combinedData.Type_Localised} `
        descriptionContent(data,description)
      }
      //Remaining Items are to update the "STATUS" block on the page.
      if (data.event == 'Shutdown') {
        const description = 'Player Offline In System'
        descriptionContent(data,description)
      }
      if (data.event == 'GalaxyMap') {
        let description = null;
        if (data.combinedData.status == 1) { description = 'Viewing Galaxy Map'}
        if (data.combinedData.status == 0) { description = 'Closed Galaxy Map'}
        descriptionContent(data,description)
      }
      if (data.event == 'SystemMap') {
        let description = null;
        if (data.combinedData.status == 1) { description = 'Viewing System Map'}
        if (data.combinedData.status == 0) { description = 'Closed System Map'}
        descriptionContent(data,description)
      }
      if (data.event == 'StartJump') {
        let description = null;
        if (data.combinedData.JumpType == 'Hyperspace') {description = `Hyperjump: ${data.combinedData.StarSystem}`}
        if (data.combinedData.JumpType == 'Supercruise') {description = `Supercruise: Initiated`}
        descriptionContent(data,description)
      }
      if (data.event == 'Supercruise') {
        let description = null;
        description = `Supercruise: ${data.combinedData.activeStarSystem}`
        descriptionContent(data,description)
      }
      if (data.event == 'StartJump_Charging') {
        let description = null;
        if (data.combinedData.status == 0) { description = "FSD Charging Cancelled"} 
        if (data.combinedData.status == 1) { description = "FSD Charging"} 
        descriptionContent(data,description)
      }
      if (data.event == 'FSDTarget') {
        let description = null;
        description = `+${data.combinedData.RemainingJumpsInRoute} Plotted: ${data.combinedData.Name}`
        descriptionContent(data,description)
      }
      if (data.event == 'NavRouteClear') {
        let description = null;
        description = "Nav Route Cleared"
        descriptionContent(data,description)
      }
      if (data.event == 'Docked' || data.event == 'Undocked') {
        const description = `${data.event}: ${data.combinedData.StationName}`
        descriptionContent(data,description)
      }
      if (data.event == 'Music') {
        let description = null;
        if (data.combinedData.MusicTrack == 'Combat_Hunters') {description = `Freaking Glaives....`; descriptionContent(data,description)}
        if (data.combinedData.MusicTrack == 'MainMenu') {description = `At Main Menu`; descriptionContent(data,description)}
        if (data.combinedData.MusicTrack == 'Combat_Unknown') {description = `Running Away...`; descriptionContent(data,description)}
        if (data.combinedData.MusicTrack == 'Unknown_Encounter') {description = `I hate Thargoids...`; descriptionContent(data,description)}
        
      }
      if (data.event == 'SupercruiseExit' || data.event == 'SupercruiseEntry') { 
        let description = null;
        if (data.event == 'SupercruiseExit') {description = `Supercruise Exit: ${data.combinedData.StarSystem}`}
        if (data.event == 'SupercruiseEntry') {description = `Supercruise: ${data.combinedData.StarSystem}`}
        descriptionContent(data,description)
      }
      if (data.event == 'SupercruiseDestinationDrop') {
        const description = `Supercruise Exited @:\n ${data.combinedData.Type}`
        descriptionContent(data,description)
      }
      if (data.event == 'DockingRequested') { 
        const description = `Requested Docking to:\n ${data.combinedData.StationName}`
        descriptionContent(data,description)
      }
      if (data.event == 'DockingGranted') { 
        const description = `Docking Granted:\n ${data.combinedData.StationName} - Pad: ${data.combinedData.LandingPad}`
        descriptionContent(data,description)
      }
      if (data.event == 'DockingCancelled') { 
        const description = `Docking Cancelled:\n ${data.combinedData.StationName}`
        descriptionContent(data,description)
      }
      if (data.event == 'DockingDenied') { 
        const description = `Docking Denied: ${data.combinedData.StationName} \n ${data.combinedData.Reason}`
        descriptionContent(data,description)
      }
      if (data.event == 'Died') { 
        const description = "Player's Soul has left this world. Ship Destroyed."
        descriptionContent(data,description)
      }
      if (data.event == 'Ressurect') { 
        const description = `ReAlived ${data.combinedData.Option}:${data.combinedData.Cost}`
        descriptionContent(data,description)
      }
      if (data.event == 'HullDamage') { 
        const formattedHealth = (data.combinedData.Health).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:1});
        const description = `HullDamage: ${formattedHealth}`
        descriptionContent(data,description)
      }
      if (data.event == 'Interdicted') {
        const description = "Interdicted"
        descriptionContent(data,description)
      }
      if (data.event == 'HeatWarning') {
        const description = "Heat Warning"
        descriptionContent(data,description)
      }
      if (data.event == 'BuyDrones') {
        const description = `Bought Limpets: ${data.combinedData.Count}`
        descriptionContent(data,description)
      }
      if (data.event == 'SystemsShutdown') {
        const description = "System Shutdown:\n I hate Thargoids even more!"
        descriptionContent(data,description)
      }
    }
    catch(e) { }
  }
})
function create_activeCommanders(systemAddress,commanderData,previousSibling) {
  if (commanderData) { 
    let container = previousSibling
    //todo if parent element is hidden, alive it, use function in functions.js
    const FID = Object.keys(commanderData)[0]
    const commander = Object.values(commanderData)[0]
    
    const TR1 = document.createElement('tr')
    container.insertAdjacentElement('afterend',TR1)
    TR1.setAttribute('class',`font-BLOCKY`)
    TR1.setAttribute('id',`${systemAddress}_${FID}_row_commanderSystem`)
    
    const TH1 = document.createElement('th')
    TR1.appendChild(TH1)
    TH1.setAttribute('class',`w3-text-orange font-BLOCKY aligned-element fitwidth`)
    TH1.setAttribute('id',`${systemAddress}_${FID}_date_commanderSystem`)
    TH1.innerText = `${timeConversion(commander.timestamp)}`

    const TH2 = document.createElement('th')
    TR1.appendChild(TH2)
    TH2.setAttribute('class',`w3-text-orange font-BLOCKY fitwidth aligned-element`)
    
        const img2 = document.createElement('img')
        TH2.appendChild(img2)
        img2.setAttribute('id',`${systemAddress}_${FID}_wingIMG_commanderSystem`)
        if (commander.inWing) { 
          img2.setAttribute('class',`gradePics2`)
        }
        else { img2.setAttribute('class',`w3-hide gradePics2`) }
        img2.setAttribute('style',`vertical-align: top;`)
        img2.setAttribute('src',`../../public/images/Wings-galaxy-map.png`)
        

        const SPAN2 = document.createElement('span')
        TH2.appendChild(SPAN2)
        SPAN2.setAttribute('id',`${systemAddress}_${FID}_commander_commanderSystem`)
        SPAN2.innerText = `${commander.commanderData.Name}`

    const TH3 = document.createElement('th')
    TR1.appendChild(TH3)
    TH3.setAttribute('class',`w3-text-orange font-BLOCKY fitwidth `)

        const img1 = document.createElement('img')
        TH3.appendChild(img1)
        img1.setAttribute('id',`${systemAddress}_${FID}_shipIMG_commanderSystem`)
        img1.setAttribute('class',`circle-background gradePics`)
        img1.setAttribute('style',`vertical-align: top;`)
        img1.setAttribute('src',`../../public/images/ships_cartoon/${commander.loadout.ship}.png`)

        const SPAN4 = document.createElement('span')
        TH3.appendChild(SPAN4)
        SPAN4.setAttribute('id',`${systemAddress}_${FID}_ship_commanderSystem`)
        SPAN4.setAttribute('class',`aligned-element`)
        SPAN4.innerText = `${commander.loadout.ship.toUpperCase()}`
    
    const TH35 = document.createElement('th')
    TR1.appendChild(TH35)
    TH35.setAttribute('class',`w3-text-orange font-BLOCKY fitwidth aligned-element`)

        const SPAN35 = document.createElement('span')
        TH35.appendChild(SPAN35)
        SPAN35.setAttribute('id',`${systemAddress}_${FID}_status_commanderSystem`)
        SPAN35.setAttribute('class',``)
        SPAN35.innerText = commander.status

    const TH4 = document.createElement('th')
    TR1.appendChild(TH4)
    TH4.setAttribute('class','w3-center aligned-element')
        const rll = commander.limpetsLaunched.Research
        const sac = commander.samplesCollected 
        let sampleRating = null
        let sampleRating_view = null;
        if (sac == 0 || rll == 0) { sampleRating = 0; sampleRating_view = 0 }
        else { sampleRating = sac / rll; sampleRating_view = 1}
        currentcolorpercentage = progressBar(sampleRating)
        let distance = sampleRating
        if (distance === 1) {
          distance = 100;
        } else if (distance < 1) {
          distance *= 100;
        }
        const progress_container = document.createElement('span')
        TH4.appendChild(progress_container)
        progress_container.setAttribute('class','progress-container')
        // progress_container.setAttribute('style','text-align: right;')
      
        const progress_bar = document.createElement('span')
        progress_container.appendChild(progress_bar);
        progress_bar.setAttribute("id",`${systemAddress}_${FID}_sampleRating_commanderSystem`)
        progress_bar.setAttribute("class","w3-vivid-highvis progress-bar warprogresspercent")
        progress_bar.setAttribute("style",`background: linear-gradient(45deg,#ff0000,${currentcolorpercentage[0]} 1%);height: 100%; `)
        const formattedNumber2 = (sampleRating).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:1});
        if (sampleRating_view) {
          progress_bar.innerText = `${formattedNumber2} `
        }

    const TH5 = document.createElement('th')
    TR1.appendChild(TH5)
    TH5.setAttribute('class',`w3-text-brightgreen font-BLOCKY aligned-element`)

        const SPAN6 = document.createElement('span')
        TH5.appendChild(SPAN6)
        SPAN6.setAttribute('id',`${systemAddress}_${FID}_samplesInCargo_commanderSystem`)
        SPAN6.setAttribute('class',`w3-text-brightgreen `)
        SPAN6.innerHTML = `${commander.cargo.SampleCargoCount}` + "&nbsp;&nbsp;"

        const SPAN7 = document.createElement('span')
        TH5.appendChild(SPAN7)
        SPAN7.setAttribute('id',`${systemAddress}_${FID}_OLPercent_commanderSystem`)
        SPAN7.setAttribute('class',`w3-text-red `)
        const cp = commander.loadout.causticProtection
        const scc = commander.cargo.SampleCargoCount
        const sampleOLRating = scc >= cp ? ((scc - cp) / cp) : 0
        const formattedNumber_sampleOLRating = (sampleOLRating).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:0});
        if (sampleOLRating > 0) { SPAN7.innerText = formattedNumber_sampleOLRating }
    
    const TH6 = document.createElement('th')
    TR1.appendChild(TH6)
    TH6.setAttribute('class',`w3-text-yellow font-BLOCKY aligned-element`)

        const SPAN8 = document.createElement('span')
        TH6.appendChild(SPAN8)
        SPAN8.setAttribute('id',`${systemAddress}_${FID}_limpetsCargo_commanderSystem`)
        SPAN8.setAttribute('class',`w3-text-orange font-BLOCKY `)
        SPAN8.innerText = `${commander.cargo.limpets}`


    const TH7 = document.createElement('th')
    TR1.appendChild(TH7)
    TH7.setAttribute('class','aligned-element')
    
        const SPAN9 = document.createElement('span')
        TH7.appendChild(SPAN9)
        SPAN9.setAttribute('id',`${systemAddress}_${FID}_causticProtection_commanderSystem`)
        SPAN9.setAttribute('class',`w3-text-orange font-BLOCKY `)
        SPAN9.innerText = `${commander.loadout.causticProtection}`

    const TH8 = document.createElement('th')
    TR1.appendChild(TH8)
    TH8.setAttribute('class','aligned-element')

        const SPAN10 = document.createElement('span')
        TH8.appendChild(SPAN10)
        SPAN10.setAttribute('id',`${systemAddress}_${FID}_cargoCapacity_commanderSystem`)
        SPAN10.setAttribute('class',`w3-text-orange font-BLOCKY `)
        SPAN10.innerText = `${commander.loadout.cargoCapacity}`

    const TH9 = document.createElement('th')
    TR1.appendChild(TH9)
    TH9.setAttribute('class','aligned-element')

      const SPAN11 = document.createElement('span')
      TH9.appendChild(SPAN11)
      SPAN11.setAttribute('id',`${systemAddress}_${FID}_soldToCarrier_commanderSystem`)
      SPAN11.setAttribute('class',`w3-text-orange font-BLOCKY `)
      SPAN11.innerText = `${commander.soldToCarrier + commander.soldToRMS}`

    const TH10 = document.createElement('th')
    TR1.appendChild(TH10)
    TH10.setAttribute('class','aligned-element')

      const SPAN12 = document.createElement('span')
      TH10.appendChild(SPAN12)
      SPAN12.setAttribute('id',`${systemAddress}_${FID}_samplesCollected_commanderSystem`)
      SPAN12.setAttribute('class',`w3-text-orange font-BLOCKY `)
      SPAN12.innerText = `${commander.samplesCollected}`

    const TH11 = document.createElement('th')
    TR1.appendChild(TH11)
    TH11.setAttribute('class','w3-text-white font-BLOCKY fitwidth w3-center aligned-element')
    
    
      const SPAN13 = document.createElement('span')
      TH11.appendChild(SPAN13)
      SPAN13.setAttribute('id',`${systemAddress}_${FID}_launchResearchLimpet_commanderSystem`)
      SPAN13.setAttribute('class',`w3-text-brightgreen `)
      SPAN13.innerText = `${commander.limpetsLaunched.Research}`

      const SPAN135 = document.createElement('span')
      TH11.appendChild(SPAN135)
      SPAN135.innerText = " | "

      const SPAN14 = document.createElement('span')
      TH11.appendChild(SPAN14)
      SPAN14.setAttribute('id',`${systemAddress}_${FID}_launchCollectorLimpet_commanderSystem`)
      SPAN14.setAttribute('class',`w3-text-yellow `)
      SPAN14.innerText = `${commander.limpetsLaunched.Collection}`

      const SPAN145 = document.createElement('span')
      TH11.appendChild(SPAN145)
      SPAN145.innerText = " | "

      const SPAN15 = document.createElement('span')
      TH11.appendChild(SPAN15)
      SPAN15.setAttribute('id',`${systemAddress}_${FID}_launchRepairLimpet_commanderSystem`)
      SPAN15.setAttribute('class',`w3-text-cyan`)
      SPAN15.innerText = `${commander.limpetsLaunched.Repair}`
  }
}