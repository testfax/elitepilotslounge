// const { initializeEvent } = require('../utils/eventsHandler');

try {
    const {watcherConsoleDisplay,errorHandler,pageData,getCommander} = require('../utils/errorHandlers')
    const { app, ipcMain, BrowserWindow,webContents  } = require('electron');
    const {logs} = require('../utils/logConfig')
    const Store = require('electron-store');
    const windowItemsStore = new Store({ name: 'electronWindowIds'})
    let lastTitan = null
    if (!windowItemsStore.get('brain_ThargoidSample')) { //socket related
      windowItemsStore.set('brain_ThargoidSample',"brain-ThargoidSample_Thor_Controlled")
      lastTitan = windowItemsStore.get('brain_ThargoidSample')
    }
    else { lastTitan = windowItemsStore.get('brain_ThargoidSample') }
    const thisWindow = windowItemsStore.get('electronWindowIds')
    const client = BrowserWindow.fromId(thisWindow.win);
    const lcs = require('../utils/loungeClientStore')
    const taskManager = require('../sockets/taskManager')
    const path = require('path')
    const fs = require('fs')
    const {fetcher} = require('./brain_functions')
    
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //List of events that require a brain to do work in the background. This brain handles the below.
    //          > Event Handler
    //          < Brain Event
    //          ^ Socket Handler
    //          * Socket Complete
    //todo      *^<>Loadout (Startup)
    //todo      *^<>Commander (Startup)
    //!!        Cargo (Startup)
    //todo      *^<>Cargo (JSON)
    //todo      <>Market (JSON)
    //todo      *^<>CollectCargo (Trade)
    //todo      *^<>EjectCargo (Trade)
    //todo      *^<>MarketSell (Trade)
    //todo      <>MarketBuy (Trade)
    //todo      <>Died (Combat)
    //todo      <>ShieldState (Combat)
    //todo      <>Shutdown (Other Events)
    //todo      <>RebootRepair (Other Events)
    //todo      <>CockpitBreached (Other Events)
    //todo      *^<>CargoTransfer (Other Events)
    //todo      <>SupercruiseDestinationDrop (Other Events)
    //todo      <>Music (Other Events) -> MusicTrack:"MainMenu"
    //todo      *^<>LaunchDrone (Other Events)
    //todo      <>ReceiveText(Other Events)
    //todo      <>USSDrop (Other Events)
    //todo      <>WingJoin (Other Events)
    //todo      <>WingAdd (Other Events)
    //todo      <>WingLeave (Other Events)
    //todo      <>WingInvite (Other Events)
    //todo      <>FSSSignalDiscovered (Exploration)
    //todo      *^<>FSDJump (Travel)
    //todo      <>FSDTarget (Travel)
    //todo      <>StartJump (Travel)
    //todo      *^<>Location (Travel)
    //todo      <>SupercruiseExit (Travel)
    //todo      <>SupercruiseEntry (Travel)
    //todo      <>NavRouteClear (Travel)
    //todo      <>Docked (Travel)
    //todo      <>Undocked (Travel)
    //todo      <>FactionKillBond (Combat)
    //todo      <>CarrierNameChanged (Fleet Carriers)
    //todo      <>CarrierJumpRequest (Fleet Carriers)
    //todo      *^<>CarrierJump (Fleet Carriers) // Handled through FSDJump functionality.
    //todo      <>CarrierJumpCancelled (Fleet Carriers)
    //todo      <>ShipyardSwap (Station Services)
    //todo      SearchAndRescue (Station Services)
    //!Functions!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function dataHistory(fileName) {
      try {
      let response = null;
      const FET = {
        filePath: [`../events/Appendix/${fileName}.json`]
      }
        let gPath = path.join(__dirname,FET.filePath[0])
        gPath = path.normalize(gPath)
        const fetched = fs.readFileSync(gPath,'utf8', (err) => { if (err) return logs(err); });
        response = JSON.parse(fetched)
        return response
      }
      catch(e) { errorHandler(e,e.name)}
    }
    function findMatObject(obj, key, value, parentKey = null) {
      if (typeof obj === 'object' && obj !== null) {
        if (obj[key] === value) {
          return { ...obj, type: parentKey };
        }
        for (const prop in obj) {
          const foundObject = findMatObject(obj[prop], key, value, prop);
          if (foundObject) {
            if (parentKey !== null) {
              foundObject.type = parentKey;
            }
            return foundObject;
          }
        }
      }
      return null;
    }
    function distances(cmdrLocation,type) {
      const searchType = dataHistory("itemSearchTable")
      let arrayDistances = {}
      searchType[type].forEach(tl=>{
        const distance = Math.sqrt(Math.pow(tl.x - cmdrLocation[0],2) + Math.pow(tl.y - cmdrLocation[1],2) + Math.pow(tl.z - cmdrLocation[2],2));
        const cmdrDistance = distance.toFixed(2);
        arrayDistances[tl.titan] = cmdrDistance 
      })
      const distancesArray = Object.entries(arrayDistances)
      distancesArray.sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));
      const sortedDistances = Object.fromEntries(distancesArray);
      return sortedDistances
    }
    function redisUpdaterSetup(dataEvent,thargoidSampling) {
      // Order of events from login:
      // Cargo -> Commander -> Location -> Loadout
      // Cargo resets all variables
      // FSDJump is added to the launchToRedis variable if detected
      //        intended so that it doesn't compete with Location event.
      // Location is purely for if a user login in intended system to sample in.
      // CollectCargo will be the final nail in the coffin to determine by sample type if the user has collected a sample.
      // Completion of all events will trigger save.
      // After a save, the redisFirstUpdateflag flag will be set to "True", indicating that the user setup for the system has already been completed.
      //     preventing the redisUpdaterSetu function from starting.
      // An FSDJump/CarrierJump event will trigger all variables to be reset and the process can start again.
      // The redis server will determine if the user is already setup, if it is, it simply ignores the request.
      try {
        const event = 'brain-ThargoidSample-SETUP'
        if (!checkSetupFlag()) {
          //Remove Duplicates
          launchToRedis = [...new Set(launchToRedis)]
          //Check to make sure all the launch Events are in thargoidSampling
          
          const matching = launchToRedis.every((event) => { 
            return Object.values(thargoidSampling).some((item) => item.event === event)
          })
          //! ERROR CHECKING
          //! ERROR CHECKING
          const errorChecking = 1 // [1: On] [0: Off]
          //! ERROR CHECKING
          //! ERROR CHECKING
          if (errorChecking) {
            let missingEvents = null
            if (!matching) {
              Object.keys(thargoidSampling).forEach(i=>{logs(`[${i}]`.red)})
              missingEvents = launchToRedis.filter((event) => {
                return !Object.values(thargoidSampling).some((item) => item.event === event);
              });
              const matching = missingEvents.length === 0;
              logs("Missing Events:".bgRed,missingEvents,"Matching:".yellow,`${matching}`.red)
            }
            else { logs("Missing Events:".bgRed,missingEvents,"Matching:".yellow,`${matching}`.green) }
          }
          //! ERROR CHECKING
          if (matching 
            // && thargoidSampling.Loadout.combinedData.researchLimpetControllers >= 2 
            && thargoidSampling.Loadout.combinedData.causticProtection >= 16
            && currentSystemState != ''
            ) { 
              store.set('redisFirstUpdateflag',matching)
              taskManager.brain_ThargoidSample_socket(thargoidSampling,event,findActiveSocketKey())
              if (errorChecking) { logs("[BE TS]".bgCyan,`${event} Sent to Redis`.green); }
          }
          else { store.set('redisFirstUpdateflag',false) 
            if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${event} Allow more events until updater stop`) }
          }
        }
      }
      catch(e) { logs("redisUpdaterSetu".bgMagenta) }
    }
    function fetchFromDCOH(data){ 
      const systemData = fetch(`https://dcoh.watch/api/v1/Overwatch/System/${data}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok',response.status);
            }
            return response.json();
        })
        .then(item => {
          logs(item.populationOriginal);
           
        })
        .catch(e => {
            logs(`[DCOH] specific system failed`.bgYellow,e)
        })
    }
    function checkSetupFlag(event) {
      if (store.get('redisFirstUpdateflag')) { 
        if (event) { logs(`${event}`.bgCyan,"{",`{redisFirstUpdateflag:`.green,store.get('redisFirstUpdateflag'),"}") }
        return true
      }
      if (!store.get('redisFirstUpdateflag')) {
        if (event) { logs(`${event}`.bgCyan,"{",`redisFirstUpdateflag:`.red,store.get('redisFirstUpdateflag'),"}") }
        return false
      }
    }
    function blastToUI(data,review) { 
      review = false
      if (windowItemsStore.get('currentPage') == thisBrain) {
        const client = BrowserWindow.fromId(thisWindow.win);
        client.webContents.send("from_brain-ThargoidSample", data);
        if (review) { logs("Review:".yellow,data,store.get('redisFirstUpdateflag')) }
      }
    }
    function findActiveSocketKey() {
      const rooms = windowItemsStore.get('socketRooms')
      // const rooms = windowItemsStore.get('brain-ThargoidSample.currentTitanState')
      const entry = Object.entries(rooms).find(([key, value]) => value === true);
      return entry ? entry[0] : lastTitan.currentTitanState; 
    }
    //!BRAIN EVENT######################################################
    //!Startup Variables
    const thisBrain = 'brain-ThargoidSample'
    const visible = 0 //! Sets watcher visibility locally. watchervisibility will still have to be enabled globally in errorHandlers
    const store = new Store({ name: `${thisBrain}` })
    if (!store.get('redisFirstUpdateflag')) { store.set('redisFirstUpdateflag',false) }
    if (!store.get('masterTimestamp')) { store.set('masterTimestamp',false) }
    if (!store.get('systemAddress')) { store.set('systemAddress',false) }
    if (!store.get('activeStarSystem')) { store.set('activeStarSystem',false) }
    let thargoidSampling = {}
    //!                   List all events that will be looked for by this brain.
    const eventNames = [
      "Fsd Charging",
      "CollectCargo",
      "EjectCargo",
      "MarketSell",
      "MarketBuy",
      "Shutdown",
      // "LaunchDrone",
      "StartJump",
      "FSDTarget",
      // "NavRouteClear",
      "FSSSignalDiscovered",
      "Docked",
      "DockingRequested",
      "DockingGranted",
      "DockingCancelled",
      "Undocked",
      "FactionKillBond",
      "CarrierJumpRequest",
      "CarrierJump",
      "CarrierJumpCancelled",
      "CarrierNameChanged",
      "USSDrop",
      "Music",
      // "ReceiveText",
      "Supercruise",
      "Fsd Charging",
      "SystemMap",
      "GalaxyMap",
      "SupercruiseExit",
      "SupercruiseEntry",
      "SupercruiseDestinationDrop",
      "Died",
      "Ressurect",
      "HullDamage",
      "Interdicted",
      "HeatWarning",
      "BuyDrones",
      "SystemsShutdown",
    ]
    //!                   Events that must be present in the store for thargoid sample to fire to redis.
    let launchToRedis = [
      // 'InWing',
      'LaunchDrone',
      'Cargo',
      'Location',
      'Commander',
      'Loadout',
    ]
    let currentSystemState = "";
    let currentCargo = null
    let FID = getCommander().FID
    let FSDChargeCount = 0
    let supercruiseCount = 0;
    let guifocus = 0;
    //!BRAIN EVENTs######################################################
    app.on('window-all-closed', () =>{ store.set('redisFirstUpdateflag',false) })
    ipcMain.on(thisBrain, async (receivedData) => {
      if (receivedData.event == 'template') {
        logs(colorize(receivedData, { pretty: true }))
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
            if (store.get('redisFirstUpdateflag')) { 
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
            }
          }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Status') {
        function inWingStuff(timestamp,action) {
          let compiledArray = { "event": "InWing", "brain": thisBrain, "systemAddress": store.get('thisSampleSystem'),"combinedData": {timestamp: timestamp, wingStatus: action }, "FID": FID }
          thargoidSampling["InWing"] = compiledArray
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          if (!store.get('wingStatus')) { store.set('wingStatus',compiledArray) } //Initialize the object in the store.
          if (store.get('thisSampleSystem.combinedData.wingStatus') != action) { 
            if (store.get('redisFirstUpdateflag')) { 
              const client = BrowserWindow.fromId(thisWindow.win);
              client.webContents.send("from_brain-ThargoidSample", compiledArray);
              taskManager.brain_ThargoidSample_socket(compiledArray,"InWing",findActiveSocketKey())
            }
          }
          else { store.set('wingStatus',compiledArray) }
        }
        if (receivedData.Flags1.includes('In Wing')) { inWingStuff(receivedData.timestamp,1) }
        if (!receivedData.Flags1.includes('In Wing')) { inWingStuff(receivedData.timestamp,0) }
        // logs(receivedData)
        // logs("====================================")
        //Viewing GalaxyMap
        if (receivedData.GuiFocus == 6 && eventNames.includes('GalaxyMap') && guifocus != 6) { guifocus = 6
          try {
            let compiledArray = { "event": "GalaxyMap", "brain": thisBrain, "combinedData": {"status":1,"timestamp":receivedData.timestamp}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
            compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
            if (store.get('redisFirstUpdateflag')) {
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,"GalaxyMap",findActiveSocketKey())
            }
          }
          catch(e) { errorHandler(e,e.name)}
        }
        if (receivedData.GuiFocus == 0 && eventNames.includes('GalaxyMap') && guifocus == 6) { guifocus = 0
          try {
            let compiledArray = { "event": "GalaxyMap", "brain": thisBrain, "combinedData": {"status":0,"timestamp":receivedData.timestamp}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
            compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
            if (store.get('redisFirstUpdateflag')) {
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,"GalaxyMap",findActiveSocketKey())
            }
          }
          catch(e) { errorHandler(e,e.name)}
        }
        //Viewing SystemMap
        if (receivedData.GuiFocus == 7 && eventNames.includes('SystemMap') && guifocus != 7) { guifocus = 7
          try {
            let compiledArray = { "event": "SystemMap", "brain": thisBrain, "combinedData": {"status":1,"timestamp":receivedData.timestamp}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
            compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
            if (store.get('redisFirstUpdateflag')) {
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,"SystemMap",findActiveSocketKey())
            }
          }
          catch(e) { errorHandler(e,e.name)}
        }
        if (receivedData.GuiFocus == 0 && eventNames.includes('SystemMap') && guifocus == 7) { guifocus = 0
          try {
            let compiledArray = { "event": "SystemMap", "brain": thisBrain, "combinedData": {"status":0,"timestamp":receivedData.timestamp}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
            compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
            if (store.get('redisFirstUpdateflag')) {
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,"SystemMap",findActiveSocketKey())
            }
          }
          catch(e) { errorHandler(e,e.name)}
        }
        //Supercruise
        if (receivedData.Flags1.includes('Supercruise') && eventNames.includes('Supercruise') && supercruiseCount < 1) {
          try {
            let compiledArray = { "event": 'Supercruise', "brain": thisBrain, "combinedData": {"status":1,"timestamp":receivedData.timestamp,"activeStarSystem":store.get('activeStarSystem')}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
            compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
            if (store.get('redisFirstUpdateflag')) {
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,'Supercruise',findActiveSocketKey())
            }
              supercruiseCount++
              FSDChargeCount = 0;
            }
          catch(e) { errorHandler(e,e.name)}
        }
        if (!receivedData.Flags1.includes('Supercruise') && eventNames.includes('Supercruise') && supercruiseCount >= 1) { 
          supercruiseCount = 0
          FSDChargeCount = 0
        }
        //FSD Charging 
        if (receivedData.Flags1.includes('Fsd Charging') && eventNames.includes('Fsd Charging') && FSDChargeCount < 1) {
          try {
            let compiledArray = { "event": 'StartJump_Charging', "brain": thisBrain, "combinedData": {"status":1,"timestamp":receivedData.timestamp}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
            compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
              if (store.get('redisFirstUpdateflag')) {
                // const indexToRemove = eventNames.indexOf('FSDTarget');
                // if (indexToRemove !== -1) { eventNames.splice(indexToRemove, 1); }
                // setTimeout(()=>{ eventNames.push('FSDTarget') },5000)

                // const indexToRemove2 = eventNames.indexOf('Fsd Charging');
                // if (indexToRemove !== -1) { eventNames.splice(indexToRemove, 1); }
                // setTimeout(()=>{ eventNames.push('Fsd Charging') },5000)
                
                blastToUI(compiledArray)
                taskManager.brain_ThargoidSample_socket(compiledArray,'StartJump_Charging',findActiveSocketKey())
              }
              FSDChargeCount++
              logs("FSDChargeCount",FSDChargeCount)
            }
          catch(e) { errorHandler(e,e.name)}
        }
        if (!receivedData.Flags1.includes('Fsd Charging') && !receivedData.Flags1.includes('Supercruise') && FSDChargeCount >= 1) { 
          FSDChargeCount = 0
          logs("FSDChargeCount",FSDChargeCount)
          let compiledArray = { "event": 'StartJump_Charging', "brain": thisBrain, "combinedData": {"status":0,"timestamp":receivedData.timestamp}, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')

            if (store.get('redisFirstUpdateflag')) {
              // const indexToRemove = eventNames.indexOf('FSDTarget');
              // if (indexToRemove !== -1) { eventNames.splice(indexToRemove, 1); }
              // setTimeout(()=>{ eventNames.push('FSDTarget') },5000)

              // const indexToRemove2 = eventNames.indexOf('Fsd Charging');
              // if (indexToRemove !== -1) { eventNames.splice(indexToRemove, 1); }
              // setTimeout(()=>{ eventNames.push('Fsd Charging') },5000)
              
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,'StartJump_Charging',findActiveSocketKey())
            }
        }
        // -------------------------- TEST CODE BELOW
        // if (receivedData.Flags1.includes('Lights On') && (windowItemsStore.get('currentPage') == thisBrain) ) {
          
        //   // logs("LIGHTS ON")
        //   store.set('redisFirstUpdateflag',false);
        //   checkSetupFlag("LIGHTS ON!!!!");
        //   const indexToRemove = launchToRedis.indexOf('FSDJump');
        //   if (indexToRemove !== -1) { launchToRedis.splice(indexToRemove, 1); }
        //   let combinedData = {}
        //   let compiledArray = {
        //     "event": "reset",
        //     "brain": thisBrain,
        //     "systemAddress": store.get('thisSampleSystem'),
        //     "combinedData": combinedData, 
        //     "FID": FID
        //   }
          
        //   const response = await taskManager.brain_ThargoidSample_socket(compiledArray,compiledArray.event,findActiveSocketKey())
        //   logs("RESET:".bgCyan,response)
        // }
        // -------------------------- TEST CODE ABOVE
      }
      if (receivedData.event == 'CollectCargo') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          if (currentSystemState != "") {
            let compiledArray = { "event": receivedData.event, "brain": thisBrain, "systemAddress": store.get('systemAddress'),"combinedData": receivedData, "FID": FID }
            thargoidSampling[receivedData.event] = compiledArray
            if (store.get('redisFirstUpdateflag')) {
              compiledArray.combinedData["thisSampleSystem"] = store.get('systemAddress')
              store.set('thisSampleSystem',store.get('systemAddress'))
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
            }
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Cargo') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try{
          let combinedData = { "sampleCargo":[],"SampleCargoCount":0,"notSampleCargoCount":0,"notSampleCargo": [],"limpets": 0 }
          let compiledArray = {
            "event": receivedData.event,
            "brain": thisBrain,
            "systemAddress": store.get('thisSampleSystem'),
            "combinedData": combinedData, 
            "FID": FID
          }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          const itemSearchTable = dataHistory("itemSearchTable")
          receivedData.Inventory.forEach(item => {
            item['Name_Cargo'] = item.Name
            specificItem = findMatObject(itemSearchTable.marketData, "Name_Cargo",item.Name_Cargo)
            if (item.Name == "drones") { combinedData.limpets = item.Count }
            if (specificItem != null && specificItem.Name_Cargo == item.Name_Cargo) {
              // logs(item.Name,"FOUND".green)
              // logs(colorize(specificItem, { pretty: true }))
              combinedData.sampleCargo.push(item)
              combinedData.SampleCargoCount = item.Count
            }
            else {
              // logs(item.Name,"NOT FOUND".red)
              // logs(colorize(item, { pretty: true }))
              combinedData.notSampleCargo.push(item)
              combinedData.notSampleCargoCount = item.Count
            }
          })
          compiledArray.combinedData.timestamp = receivedData.timestamp
          // logs("NOT FOUND ARRAY".yellow)
          // logs(colorize(compiledArray.combinedData.notSampleCargo, { pretty: true }))
          // logs(colorize(compiledArray, { pretty: true }))
          // if (redisFirstUpdateflag) { ipcMain.emit(`event-callback-${receivedData.event}`,compiledArray) }
          thargoidSampling[receivedData.event] = compiledArray
          currentCargo = compiledArray
          store.set('cargo',compiledArray)
          if (store.get('redisFirstUpdateflag')) { 
            blastToUI(compiledArray)
            taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Commander') {
        // logs("2".red)
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try{
          // used to clear the variable on a soft exit to the menu.
          //JSON Files log files will always have first priority.
          thargoidSampling = {}
          store.set('redisFirstUpdateflag',false);
          currentSystemState = "";
          const indexToRemove = launchToRedis.indexOf('FSDJump');
          if (indexToRemove !== -1) {
            launchToRedis.splice(indexToRemove, 1);
          }
          //JSON Files log files will always have first priority.
          //
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "systemAddress": store.get('thisSampleSystem'), "combinedData": receivedData, "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          // if (store.get('redisFirstUpdateflag')) { ipcMain.emit(`event-callback-${receivedData.event}`,compiledArray) }
          thargoidSampling["Cargo"] = currentCargo
          thargoidSampling[receivedData.event] = compiledArray

          // if (store.get('redisFirstUpdateflag')) { 
          //   const client = BrowserWindow.fromId(thisWindow.win);
          //   client.webContents.send("from_brain-ThargoidSample", compiledArray);
          // }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Loadout') {
        // logs("4".red)
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try{
          const itemSearchTable = dataHistory("itemSearchTable")
          let specificItem = null;
          let cargoLoadout = {
            ship: receivedData.Ship,
            causticProtection: 0,
            cargoCapacity: receivedData.CargoCapacity,
            researchLimpetControllers: 0,
          }
          receivedData.Modules.forEach(i=>{
            const keysToFindFromItemSearchTable = [
              'cargoracks',
              'researchControllers'
            ]
            keysToFindFromItemSearchTable.forEach(key=>{
              specificItem = findMatObject(itemSearchTable[key], "name",i.Item)
              if (specificItem) {
                if (specificItem.causticProtect) { 
                  cargoLoadout.causticProtection = cargoLoadout.causticProtection + specificItem.capacity
                }
                if (specificItem.maximumLimpet) {
                  cargoLoadout.researchLimpetControllers = cargoLoadout.researchLimpetControllers + specificItem.maximumLimpet
                }
              }
            })
          })
          let compiledArray = {  "event": receivedData.event, "brain": thisBrain, "systemAddress": store.get('thisSampleSystem'), "combinedData": cargoLoadout, "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          thargoidSampling[receivedData.event] = compiledArray
          if (store.get('redisFirstUpdateflag')) { 
            blastToUI(compiledArray)
            taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey()) 
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Location') {
        // logs("3".red)
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try{
          const propCheck = [
            'DistFromStarLS',
            'Docked',
            'StationName',
            'StationType',
            'MarketID',
            'StarSystem',
            'SystemAddress',
            'StarPos',
            'SystemSecurity_Localised',
            'Population',
            'ThargoidWar',
            'timestamp',
          ]
          let combinedData = {}
          store.set('systemAddress',receivedData.SystemAddress) 
          store.set('activeStarSystem',receivedData.StarSystem) 
          currentSystemState = "";
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "systemAddress": receivedData.SystemAddress, "combinedData":combinedData, "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          propCheck.forEach(ele => {
            if (receivedData.hasOwnProperty(ele)) {
              if (ele == "ThargoidWar") {
                combinedData['WarProgress'] = receivedData.ThargoidWar.WarProgress
                combinedData['CurrentState'] = receivedData.ThargoidWar.CurrentState
                currentSystemState = combinedData.CurrentState;
              }
              else { combinedData[ele] = receivedData[ele] }
            }
          })
          // logs(colorize(compiledArray, { pretty: true }))
          let nearestTitanToCmdr = distances(combinedData.StarPos,'titanLocation')
          const [titan,ly] = Object.entries(nearestTitanToCmdr)[0]
          nearestTitanToCmdr = {[titan]:ly}
          combinedData.nearestTitan = nearestTitanToCmdr
          thargoidSampling[receivedData.event] = compiledArray
          //Send location to server regardless
          //! Relog Handling
          if (receivedData.SystemAddress == store.get('thisSampleSystem')) {
            compiledArray.combinedData.SystemAddress = receivedData.SystemAddress
          }
          if (receivedData.SystemAddress != store.get('thisSampleSystem')) {
            compiledArray.combinedData.SystemAddress = store.get('thisSampleSystem')
          }
          const response = await taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
          const broadcastability = response.map(i => { if (i.hasOwnProperty('presentFID')) { return i.presentFID } return null })
          const timestampExpiry = new Date(receivedData.timestamp) - new Date(store.get('masterTimestamp'))
          const timestampMaxAge = 20 * 60 * 1000
          if (broadcastability[0] && timestampExpiry <= timestampMaxAge) { store.set('redisFirstUpdateflag',true); blastToUI(compiledArray) }
          
          //! For Console display:
          //! For Console display:
          const showJumps = 1
          //! For Console display:
          //! For Console display:
          if (showJumps) {
            const request = [
              {
                "from": "brain-ThargoidSample",
                "description":`population: ${receivedData.event}`,
                "type": "redisRequest",
                "method": "GET",
                "data": {
                  "dcohSystems": [
                    "$.systems[*].systemAddress",
                    "$.systems[*].populationOriginal",
                  ]
                },
                "keys": [
                  "systemAddress",
                  "populationOriginal",
                  
                ]
              }
            ]
            let stuff = {
              "timestamp": receivedData.timestamp,
              "System": combinedData.StarSystem, 
              "SystemAddress": combinedData.SystemAddress, 
              "WarProgress": combinedData.WarProgress, 
              "State":combinedData.CurrentState ? combinedData.CurrentState: "Clean",
            }
            taskManager.eventDataStore(request[0], (message) => {
              message.response.redisResult.forEach(item => {
                if (item.systemAddress == receivedData.SystemAddress) {
                  stuff["Original Population"] = item.populationOriginal
                  stuff[`LY to ${titan}`] = Object.values(combinedData.nearestTitan)[0] ? Object.values(combinedData.nearestTitan)[0] : ""
                  logs(colorize(stuff, { pretty: true }))
                }
              })
            })
          }
        
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'FSDJump' || receivedData.event == 'CarrierJump') {
        try {
          // if (store.get('redisFirstUpdateflag')) { logs(`Redis setup is not running and redis is ready to receive ${store.get('redisFirstUpdateflag')}`) }
          if (store.get('thisSampleSystem') == receivedData.SystemAddress) {
            store.set('redisFirstUpdateflag',true)
          }
          const propCheck = [
            'SystemAddress',
            'StarSystem',
            'ThargoidWar',
            'Population',
            'StarPos',
            'SystemSecurity_Localised',
            'timestamp',
          ]
          let combinedData = {}
          currentSystemState = ""
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "systemAddress": store.get('thisSampleSystem'), "combinedData":combinedData, "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          propCheck.forEach(ele => {
            if (receivedData.hasOwnProperty(ele)) {
              if (ele == "ThargoidWar") {
                combinedData['WarProgress'] = receivedData.ThargoidWar.WarProgress
                combinedData['CurrentState'] = receivedData.ThargoidWar.CurrentState
                currentSystemState = compiledArray.combinedData.CurrentState;
              }
              else { combinedData[ele] = receivedData[ele] }
            }
          })
          let nearestTitanToCmdr = distances(compiledArray.combinedData.StarPos,'titanLocation')
          const [titan,ly] = Object.entries(nearestTitanToCmdr)[0]
          nearestTitanToCmdr = {[titan]:ly}
          compiledArray.combinedData.nearestTitan = nearestTitanToCmdr
          //Begin the saving process...
          thargoidSampling[receivedData.event] = compiledArray
          let saveBrain = []
          //Only save current system information that is gathered.
          saveBrain["Commander"] = thargoidSampling.Commander 
          saveBrain["Loadout"] = thargoidSampling.Loadout 
          saveBrain["FSDJump"] = thargoidSampling.FSDJump 
          saveBrain["Location"] = thargoidSampling.Location
          saveBrain["Cargo"] = currentCargo
          //Clear old accrued data from every event that has occured.
          thargoidSampling = saveBrain
          //Insert current information
          saveBrain.forEach(i=>{ thargoidSampling[Object.keys(i)[0]] = i })
          blastToUI(compiledArray)
          if (combinedData.CurrentState != '' && store.get('thisSampleSystem') != receivedData.SystemAddress) {
            store.set('redisFirstUpdateflag',false)
            launchToRedis.push('FSDJump')
          }
          //Send location to server regardless
          //Conditions are now set if this is a system that is differen't from previous sampling system.
          store.set('systemAddress',receivedData.SystemAddress)
          store.set('activeStarSystem',receivedData.StarSystem) 
          taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
          
    
          //! For Console display:
          //! For Console display:
          const showJumps = 1
          //! For Console display:
          //! For Console display:
          if (showJumps) {
            const request = [
              {
                "from": "brain-ThargoidSample",
                "description":`population: ${receivedData.event}`,
                "type": "redisRequest",
                "method": "GET",
                "data": {
                  "dcohSystems": [
                    "$.systems[*].systemAddress",
                    "$.systems[*].populationOriginal",
                  ]
                },
                "keys": [
                  "systemAddress",
                  "populationOriginal",
                ]
              }
            ]
            let stuff = {
              "timestamp": receivedData.timestamp,
              "System": combinedData.StarSystem, 
              "SystemAddress": combinedData.SystemAddress, 
              "WarProgress": combinedData.WarProgress, 
              "State":combinedData.CurrentState ? combinedData.CurrentState : "Clean",
            }
            taskManager.eventDataStore(request[0], (message) => {
              message.response.redisResult.forEach(item => {
                if (item.systemAddress == receivedData.SystemAddress) {
                  stuff["Original Population"] = item.populationOriginal
                  stuff[`LY to ${titan}`] = Object.values(combinedData.nearestTitan)[0] ? Object.values(combinedData.nearestTitan)[0] : ""
                  logs(colorize(stuff, { pretty: true }))
                }
              })
            })
          }
        }
        catch(e) { logs(e) }
      }
      if (receivedData.event == 'ShipyardSwap') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try{
          let combinedData = {
            "ShipType": receivedData.shipType,
            "ShipType_Localised": receivedData.ShipType_Localised,
          }
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "systemAddress": store.get('thisSampleSystem'), "combinedData": combinedData, "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          if (store.get('redisFirstUpdateflag')) { ipcMain.emit(`event-callback-${receivedData.event}`,compiledArray) }
          
          thargoidSampling[receivedData.event] = compiledArray
          if (store.get('redisFirstUpdateflag')) { 
            blastToUI(compiledArray)
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Market') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          // logs(receivedData)
          // const searchFor = [
          //   {
          //     id: 128824468,
          //     Name: '$thargoidscouttissuesample_name;',
          //     Name_Localised: 'Thargoid Scout Tissue Sample'
          //   }
          // ]
          const itemSearchTable = dataHistory("itemSearchTable")
          let combinedData = { marketSample: [] }
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": combinedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          receivedData.Items.forEach(item => {
            specificItem = findMatObject(itemSearchTable.marketData, "id",item.id)
            if (specificItem) {
              combinedData.marketSample.push({
                Name: item.Name,
                Name_Localised: item.Name_Localised,
                Name_Cargo: specificItem.Name_Cargo,
                id: item.id,
                MarketID: receivedData.MarketID,
                StationName: receivedData.StationName,
                StarSystem: receivedData.StarSystem,
                DemandBracket: item.DemandBracket,
                StockBracket: item.StockBracket,
                Stock: item.Stock,
                BuyPrice: item.BuyPrice,
              })
            }
            else {
              // logs("no",item.id)
            }
          })
          thargoidSampling[receivedData.event] = compiledArray
          if (store.get('redisFirstUpdateflag')) { 
            blastToUI(compiledArray)
            taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'MarketSell') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
          if (store.get('redisFirstUpdateflag')) { 
            blastToUI(compiledArray)
            taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'LaunchDrone') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          if (currentSystemState != "") {
            let compiledArray = { "event": receivedData.event, "brain": thisBrain, "systemAddress": store.get('systemAddress'), "combinedData": receivedData, "FID": FID }
            if (!thargoidSampling.Cargo) {  thargoidSampling["Cargo"] = store.get('cargo') }
            thargoidSampling[receivedData.event] = compiledArray
            thargoidSampling["InWing"] = store.get('wingStatus')
            store.set('thisSampleSystem',store.get('systemAddress'))
            compiledArray.combinedData["thisSampleSystem"] = store.get('systemAddress')

            //Try to update the server first,
            // Server will return 1 for system exists or 0 for it doesn't.
            // If it doesn't, then run the redisUpdaterSetup()
            // After these checks, then blast it to the UI.
            let response = await taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
            response = response.map(i => { if (i.hasOwnProperty('presentFID')) { return i.presentFID } return null })
            if (response[0]) { store.set('redisFirstUpdateflag',true); blastToUI(compiledArray) }
            else {
              const sendIt = {"event":"Initialize","systemAddress":store.get('systemAddress'),"FID": FID,"events":Object.values(thargoidSampling)}
              blastToUI(sendIt)
              redisUpdaterSetup(receivedData.event,thargoidSampling)
            }
          }
        }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'Shutdown') {
        thargoidSampling = {}
        store.set('redisFirstUpdateflag',false);
        currentSystemState = "";
        FSDChargeCount = 0
        supercruiseCount = 0;
        guifocus = 0;
        const indexToRemove = launchToRedis.indexOf('FSDJump');
        if (indexToRemove !== -1) { launchToRedis.splice(indexToRemove, 1); }
        let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
        if (store.get('redisFirstUpdateflag')) { 
          blastToUI(compiledArray)
          taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
        }
      }
      if (receivedData.event == 'SupercruiseDestinationDrop') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')

            if (store.get('redisFirstUpdateflag')) {
              const indexToRemove = eventNames.indexOf('SupercruiseExit');
              if (indexToRemove !== -1) { eventNames.splice(indexToRemove, 1); }
              setTimeout(()=>{ eventNames.push('SupercruiseExit') },10000)
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
            }
          }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'StartJump') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')

            if (store.get('redisFirstUpdateflag')) {
              const indexToRemove = eventNames.indexOf('FSDTarget');
              if (indexToRemove !== -1) { eventNames.splice(indexToRemove, 1); }
              if (FSDChargeCount == 0) { eventNames.push('FSDTarget') }
              
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
            }
          }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'NavRouteClear') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
          compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')

            if (store.get('redisFirstUpdateflag')) {
              supercruiseCount = 0
              blastToUI(compiledArray)
              taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
            }
          }
        catch(e) { errorHandler(e,e.name)}
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      else {
        eventNames.forEach(eventName =>{
          if (receivedData.event === eventName) {
            if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
            try {
              let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData, "systemAddress": store.get('thisSampleSystem'), "FID": FID }
              compiledArray.combinedData["thisSampleSystem"] = store.get('thisSampleSystem')
              if (store.get('redisFirstUpdateflag')) {
                blastToUI(compiledArray)
                taskManager.brain_ThargoidSample_socket(compiledArray,receivedData.event,findActiveSocketKey())
              }
            }
            catch(e) { errorHandler(e,e.name)}
            if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE TS]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
          }
        })
      }
      //!end of Brain
      //!end of Brain
      //!end of Brain
      //!end of Brain
      //!end of Brain
  })
}
catch (error) {
    console.error(error);
    // errorHandler(error,error.name)
}









// if (store.get('redisFirstUpdateflag')) { ipcMain.emit(`event-callback-${receivedData.event}`,compiledArray) }