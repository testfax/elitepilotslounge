const {webContents, clipboard, screen, app, BrowserWindow, ipcMain, Menu } = require('electron')
const Store = require('electron-store');
const store = new Store({ name: 'electronWindowIds'})
const thisWindow = store.get('electronWindowIds')
// console.log(thisWindow.win)
const { exec } = require('child_process') //for browser opening
const zlib = require('zlib')
const base64 = require('base64-url')
const colorize = require('json-colorizer');
const path = require('path')
const fs = require('fs')
const {watcherConsoleDisplay,errorHandler,pageData} = require('./utils/errorHandlers')
const lcs = require('./utils/loungeClientStore')
const taskManager = require('./sockets/taskManager')
let redisValidatorMsg = null;
function redisValidator(redisRequestObject) {
  const directory = {
    "from": {
      isEmpty: false,
      isString: true,
      isObject: false,
      isNumber: false,
      numberInString: false
    },
    "description": {
      isEmpty: false,
      isString: true,
      isObject: false,
      isNumber: false,
      numberInString: false
    },
    "type": {
      isEmpty: false,
      isString: true,
      isObject: false,
      isNumber: false,
      numberInString: false
    },
    "method": {
      isEmpty: false,
      isString: true,
      isObject: false,
      isNumber: false,
      numberInString: false
    },
    "data": {
      isEmpty: false,
      isString: false,
      isObject: true,
      isNumber: false,
      numberInString: false
    },
    "keys": {
      isEmpty: false,
      isString: false,
      isObject: true,
      isNumber: false,
      numberInString: false
    },
  }
  let failures = []
  redisValidatorMsg = failures
  for (const key of Object.keys(directory)) {
    if (!(key in redisRequestObject)) {
      failures.push(`MISSING: ${key}`);
    }
    else {
      let value = redisRequestObject[key];
      const regex = /\d/;
      if (typeof value === 'string') { value = value.replace(/\s/g, ''); }
      // console.log(`${key}`.cyan, Object.keys(value).length, typeof value);
      const summary = {
        isEmpty: Object.keys(value).length === 0,
        isString: typeof value === 'string',
        isObject: typeof value === 'object',
        isNumber: typeof value === 'number',
        numberInString: regex.test(value),
      };
      const directoryEntry = directory[key];
      for (const [k, v] of Object.entries(summary)) {
        if (v !== directoryEntry[k]) {
          failures.push(`${key}.${k}`)
        }
      }
    }
  }
  if (failures.length) {
    return false
  }
  else {
    return true;
  }
  
}
//! This file is for general comms FROM the renderer process. Allowing button interactions and ect with the computer.
ipcMain.on('launchEDSY', (event,message) => { 
    if (watcherConsoleDisplay('globalIPC')) { 
      console.log("[IPC]".bgMagenta,"LAUNCH EDSY LOADOUT");
    }
    // console.log("[IPC]".bgMagenta,"clipboard.Write");
    const loadoutString = JSON.stringify(message)
    const gzippedData = zlib.gzipSync(loadoutString)
    const encodedData = base64.encode(gzippedData)
    const url = `https://edsy.org/#/I=${encodedData}`

    exec(`start chrome "${url}`, (error, stdout, stderr) => {
        if (error) { console.error('Error', error)}
    })
    // clipboard.writeText(JSON.stringify(message))
})
ipcMain.on('fetchLatestLog', (event,message) => {
  //ipcRenderer.send('launchEDSY',LoadoutData);
  const readEventsList = lcs.latestLogRead(lcs.latestLog(lcs.savedGameLocation().savedGamePath,"log"),["All"])
  const client = BrowserWindow.fromId(thisWindow.win);
  client.webContents.send('buildLogsDisplay', readEventsList.firstLoad);
})
ipcMain.on('RedisData',(event,message)=> { //Implements a validator.
  if (watcherConsoleDisplay('globalIPC')) { console.log("[IPC]".bgMagenta,"RETRIEVE: ",message.description); }
  // console.log("[IPC]".bgMagenta,"RETRIEVE",message.description);
    if (redisValidator(message)) {
        taskManager.eventDataStore(message, (response) => {
          // console.log(Object.values(response)[0].redisQueryResult);
          const client = BrowserWindow.fromId(thisWindow.win);
          client.webContents.send(`${message.from}`, response);
      })
    }
    else {
      console.log("[REDIS Structure Validator]".bgRed,redisValidatorMsg)
    }
})
ipcMain.on('RedisData-SampleSystems',(event,message)=> { //No validator needed for this small task.
  if (watcherConsoleDisplay('globalIPC')) { console.log("[IPC]".bgMagenta,"RETRIEVE: ",message.description); }
  taskManager.eventDataStore(message, (response) => {
    // console.log(Object.values(response)[0].redisQueryResult);
    const client = BrowserWindow.fromId(thisWindow.win);
    client.webContents.send(`${message.from}`, response);
  })
});
ipcMain.on('joinSamplingRoom', (event,message) => {
  taskManager.socket_joinRoom(message)
})
ipcMain.on('leaveSamplingRoom', (event,message) => {
  taskManager.socket_leaveRoom(message)
})

