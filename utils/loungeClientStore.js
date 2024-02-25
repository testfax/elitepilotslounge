const {logs,logs_error} = require('./logConfig')
const { app } = require('electron')
const {watcherConsoleDisplay,errorHandler} = require('./errorHandlers')
const path = require('path')
const fs = require('fs')
const getPath = require('platform-folders')  
Tail = require('tail').Tail;

const lcs = {
    cwd: app.isPackaged ? path.join(process.cwd(),'resources','app') : process.cwd(),
    eventJSON: () => { return fs.readFileSync(path.join(lcs.cwd,'events','Appendix','events.json'),'utf-8', (err) => { if (err) logs("NOPEROPE",err); return null  });},
    logState: { logs: 1, latest: "" },
    worldFixer: { timer: false},
    readLogFileData: {},
    startStop: false,
    getStartStop: function() {
        return lcs.startStop
    },
    updateStartStop: function(status) {
        lcs.startStop = status
        // logs("updated startStop".cyan,`${lcs.startStop}`.yellow)
    },
    initialReadStatus: false,
    getInitialReadStatus: function() {
        return lcs.initialReadStatus
    },
    updateInitialReadStatus: function(status) {
        lcs.initialReadStatus = status
        // console.log("updated initialReadStatus".cyan,lcs.initialReadStatus)
    },
    eventIndexNumber: 0,
    updateEventIndexNumber: function(newIndex,fileType) {
        lcs.eventIndexNumber = newIndex
        // console.log(fileType,"updated eventIndexNumber".red,lcs.eventIndexNumber)
    },
    isJSONFileValid: function (filePath) {
        try {
            const fileContents = fs.readFileSync(filePath, 'utf-8');
            const jsonObject = JSON.parse(fileContents);
            return true;
        } catch (err) {
            const fileContents = fs.readFileSync(filePath, 'utf-8');
            if (watcherConsoleDisplay('globalLogs')) {
                logs("[LCS]".red,`${path.parse(filePath).base} not Valid JSON:`,`${fileContents}`.red)
            }
            return false;
        }
    },
    isJSONvalid: function (jsonString) { 
        try {
            JSON.parse(jsonString);
            return true;
            } catch (error) {
            return false;
            }
    },
    duplicateJSON: function(eventFile){
        let ignoreEventsJSON = fs.readFileSync('./events/Appendix/ignoreEvents.json', (err) => { if (err) return logs(err); });
        ignoreEventsJSON = JSON.parse(ignoreEventsJSON)
        let jsonStatusFilePath = path.normalize(`./events/Appendix/${eventFile}`)
        const fileContents = fs.readFileSync(jsonStatusFilePath, 'utf-8');
        const jsonContents = JSON.parse(fileContents);
        let listObject = jsonContents
        let result = listObject.events.reduce((accumulator, currentValue) => {
        const found = accumulator.events.find((item) => item.event === currentValue.event);
        const foundIgnore = ignoreEventsJSON.events.find((item) => item.event === currentValue.event);
            if (found && !foundIgnore) {
                accumulator.duplicates.push(currentValue.event);
            } else {
                accumulator.events.push(currentValue);
            }
            return accumulator;
        }, { events: [], duplicates: [] });
        delete result.events
        return result.duplicates
    },
    lastLogs: function(dir,ext,amount) {
        try {
            const files = fs.readdirSync(dir);
            const filteredFiles = files.filter(file => path.extname(file) === `.${ext}`);
            // console.log("Filtered files:", filteredFiles);
            const sortedFiles = filteredFiles.sort((a, b) => {
                return fs.statSync(path.join(dir, b)).mtime.getTime() -
                fs.statSync(path.join(dir, a)).mtime.getTime();
            });
            const mostRecentFiles = sortedFiles.slice(...amount).map(file => path.join(dir, file));
            return mostRecentFiles;
        } catch (error) {
            logs_error(error)
        }
    },
    latestLogRead: async function(latestLog,findEvents) { 
        try {
            if (findEvents) { 
                //Receives the latest log file to search through.
                //Reads, removes all the \r and turns it into an array from the carriage returns
                //Maps each array item to a JSON object, reverse orders the array,  then loops through each findEvent given 
                //   and locates the first occurance(reverse order) and appends to the found array.
                let findEventsStartTime = Date.now()
                lcs.logState.latest = latestLog;
                let data = fs.readFileSync(latestLog,'utf8', (err) => { if (err) return logs(err); })
                data = data.replace(/\r/g,'').split('\n')
                data.pop()
                data = data.map(x=>JSON.parse(x)).reverse()
                const firstLoad = data.reverse()
                let found = []
                let notFound = []
                let reverse = []
                let list = [];
                let listItems = [];
                let listItemByTimestamp = []
                let listItemByTimestampNames = []
                const totalLines = data.length
                let partLog = latestLog.split("\\")
                partLog = partLog[partLog.length -1]
                partLog = { logName: partLog, maxLines: totalLines, firstLoad: firstLoad[0] }
                if (findEvents.find((e) => e === "All")) {
                    const fileEvents = await lcs.eventJSON()
                    let appendixList = JSON.parse(fileEvents)
                    appendixList.events.forEach((events) => {
                        list.push(events.event)
                    });
                    
                    list.forEach((event) => {
                        const result = data.find((element) => event === element.event);
                        if (result) { 
                            found.push(result); 
                            listItems.push(result.event)
                            listItemByTimestamp.push(result)
                        }
                        if (!result) { notFound.push(event) }
                    });
                    listItemByTimestamp = found.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))
                    listItemByTimestamp.forEach(i=>{
                        listItemByTimestampNames.push(i.event)
                    })
                    // listItemByTimestamp = found.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))
                    // found = listItemByTimestamp
                    // logs(found);
                }
                if (findEvents.find((e) => e !== "All")) {
                    findEvents.forEach((event) => {
                        const result = data.reverse().find((element) => element.event === event)
                        if (result) { found.push(result); reverse.push(result);  }
                        if (!result) { notFound.push(event) }
                    });
                    

                }
                if (found.length == 0) {
                    if (watcherConsoleDisplay('globalLogs')) { 
                        logs("[LCS]".yellow,`${path.parse(latestLog).base} Event Search did not find any previous:`,`[${findEvents}]`.yellow)
                    }
                    return { findEventsStartTime, totalLines, found, notFound, listItems, listItemByTimestamp, listItemByTimestampNames, partLog }
                }
                else {
                    return { findEventsStartTime, totalLines, found, notFound, listItems, listItemByTimestamp, listItemByTimestampNames, firstLoad, reverse, partLog }
                }

            }
            else return "[LCS] No Search Array Items Provided as a Second Argument".red
        }
        catch(e) {
            logs("[LCS] Suspected logfile malformed... Restart Elite Dangerous completely....".bgRed)
            errorHandler(e,e.name)
            return 
        }
    },
    wingData: function(data,readOnly) {
        //IF readOnly 1,  then, read only. 
        //IF readOnly 0, then the function will save the incoming data.
        let loungeClient = lcs.loungeClientStore(lcs.savedGameLocation(`wing data`).loungeClientFile)
        let gPath = loungeClient[0]["file"];
        if (watcherConsoleDisplay('wingData')) { logs("[LCS]".yellow,"WINGDATA".green,"INPUT:".bgWhite,data,"Read Only:".yellow,readOnly) }
    
        let Rooms = null
        let Inviter = null
        let Others = null
        let Leave = null;
        if (data.leave) {
            if (loungeClient && gPath) {
                loungeClient[0]["wing"]["Inviter"] = ""
                loungeClient[0]["wing"]["Others"] = []
                loungeClient[0]["wing"]["Rooms"] = []
                lcs.loungeClientStore(gPath,loungeClient)
                Leave = 1;
            }
        }
        if (data.Inviter) { 
            if (readOnly) { Inviter = loungeClient[0].wing.Inviter }
            if (loungeClient && gPath && !readOnly) {
                Inviter = data.Inviter
                loungeClient[0]["wing"]["Inviter"] = data.Inviter
                lcs.loungeClientStore(gPath,loungeClient)
            }
        }
        if (data.Others.length >= 1) {
            if (readOnly) { Others = loungeClient[0].wing.Others }
            if (loungeClient && gPath && !readOnly) {
                Others = data.Others
                loungeClient[0]["wing"]["Others"] = data.Others
                lcs.loungeClientStore(gPath,loungeClient)
            }
        }
        if (data.Rooms.length >= 1) {
            if (readOnly) { Rooms = loungeClient[0].wing.Rooms }
            if (loungeClient && gPath && !readOnly) {
                Rooms = data.Rooms
                loungeClient[0]["wing"]["Rooms"] = data.Rooms
                lcs.loungeClientStore(gPath,loungeClient)
            }
        }
        let wing = {
            Inviter: Inviter,
            Others: Others,
            Rooms: Rooms,
            Leave: Leave
        }
        if (watcherConsoleDisplay('wingData')) { logs("[LCS]".yellow,"WINGDATA".green,"OUTPUT:".bgWhite,wing,"Read Only:".yellow,readOnly) }
        return { wing }
    },
    requestCmdr: function(details) { //From lounge-client.json
        try {
            const lcf = lcs.savedGameLocation("lcf").loungeClientFile
            let result = lcs.loungeClientStore(lcf)
            if (watcherConsoleDisplay('requestCmdrLOGS') && details) { logs("[LCS]".green,"REQUEST COMMANDER".cyan,details)}
            let commander = result[0].commander
            if (!result[0].commander.hasOwnProperty('commander')) { logs("[LCS]".red,"No Commander!!!".yellow); throw new Error("no commander") }
            return { commander }
        }
        catch(e) {
            if (watcherConsoleDisplay('globalLogs')) { logs("[LCS]".yellow,"Fixing Commander: lounge-client.json".bgRed) }
            result[0]["commander"] = lcs.reWriteCmdr(lcs.savedGameLocation('requestCmdr Fix').savedGamePath)
            commander = result[0]["commander"]
            
            lcs.loungeClientStore(lcs.savedGameLocation("requestCmdr catch store function").loungeClientFile,result)
            if (commander.hasOwnProperty('commander')) { 
                // clearInterval(lcs.worldFixer.timer)
                if (watcherConsoleDisplay('globalLogs')) { 
                    logs("[LCS]".yellow,"Commander Fixed: lounge-client.json".bgGreen); 
                }
                return { commander } 
            }
            else { 
                if (watcherConsoleDisplay('globalLogs')) { 
                    logs("[LCS]".red,"---No log file found with 'event':'Commander' ".bgRed); 
                }
                return false 
            }
        }
    },
    latestLog: function(dir,ext) { //const currentJournalLog = lcs.latestLog(savedGamePath,"log")
        try {
            const files = fs.readdirSync(dir);
            const filteredFiles = files.filter(file=> path.extname(file) === `.${ext}`);
            const sortedFiles = filteredFiles.sort((a,b) => {
                return fs.statSync(path.join(dir,b)).mtime.getTime() -
                fs.statSync(path.join(dir,a)).mtime.getTime();
            })
            
            return path.join(dir, sortedFiles[0]);
        }
        catch(error) {
            // logs(dir,"\n",error)

            if (watcherConsoleDisplay('globalLogs')) { 
                logs_error("[LCS]".red,"NO LOGS FOUND....")
            }
            // logs(error);
        }
    },
    reWriteCmdr: function(savedGamePath) {
        try {
            const latestLog = lcs.latestLog(savedGamePath,"log")
            // let data = fs.readFileSync(latestLog,'utf8', (err) => { if (err) return logs(err); })
            // data = data.replace(/\r/g,'').split('\n')
            // data.pop()
            // // const found = data.reverse().find(events => events.event === "Commander")
            // data = data.map(x=>JSON.parse(x)).reverse()
            // findEvents = ["Commander"]
            // findEvents.forEach((event) => {
            //     const result = data.find((element) => element.event === event);
            //     if (result) {
            //         cmdr = {
            //             commander: event.Name,
            //             FID: event.FID
            //         }
            //         return cmdr
            //     }
            // });
            // !OLD WORKING CODE
            let contents = fs.readFileSync(latestLog,'utf8').split("\n")
            let cmdr = false
            for (let index in contents) {
                let events = contents[index]
                if (events.length >=3) {
                    events = events.replace(/\r/g, '');
                    events = JSON.parse(events);
                    if (events.event === 'Commander') {
                        cmdr = {
                            commander: events.Name,
                            FID: events.FID
                        }
                        return cmdr
                    }
                }
            } 
        }
        catch(e) { logs(e); if (watcherConsoleDisplay('globalLogs')) { logs("[LCS]".red,"reWriteCmdr: No Logs Yet..."); } }
    },
    savedGameLocation: function(details) {
        if (watcherConsoleDisplay('savedGameLocationLOGS') && details) {
            logs("[LCS]".green,"savedGameLocation:".blue,details);
        }
        let savedGamePath = `${getPath.getHomeFolder()}/Saved Games/Frontier Developments/Elite Dangerous/`
        savedGamePath = path.normalize(savedGamePath)
        let loungeClientFile = `${getPath.getHomeFolder()}/Saved Games/Frontier Developments/Elite Dangerous/lounge-client.json`
        loungeClientFile = path.normalize(loungeClientFile)
        const loungeClientFilePath = path.join(savedGamePath, 'lounge-client.json')

        //! Initial lounge-client.json starting json
        const loungeClientObject = {
            file: loungeClientFilePath, 
            wing: {Inviter: "", Others: [], Rooms:[]}, 
            commander: "", 
            clientPosition: [ 363, 50 ], 
            clientSize: [ 1000, 888 ]
        }
        // See if file exists and if it has bytes in it. Relevant to see if file is corrupted with nothing.
        try {
            const loungeClientCondition = fs.statSync(loungeClientFile)
            const loungeClientCondition2 = lcs.isJSONFileValid(loungeClientFilePath)
            if (!loungeClientCondition.size >=1 || !loungeClientCondition2) {
                if (watcherConsoleDisplay('globalLogs')) { 
                    logs("BYTES:".red,loungeClientCondition.size,"| VALID:".red,loungeClientCondition2,"|".red,"Re-Writing lounge-client.json with defaults")
                }
                loungeClientObject['commander'] = lcs.reWriteCmdr(savedGamePath) //Emplaced incase loss of lounge-client.json file integrity.
                const fileD = [loungeClientObject]
                fs.writeFileSync(loungeClientFile, JSON.stringify(fileD,null,2), { encoding: 'utf8', flag: 'w' })
                let checkSize = fs.statSync(loungeClientFile)
                checkSize = checkSize.size
                return { savedGamePath, loungeClientFile, loungeClientFilePath, checkSize }
            }
            else { return { savedGamePath, loungeClientFile, loungeClientFilePath } }
        }
        catch(e) {
            if (watcherConsoleDisplay('globalLogs')) { 
                logs("[LCS]".red,"Missing File. Created lounge-client.json file.",e)
            }
            loungeClientObject['commander'] = lcs.reWriteCmdr(savedGamePath) //Emplaced incase loss of lounge-client.json file integrity.
            const fileD = [loungeClientObject]
            fs.writeFileSync(loungeClientFile, JSON.stringify(fileD,null,2), { encoding: 'utf8', flag: 'w' })
            let checkSize = fs.statSync(loungeClientFile)
            checkSize = checkSize.size
            return { savedGamePath, loungeClientFile, loungeClientFilePath,checkSize }
        }
    },
    loungeClientStore: function(gPath,instructions) {
        //! Specifically for lounge-client.json
        //!This function can Read a the "gPath" file and if "instructions" property is provided it will save.
        try {
            // Instructions should not be passed in initially! Do the following first.
            // Get the string out of the file and convert it into a JSON object.
            result = fs.readFileSync(gPath,'utf8', (err) => { if (err) return logs(err); });
            if (result.size == 0) { lcs.savedGameLocation("loungClientStore function") }
            result = JSON.parse(result)
            //Now that you have sent off the file to the calling function, the calling function will call this function again with instructions.
            if (instructions) {
                instructions = JSON.stringify(instructions,null,2)
                fs.writeFileSync(gPath, instructions, { encoding: 'utf8', flag: 'w' }, err => { if (err) { throw err}; })
            }
            return result
        }
        catch(e) {
            //! If you keep getting this error when moving the box, then code in to delete the contents of the lounge-client.json file.
            //! When the player tries to reopen the client, it will repopulate the lounge-client.json file from scratch.
            lcs.reWriteCmdr(lcs.savedGameLocation("loungeClientStore").loungeClientFile) //Emplaced incase loss of lounge-client.json file integrity.
            if (watcherConsoleDisplay('globalLogs')) { 
                logs("[LCS]".red,"Failed to write to lounge-client.json. reWriteCmdr() started...")
            }
            
        }
    },
    windowPosition: function(win,init) {
        //Since the intent is to get the window Size and Position, lets call the function that validates the path of the lounge-client.json
        //After that is received, lets call the Store function to get the contents of that file.
        //Then, once you receive the result from getting the contents of the lounge-client.json
        //Update the object with what you want and then send it back as instructions, the function expects an object once you send it.
        let result = lcs.loungeClientStore(lcs.savedGameLocation("window position").loungeClientFile)
        //
        if (!result[0].hasOwnProperty('clientSize')) { 
            return {moveTo:[700,100], resizeTo:[366,600]}
        }
        if (init) {
            //If init is truthy, then return the result of the file contents and send back what you need.
            const moveTo = result[0].clientPosition; const resizeTo = result[0].clientSize;
            return { moveTo, resizeTo }
        }
        if (result) {
            const moved = win.getPosition();
            const resized = win.getSize();
            const gPath = result[0]["file"];
            result[0]["clientPosition"] = moved 
            result[0]["clientSize"] = resized
            lcs.loungeClientStore(gPath,result)
        }
    },
    updatePreviousMaxLines: async function(amount) {
        //! Determine how many you want.
        // const amount = [0,2] //uses slice().

        const lounge_client_filepath = lcs.savedGameLocation().loungeClientFile
        let lounge_client = fs.readFileSync(lounge_client_filepath,'utf8')
        lounge_client = JSON.parse(lounge_client)
        const lastFive = lcs.lastLogs(lcs.savedGameLocation().savedGamePath,"log",amount)
        const inputArray = await Promise.all(lastFive.map(async logs => {
            const log = await lcs.latestLogRead(logs, ['All']);
            //todo Handle iteration here for events.
            return log.partLog
        }))
        lounge_client[0]['journalMaxLines'] = inputArray
        lounge_client = JSON.stringify(lounge_client,null,2)
        fs.writeFileSync(lounge_client_filepath,lounge_client, { encoding: 'utf8', flag: 'w' });
        return inputArray
    }
}

module.exports = lcs

