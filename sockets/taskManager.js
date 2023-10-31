try {
    const {logs} = require('../utils/logConfig')
    const {watcherConsoleDisplay,errorHandler,logF} = require('../utils/errorHandlers')
    const { io, Manager } = require('socket.io-client')
    const { app, BrowserWindow } = require('electron');
    const { socket } = require('./socketMain')
    const lcs = require('../utils/loungeClientStore')
    const uuid = require('uuid');
    const fs = require('fs')
    const path = require('path')
    const statusFlags = require('../events/Appendix/statusFlags.json');
    const utilities = require('../events/eventUtilities');
    const { initializeEvent } = require('../utils/eventsHandler')
    const { ignoreEvent } = require('../utils/watcher')
    const Store = require('electron-store');
    const windowItemsStore = new Store({ name: 'electronWindowIds'})
    let options = { timeZone: 'America/New_York',year: 'numeric',month: 'numeric',day: 'numeric',hour: 'numeric',minute: 'numeric',second: 'numeric',},myTime = new Intl.DateTimeFormat([], options);
    //!########################################################
    //!############ SOCKET SERVER DIRECT EMITS ################

    socket.on('fromSocketServer', async (data) => { 
        logs(`[SOCKET SERVER]`.blue, `${data.type}`.bgGreen, `${data.message}`.green) 
        //Need to send the dcohSystem's data to the frontside so that it can update all the titan systems info. 
        if (data.type == 'dcohSystems') {
            const client = BrowserWindow.fromId(2);
            client.webContents.send(`dcohSystems-sample`, data);
        } 
        if (data.type == 'findSystemResult') { 
            if (data.message == '0') { 
                taskList.datas = "0" 
            }
        }
        if (data.type == 'brain-ThargoidSample_socket') {
            const client = BrowserWindow.fromId(2);
            client.webContents.send("from_brain-ThargoidSample", data);
        }
    }) 

    //!######################################################## 
    //!######################################################## 
    //!######################################################## 
    
    const taskList = {
        //! Transmits all events that the client receives to the server as long as Task Manager is being called from the "EVENT" js file.
        // This is the catch all...
        socket_joinRoom: async function(data) {
            logs("SOCKETJOIN".yellow,logF(data))
            const titanState = `${data.brain}_${data.name}_${data.state}`
            return new Promise(async (resolve,reject) => {
                try { socket.emit('joinRoom',titanState, async (response) => { 
                    resolve(response);
                    if (data.brain == 'brain-ThargoidSample') { 
                        windowItemsStore.set(`socketRooms.${data.brain}_${data.name}_${data.state}`, response)
                        windowItemsStore.set('brain_ThargoidSample.currentTitanState',`${data.brain}_${data.name}_${data.state}`);
                    }
                 }); }
                catch(error) { errorHandler(error,error.name); reject(error) }
            })
        },
        socket_leaveRoom: async function(data) {
            logs("SOCKETLEAVE".yellow,logF(data))
            const titanState = `${data.brain}_${data.name}_${data.state}`
            return new Promise(async (resolve,reject) => {
                try { socket.emit('leaveRoom',titanState, async (response) => { 
                    resolve(response);
                    if (data.brain == 'brain-ThargoidSample') { 
                        windowItemsStore.set(`socketRooms.${data.brain}_${data.name}_${data.state}`, response)
                        windowItemsStore.set('brain_ThargoidSample.currentTitanState',"");
                    }
                 }); }
                catch(error) { errorHandler(error,error.name); reject(error) }
            })
        },
        socket_rooms: async function(data) { 
            return new Promise(async (resolve,reject) => {
                try { socket.emit('roomStatus',data, async (response) => { 
                    resolve(response);
                    // windowItemsStore.set('brain_ThargoidSample_socket_state',response) 
                 }); }
                catch(error) { errorHandler(error,error.name); reject(error) }
            })
        },
        brain_ThargoidSample_socket: async function(data,event,titanSocket) {
            return new Promise(async (resolve,reject) => {
                try {
                    const timerID = uuid.v4().slice(-5); 
                    if (watcherConsoleDisplay(data.event)) { console.time(timerID) }
                    data = {event,...data,"titanSocket":titanSocket }
                    // console.log(data)
                    socket.emit('eventTransmit',data, async (response) => { resolve(response) });
                }
                catch(error) { errorHandler(error,error.name); reject(error) }
            })
        },
        eventDataStore: function(data,callback) {
            try {
                const timerID = uuid.v4().slice(-5); 
                if (watcherConsoleDisplay(data.event)) { console.time(timerID) }
                const theCommander = lcs.requestCmdr().commander
                data = {...data,...theCommander}
                let discuss = socket.emit('eventTransmit',data, (response) => {
                    //! No response necessarily needed, unless there's some kind of visual need to show on the client.
                    //! The below is for troubleshooting purposes.
                    
                    if (response.event === "WingInvite") { 
                        //A response from socketServer, Dont really need this.
                    }
                    if (response.event === "redisRequest") { 
                        callback({response})
                    }
                    if (response.event === "RedisData-SampleSystems") { 
                        callback({response})
                    }
                    if (watcherConsoleDisplay(data.event) && data.event != "Status") { 
                        logs(`[SOCKET SERVER - TASK MANAGER - '${data.event}']`.yellow)
                        logs("[TM]".green);
                        console.timeEnd(timerID)
                        logs(colorize(response, {pretty:true}))
                    }
                return discuss;
                });
            }
            catch(error) { errorHandler(error,error.name) }
        },
        // Reads current log file and pushes events through event handler. 3 Second Delay.
        allEventsInCurrentLogFile: async function() {
            const searchEventList = ["All"]
            // This is all occurances as they happened in the past. That way things can be iterated on. Example being if you launch the client after you've been playing elite for an hour.
            // const firstLoadList = lcs.latestLogRead(lcs.latestLog(lcs.savedGameLocation("Development Mode taskManager.js").savedGamePath,"log"),searchEventList).firstLoad
            // if (firstLoadList) {
            //     const lastEventInFirstLoadList = firstLoadList[firstLoadList.length - 1].timestamp
                
            //     let currentDateTime = new Date();
            //     currentDateTime = currentDateTime.toISOString();
            //     if (new Date(lastEventInFirstLoadList) - new Date(currentDateTime) < new Date()) { logs(
            //         "Old.................................",
            //         new Date()
            //     )}
            // }
            // This is the latest occurance that happend of any particular event.
            let readEventsList = await lcs.latestLogRead(lcs.latestLog(lcs.savedGameLocation().savedGamePath,"log"),searchEventList)
            if (watcherConsoleDisplay("latestLogsRead")) {
                logs(
                    "[TM]".green,
                    "Running latestLogRead by timestamp".yellow,
                    `${readEventsList.found.length}`.cyan,
                    "events",
                    // found, notFound, listItems, listItemByTimestamp, listItemByTimestampNames, firstLoad
                    // console.logs(readEvents.listItemByTimestampNames)
                    // colorize(readEventsList.listItemByTimestampNames,{pretty: true})
                    )
                }
            if (readEventsList.found.length >= 1) {
                readEventsList.firstLoad.forEach((eventItem,index) => {
                    if(searchEventList == "All" && eventItem.event != "WingInvite"  && eventItem.event != "WingAdd" && eventItem.event != "WingJoin" && eventItem.event != "WingLeave") {    
                        if (watcherConsoleDisplay('startup-read')) { logs("[STARTUP READ]".cyan,`${eventItem.event}`.yellow) }
                            // callback... Must be 1
                            const askIgnoreFile = ignoreEvent(eventItem.event)
                            //! CHECKED, gathers a category name if it is found, if not, it will return null
                            if (!askIgnoreFile && eventItem != null) {
                                initializeEvent.startEventSearch(eventItem,0)
                            }
                    }
                    
                })

                //!!! Old code for just initializing the very last event per category...
                // for (let a in readEventsList.found) { 
                //     const eventData2 = {...readEventsList.found[a]}
                //     //Wing stuff should only be read from if Status flag indicates wing. Review taskmanager.gameStatus for functionality
                //    if(searchEventList == "All" && eventData2.event != "WingInvite"  && eventData2.event != "WingAdd" && eventData2.event != "WingJoin" && eventData2.event != "WingLeave") {    
                //     if (watcherConsoleDisplay(eventData2.event)) { logs("1: Client Startup Init.... ".bgCyan,`${eventData2.event}`.yellow) }
                //         // callback... Must be 1
                //         initializeEvent.startEventSearch(eventData2,0)
                //     }
                // }
            }
        },
        //! Transmits status of the elite dangerous process. There is a poll rate checking every 15 seconds right now.
        gameStatus: function(data) {
            try {
                const timerID = uuid.v4().slice(-5); 
                data = {...data,...lcs.requestCmdr().commander}
                let data2 = {...data}
                if (watcherConsoleDisplay(data.event)) { console.time(timerID); logs("[PD]".yellow,"GameStatus??".green,data.status) }
                //! No response necessarily needed, unless there's some kind of visual need to show on the client.
                socket.emit('gameStatus',data);
                
                
                //IF loungeclient is launched after the game is opened for any reason, it will check to see if the "STATUS.json" file contains
                //   an "In Wing" hex code and find the last WingInvite and WingJoin events and automatically put you back in the correct socket.
                if (data2.status) {
                    let jsonStatusFilePath = path.normalize(lcs.savedGameLocation("gameStatus taskManager.js").savedGamePath + "/Status.json")
                    let jsonStatus = fs.readFileSync(jsonStatusFilePath,'utf8', (err) => { if (err) return logs(err); })
                    try {
                        if (jsonStatus) { jsonStatus = JSON.parse(jsonStatus) }
                        //todo CODE WING STATUS?
                    }
                    catch(error) {
                        if (watcherConsoleDisplay('globalLogs')) {
                            const extra = `[LCS] ${path.parse(jsonStatusFilePath).base} not Valid JSON.`
                            errorHandler(error,error.name,extra) 
                        }
                    }
                    const inWingStatusFlag = utilities.flagsFinder(statusFlags.flags,jsonStatus.Flags)
                    const inWingStatus = inWingStatusFlag.find((element) => element === 'In Wing') || {}.execs || false
                    if (data2.wingStatus == 'In Wing') {
                        //! TESTING MODE 
                        //! TESTING MODE 
                        //Determines if you are in a wing or not. Taken from Status File.
                        data['wingStatus'] = inWingStatus //Live
                        // data2['wingStatus'] = "In Wing" //Test
                        //! TESTING MODE
                        //! TESTING MODE
                        // const searchEvents = ["WingInvite","WingJoin","WingLeave"]
                        const searchEvents = ["WingInvite","WingJoin","WingAdd"]
                        const readEvents = lcs.latestLogRead(lcs.latestLog(lcs.savedGameLocation("gameStatus taskManager.js").savedGamePath,"log"),searchEvents)
                        
                        if (readEvents.found.length >= 1) {
                            for (let a in readEvents.found) { 
                                const eventData = {...readEvents.found[a]}
                                if(readEvents.found[a].event == "WingInvite") {
                                    if (watcherConsoleDisplay(eventData.event)) { logs("1: Wing Startup Init Event.... ".bgCyan,`${eventData.event}`.yellow) }
                                    // callback... Must be 1
                                    initializeEvent.startEventSearch(eventData,0)
                                }
                                if(readEvents.found[a].event == "WingJoin") {
                                    if (watcherConsoleDisplay(eventData.event)) { logs("1: Wing Startup Init Event.... ".bgCyan,`${eventData.event}`.yellow) }
                                    //callback... Must be 1
                                    setTimeout(initializeEvent.startEventSearch,1000,eventData,0); 
                                }
                                if(readEvents.found[a].event == "WingAdd") {
                                    if (watcherConsoleDisplay(eventData.event)) { logs("1: Wing Startup Init Event.... ".bgCyan,`${eventData.event}`.yellow) }
                                    //callback... Must be 1
                                    setTimeout(initializeEvent.startEventSearch,1300,eventData,0); 
                                }
                            }
                        }
                    }
                }
            }
            catch(error) { 
                errorHandler(error,error.name) 
            }
        },
    }
    module.exports = taskList

    //! Mode
    //! Mode
    //Reads current log file and outputs as if the Events are occuring real time. Basically, if this is not enabled
    //      then the log file will NOT be read in its entirity at application startup.
    //      Will only result in events that last get read out of the journal.
    const runState = 1; //Live 1, Dev 0
    if (runState) {  setTimeout(taskList.allEventsInCurrentLogFile,700) }
    //! Mode
    //! Mode
}
catch (error) {
    // console.error("Fix Stack Error".yellow,error);
    logs(errorHandler(error,error))
}