// ipcMain.on('fetcherMain', (event,FET) => {
//     event = 'string'
//     if (watcherConsoleDisplay('globalIPC')) { 
//       console.log("[FETCHER]".bgMagenta,`fromRenderer: {fetcherMain} ${FET.type} | Current Page: ${pageData.currentPage}`);
//       // if (isJSONvalid(FET)) { 
//       //   console.log(colorize(FET, { pretty: true }))
//       // }
//       // else { console.log("[IPC]".bgRed,`fromRenderer: {fetcherMain} is not proper JSON...`) }
//     }
    
//     let result
//     try {
//       result = fs.readFileSync(FET.filePath[0],'utf8', (err) => { if (err) return console.log(err); });
//     }
//     catch(e) { errorHandler(e,e.name)}
//     result = JSON.parse(result);
//     let newData = null
//     if (FET.type && FET.type == "Materials") {
//         Object.values(result).forEach((value) => {
//             if (Array.isArray(value)) {
//               value.forEach((material) => {
//                 if (material.Group === FET.category) {
//                   material.State = FET.state;
//                 }
//               });
//             }
//           });
//       newData = JSON.stringify(result, null, 2);
//     }
//     if (FET.type && FET.type == "materialHistory") {
//       let materialData = fs.readFileSync('./events/Appendix/materials.json','utf8', (err) => { if (err) return console.log(err); });
//       materialData = JSON.parse(materialData);
//       //If the incoming material matches the timestamp and name of the history timestamp and name. exit the process.
//       const timeStampMatch = result.data.find(ts => {
//         ts.timeStamp === FET.material[0].timeStamp && ts.Name === FET.material[0].Name
//         if (ts.timeStamp === FET.material[0].timeStamp && ts.Name === FET.material[0].Name) { 
//           // console.log(ts.Name, FET.material[0].Name,ts.timeStamp, FET.material[0].timeStamp)
//           return true
//         }
//         return false
        
//       })
//       if (timeStampMatch) {
//         // console.log("timestampmatch".yellow,timeStampMatch.Name)
//         if (watcherConsoleDisplay('globalIPC')) { console.log("[FETCHER]".bgMagenta,"materialHistory: Data already present. Exiting".bgRed) }
//         return
//       }
//       //Remove 1 element to allow room for the next. Max 10. 
//       if (result.data.length >= 10) { result.data.splice(9); }
//       let maxCount = null;
//       if (FET.material[0].Count > gradeInfos(FET.material[0].Grade)) { maxCount = FET.material[0].Grade }
//       else { maxCount = FET.material[0].Count }
//       result.data.push({
//         Name: FET.material[0].Name,
//         Name_Localised: FET.material[0].Name_Localised,
//         Count: maxCount,
//         Grade: FET.material[0].Grade,
//         Operator: FET.material[0].Operator,
//         Operator_Sign: FET.material[0].Operator_Sign,
//         timeStamp: FET.material[0].timeStamp,
//         Total: FET.material[0].Total
//       })
//       result.data.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp));
//       newData = JSON.stringify(result, null, 2);
//       function findMatObject(obj, key, value) {
//         if (typeof obj === 'object' && obj !== null) {
//           if (obj[key] === value) {
//             return obj;
//           }
//           for (const prop in obj) {
//             const foundObject = findMatObject(obj[prop], key, value);
//             if (foundObject) {
//               return foundObject;
//             }
//           }
//         }
//         return null;
//       }
//       function gradeInfos(x) {
//         try {
//           let findGrade = null;
          
//           const gradeCountArray = [
//             { grade: "1", count: "300" },
//             { grade: "2", count: "250" },
//             { grade: "3", count: "200" },
//             { grade: "4", count: "150" },
//             { grade: "5", count: "100" }
//           ]
//           findGrade = gradeCountArray.find(i => i.grade == x)
//           // console.log(findGrade)
//           return [ findGrade.count ];
//         }
//         catch(e) { 
//           if (!x) { console.log("GRADEINFOS: Missing variable data: Material Grade FET.material[0].Grade") }
//         }
//       }
//     }
//     if (FET.method == "POST") {
//       // console.log("saving POST")
//       fs.writeFileSync(FET.filePath[0], newData, { flag: 'w' }, err => { if (err) { throw err}; }) 
//     }

//     //If Lounge Client is on the Materials Page, then send to the renderer process functions.js
//     if (FET.type && FET.type == "materialHistory" && pageData.currentPage == 'Materials') {
//       // console.log("SENDING fetcherMatHistory")
//       const client = BrowserWindow.fromId(thisWindow.win);
//       client.webContents.send('fetcherMatHistory', FET.material);
//     }
// });