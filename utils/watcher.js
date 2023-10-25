//! Watcher Console Display is located in errorHandler.js

const {watcherConsoleDisplay,errorHandler,pageData} = require('../utils/errorHandlers')
try {
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const Store = require('electron-store');
    const store = new Store({ name: 'electronWindowIds'})
    
    const thisWindow = store.get('electronWindowIds')
    Tail = require('tail').Tail;
    const colors = require('colors');
    const colorize = require('json-colorizer');
    const path = require('path')
    require('./processDetection')
    const fs = require('fs')
    const chokidar = require('chokidar') //Monitors File Changes in the Saved Games\ED\ folder.
    const { initializeEvent } = require('./eventsHandler')
    const lcs = require('./loungeClientStore')
    let lcsStuff = lcs.savedGameLocation("lcsStuff watcher.js");
    if (lcs.requestCmdr() != false && lcs.requestCmdr() != 'undefined') {
        const savedGamePath = lcsStuff.savedGamePath;
        const wat = {
            eliteIO: { status: null, event: "gameStatus" },
            savedGameP: lcsStuff.savedGamePath,
            norm: function(a,b,ext) {
                let fixed = path.normalize(`${a}/${b}.${ext}`)
                return fixed
            },
            // eliteProcess: function(processName, callback) { //I dont even know if this is usable anymore. as processDetection.js handles everything.
            //     isProcessRunning(processName, (err, result) => {
            //         if (err) {
            //         console.error(`Error checking if ${processName} is running: ${err}`);
            //         return callback(err, null);
            //         }
            //         //console.log(`The ${processName} process is ${result ? "" : "not "}running`);
                    
            //         callback(null, result);
            //     });
            // },
            ignoreEvent: function(ignoreEventName) {
                let ignoreEventsJSON = fs.readFileSync('./events/Appendix/ignoreEvents.json', (err) => { if (err) return console.log(err); });
                ignoreEventsJSON = JSON.parse(ignoreEventsJSON) 
                for (const event of ignoreEventsJSON.events) {
                    if (event.event === ignoreEventName) {
                        // console.log("IGNORE TEST".red,ignoreEventName)
                        return event.category;
                    }
                }
                return null; // Return null if event name not found
            },
            sendlogEvent: function(eventData) {
                if (lcs.logState) {
                    // const logsStore = new Store({ name: 'LogsDisplay'})
                    // const oldData = logsStore.get('data')
                    // const combinedData = { ...{oldData},...{eventData} }
                    // logsStore.set('data',combinedData)
                    // if (pageData.currentPage = 'Logs') {
                    //     const client = BrowserWindow.fromId(thisWindow.win);
                    //     client.webContents.send('LogsDisplay', eventData);
                    // }
                }
            },
            tailFile: function(savedGamePath) { //called from wat.eliteProcess() function. Only for *.log files. *.json files are handled at the bottom of this page with watcher.on('change')
                const currentJournalLog = lcs.latestLog(savedGamePath,"log")
                continueWatcherBuild(currentJournalLog)
                function continueWatcherBuild(currentJournalLog) {
                    if (watcherConsoleDisplay('globalLogs')) { 
                        console.log("[TAIL]".green,"Monitoring:".green ,path.parse(currentJournalLog).base)
                    }
                    const tailLogOptions = { separator: /\n/ }
                    const tailLog = new Tail(currentJournalLog,tailLogOptions);
                    tailLog.on("line", function(data) { 
                        if (watcherConsoleDisplay('showBuffer')) {  console.log("BEGINNING OF BUFFER ===".blue,`\n ${data}`.cyan,"\n","========= END OF BUFFER".blue); }
                        let inspectedEvent = null
                        try {
                            inspectedEvent = JSON.parse(data) //turn string into a JSON array
                            //  wat.sendlogEvent(inspectedEvent)
                            
                            //! CHECK TO SEE IF EVENT IS IN THE IGNORE FILE....
                            const askIgnoreFile = wat.ignoreEvent(inspectedEvent.event)
                            //! CHECKED, gathers a category name if it is found, if not, it will return null
                            if (!askIgnoreFile && inspectedEvent != null) {
                                if (watcherConsoleDisplay(inspectedEvent.event)) { console.log("1: Watcher.... ".bgCyan,`${inspectedEvent.event}`.yellow) }
                                const result = initializeEvent.startEventSearch(inspectedEvent,0)
                               
                                // 1 returnable result, 0 no returnable result. // console.log("result of commander",commander); }
                            }
                        }
                        catch(e) {
                            console.log("[TAIL]".red, "The current Journal Log is corrupted, can not continue with unknown event:",`${data}`.red)
                            errorHandler(e,e.name)
                        }
                    });
                    tailLog.on("error", function(error) { console.log('ERROR: ', error); });
                }
            },
            tailJsonFile: function(data,eventMod) { //For JSON files only
                if (data) { 
                    try {
                        if (watcherConsoleDisplay('showBuffer')) {  console.log("BEGINNING OF BUFFER ===".blue,`\n ${data}`.cyan,"\n","========= END OF BUFFER".blue); }
                        let dataObj = JSON.parse(data)
                        const event = dataObj.event
                        if (eventMod != undefined) {   
                            if (watcherConsoleDisplay(event)) { console.log("1: Watcher.... ".bgCyan,`${eventMod}`.yellow); } 
                        }
                        else {
                            if (watcherConsoleDisplay(event)) { console.log("1: Watcher.... ".bgCyan,`${event}`.yellow); }
                        }
                        // console.log(colorize(data, {pretty: true}))
                        const result = sendJSONevent = initializeEvent.startEventSearch(dataObj,0,eventMod);
                        // 1 returnable result, 0 no returnable result. // console.log("result of commander",commander); }
                    }
                    catch(e) {
                        console.log(data,eventMod)
                        console.log(eventMod,e)
                        console.log("JSON PARSE FAIL".yellow,"Could not parse:".red,data)
                    }
                }
                if (!data) { 
                    console.log("No Data in JSON, watcher tailJsonFile.".red)
                }
            }
        }
        //! BEGIN WATCHING ELITE DANGEROUS FOLDER
        watcherPath = chokidar.watch(savedGamePath, {
            persistent: true,
            ignoreInitial: false,
            ignored: [
                `${savedGamePath}/*.cache`, 
                `${savedGamePath}/lounge-client.txt`,
                `${savedGamePath}/edmc-journal-lock.txt`
            ],
        })
        watcherPath.on('ready', function() { //! Required to know what file to look at once the game loads.
            watcherPath.on('error',error => { console.log(error);})
            //APP IS LAUNCHED AND THEN CHECKS TO SEE IF IT IS RUNNING.
            //todo CALL lcs.readLogFile(savedGamePath) to input data into lcs.readLogFileData object Ex: lcs.readLogFileData.commander
            watcherPath.on("add", savedGamePath => {
                if (wat.eliteIO.status) {
                    //! Look for hte journal ('.log') file that was added. 
                    //! This file is created as soon as you see the Odyssey logo.
                    // console.log(savedGamePath)
                    if (path.parse(savedGamePath).ext == '.log') {
                        const thargoidBrain = new Store({ name: `brain-ThargoidSample` })
                        thargoidBrain.set('data',{})
                        if (watcherConsoleDisplay('globalLogs')) { 
                            console.log("[TAIL] New Journal Log Created... ".green, path.parse(savedGamePath).base)
                        }
                        //todo keep all the events for tailLog in 1 spot. (located in the wat functions variable)
                        const newPath = path.parse(savedGamePath).dir
                        wat.tailFile(newPath)
                        
                        // wat.eliteProcess("EliteDangerous", () => (err,result) => {
                        //     if (err) { console.log("error with detecting if elite is running".bgMagenta); return; } 
                        //     wat.eliteIO['status'] = result
                        //     if (result) { wat.tailFile(savedGamePath) }
                        // })
                    }
                }
            })
            //todo need to figure out how to create a single function to loop all these through.
            //todo The STATUS.JSON is a single line entry and is handled on its own.
            //todo the other json files are multi line and are handled by tail as being read from the beginning, because they are not
            //todo saved to the disk, they are only saved in memory.
            const tailLogOptionsStatus = { separator: /\n/, fromBeginning: true}
            const JSONtailStatus = new Tail(savedGamePath + 'Status' + '.json',tailLogOptionsStatus);
            JSONtailStatus.on("line", function(data) {
                if (wat.eliteIO.status) { wat.tailJsonFile(data) }
            });
            //! { "timestamp":"2023-03-16T00:07:37Z", "event":"ModuleInfo" } (notice the "event" name (MODULE) NO "S")
            //! Only writes to the "*.log" file with this, nothing more.
            //! Re-Wrote the Event to actually take the renamed event. see wat.tailJsonFile(modulesInfoArray,"ModulesInfo")
            //todo Rewrite all the code below into 1 function.
            const tailLogOptionsModulesInfo = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true, flushAtEOF: true}
            let JSONtailModulesInfo = new Tail(savedGamePath + 'ModulesInfo' + '.json',tailLogOptionsModulesInfo);
            modulesInfoArray = new Array();
            JSONtailModulesInfo.on("line", (data) => {
                if (wat.eliteIO.status) { 
                    modulesInfoArray = modulesInfoArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(modulesInfoArray)
                        wat.tailJsonFile(JSON.parse(newString),"ModulesInfo")
                        modulesInfoArray = [''];
                    }
                }
            });
            cargoArray = new Array();
            const tailLogOptionsCargo = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailCargo = new Tail(savedGamePath + 'Cargo' + '.json',tailLogOptionsCargo);
            JSONtailCargo.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    cargoArray = cargoArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(cargoArray)
                        wat.tailJsonFile(JSON.parse(newString),"Cargo")
                        cargoArray = [''];
                    }
                }
            });
            shipLockerArray = new Array();
            const tailLogOptionsShipLocker = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailShipLocker = new Tail(savedGamePath + 'ShipLocker' + '.json',tailLogOptionsShipLocker);
            JSONtailShipLocker.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    shipLockerArray = shipLockerArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(shipLockerArray)
                        wat.tailJsonFile(JSON.parse(newString),"ShipLocker")
                        shipLockerArray = [''];
                    }
                }
            });
            shipyardArray = new Array();
            const tailLogOptionsShipyard = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailShipyard = new Tail(savedGamePath + 'Shipyard' + '.json',tailLogOptionsShipyard);
            JSONtailShipyard.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    shipyardArray = shipyardArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(shipyardArray)
                        wat.tailJsonFile(JSON.parse(newString),"Shipyard")
                        shipyardArray = [''];
                    }
                }
            });
            outfittingArray = new Array();
            const tailLogOptionsOutfitting = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailOutfitting = new Tail(savedGamePath + 'Outfitting' + '.json',tailLogOptionsOutfitting);
            JSONtailOutfitting.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    outfittingArray = outfittingArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(outfittingArray)
                        wat.tailJsonFile(JSON.parse(newString),"Outfitting")
                        outfittingArray = [''];
                    }
                }
            });
            navRouteArray = new Array();
            const tailLogOptionsNavRoute = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailNavRoute = new Tail(savedGamePath + 'NavRoute' + '.json',tailLogOptionsNavRoute);
            JSONtailNavRoute.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    navRouteArray = navRouteArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(navRouteArray)
                        wat.tailJsonFile(JSON.parse(newString),"NavRoute")
                        navRouteArray = [''];
                    }
                }
            });
            marketArray = new Array();
            const tailLogOptionsMarket = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailMarket = new Tail(savedGamePath + 'Market' + '.json',tailLogOptionsMarket);
            JSONtailMarket.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    marketArray = marketArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(marketArray)
                        wat.tailJsonFile(JSON.parse(newString),"Market")
                        marketArray = [''];
                    }
                }
            });
            backPackArray = new Array();
            const tailLogOptionsBackpack = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailBackpack = new Tail(savedGamePath + 'Backpack' + '.json',tailLogOptionsBackpack);
            JSONtailBackpack.on("line", function(data) { 
                if (wat.eliteIO.status) { 
                    backPackArray = backPackArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(backPackArray)
                        wat.tailJsonFile(JSON.parse(newString),"Backpack")
                        backPackArray = [''];
                    }
                }
            });
            fcMaterialsArray = new Array();
            const tailLogOptionsFCMaterials = { separator: /(\r\n|\n|\r)/gm, fromBeginning: true}
            const JSONtailFCMaterials = new Tail(savedGamePath + 'FCMaterials' + '.json',tailLogOptionsFCMaterials);
            JSONtailFCMaterials.on("line", function(data) {
                if (wat.eliteIO.status) { 
                    fcMaterialsArray = fcMaterialsArray + data;
                    if (data.includes(" ] }")) {
                        const newString = JSON.stringify(fcMaterialsArray)
                        wat.tailJsonFile(JSON.parse(newString),"FCMaterials")
                        fcMaterialsArray = [''];
                    }
                }
            });
        })
        module.exports = wat
    }
    else { 
        if (watcherConsoleDisplay('globalLogs')) { 
            console.log("[WATCHER]".yellow," No commander!".red)
        }
        lcs.requestCmdr()
        const commanderPresent = false
        module.exports = commanderPresent
    }
}
catch (error) {
    errorHandler(error,error.name)
    // console.error(error);
}