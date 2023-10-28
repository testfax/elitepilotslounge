const {webContents, clipboard, screen, app, BrowserWindow, ipcMain, Menu } = require('electron')
const Store = require('electron-store');
const store = new Store({ name: 'electronWindowIds'})
const thisWindow = store.get('electronWindowIds')
const { exec } = require('child_process') //for browser opening
const {logs} = require('./utils/logConfig') //for browser opening
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
      // logs(`${key}`.cyan, Object.keys(value).length, typeof value);
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
      logs("[IPC]".bgMagenta,"LAUNCH EDSY LOADOUT");
    }
    // logs("[IPC]".bgMagenta,"clipboard.Write");
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
  if (watcherConsoleDisplay('globalIPC')) { logs("[IPC]".bgMagenta,"RETRIEVE: ",message.description); }
  // logs("[IPC]".bgMagenta,"RETRIEVE",message.description);
    if (redisValidator(message)) {
        taskManager.eventDataStore(message, (response) => {
          // logs(Object.values(response)[0].redisQueryResult);
          const client = BrowserWindow.fromId(thisWindow.win);
          client.webContents.send(`${message.from}`, response);
      })
    }
    else {
      logs("[REDIS Structure Validator]".bgRed,redisValidatorMsg)
    }
})
ipcMain.on('RedisData-SampleSystems',(event,message)=> { //No validator needed for this small task.
  if (watcherConsoleDisplay('globalIPC')) { logs("[IPC]".bgMagenta,"RETRIEVE: ",message.description); }
  taskManager.eventDataStore(message, (response) => {
    // logs(Object.values(response)[0].redisQueryResult);
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