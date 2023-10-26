try {
    const {watcherConsoleDisplay,errorHandler,pageData} = require('../utils/errorHandlers')
//     const { ipcMain, BrowserWindow,webContents  } = require('electron');
//     const Store = require('electron-store');
//     const windowItemsStore = new Store({ name: 'electronWindowIds'})
//     const thisWindow = windowItemsStore.get('electronWindowIds')
//     const client = BrowserWindow.fromId(thisWindow.win);
//     const lcs = require('../utils/loungeClientStore')
//     const taskManager = require('../sockets/taskManager')
//     const colorize = require('json-colorizer');
//     const colors = require('colors');
//     const path = require('path')
//     const fs = require('fs')
//     const {fetcher} = require('./brain_functions')
//     //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     //List of events that require a brain to do work in the background. This brain handles the below.
//     //          > Event Handler
//     //          < Brain Event
//     //          ^ Socket Handler
//     //          * Socket Complete
//     //todo      <>CarrierNameChanged (Fleet Carriers)
//     //todo      <>CarrierJumpRequest (Fleet Carriers)
//     //todo      <>CarrierJump (Fleet Carriers)
//     //todo      <>CarrierJumpCancelled (Fleet Carriers)
//     //!Functions!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     function dataHistory(fileName) {
//       try {
//       let response = null;
//       const FET = {
//         filePath: [`../events/Appendix/${fileName}.json`]
//       }
//         let gPath = path.join(__dirname,FET.filePath[0])
//         gPath = path.normalize(gPath)
//         const fetched = fs.readFileSync(gPath,'utf8', (err) => { if (err) return console.log(err); });
//         response = JSON.parse(fetched)
//         return response
//       }
//       catch(e) { errorHandler(e,e.name)}
//     }
//     function findMatObject(obj, key, value, parentKey = null) {
//       if (typeof obj === 'object' && obj !== null) {
//         if (obj[key] === value) {
//           return { ...obj, type: parentKey };
//         }
//         for (const prop in obj) {
//           const foundObject = findMatObject(obj[prop], key, value, prop);
//           if (foundObject) {
//             if (parentKey !== null) {
//               foundObject.type = parentKey;
//             }
//             return foundObject;
//           }
//         }
//       }
//       return null;
//     }
//     const eventNames = [
//       "CarrierJumpRequest",
//       "CarrierJump",
//       "CarrierJumpCancelled",
//       "CarrierNameChanged",
//     ]
//     let Friends = {}
//     //!BRAIN EVENT######################################################
//     const thisBrain = 'brain-Friends'
//     const visible = 0 //! Sets watcher visibility locally. watchervisibility will still have to be enabled globally in errorHandlers
//     const store = new Store({ name: `${thisBrain}` })
//     ipcMain.on(thisBrain, (receivedData) => {
//       if (receivedData.event == 'template') {
//         if (watcherConsoleDisplay('BrainEvent') || visible) { console.log("[BE F]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
//         try{
//           console.log(colorize(receivedData, { pretty: true }))
//           let combinedData = {}
//           let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": combinedData }
//           ipcMain.emit(`event-callback-${receivedData.event}`,compiledArray)
//           Friends[receivedData.event] = compiledArray
//         //   const client = BrowserWindow.fromId(thisWindow.win);
//         //   client.webContents.send(`${receivedData.event}`, 55555555);
//         }
//         catch(e) { errorHandler(e,e.name)}
//         if (watcherConsoleDisplay('BrainEvent') || visible) { console.log("[BE F]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
//       }
      
//       //!Eliviates duplicate code
//       else {
//         eventNames.forEach(eventName =>{
//           if (receivedData.event === eventName) {
//             if (watcherConsoleDisplay('BrainEvent') || visible) { console.log("[BE F]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
//             try{
//               // console.log(colorize(receivedData, { pretty: true }))
//               // let combinedData = {}
//               let compiledArray = { "event": receivedData.event, "brain": thisBrain, "combinedData": receivedData }
//               ipcMain.emit(`event-callback-${receivedData.event}`,compiledArray)
//               Friends[receivedData.event] = compiledArray
//               // const client = BrowserWindow.fromId(thisWindow.win);
//               // client.webContents.send('ShipyardSwap', 55555555);
//             }
//             catch(e) { errorHandler(e,e.name)}
//             if (watcherConsoleDisplay('BrainEvent') || visible) { console.log("[BE F]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
//           }

//         })
//       }
//       //!end of Brain
//       //!end of Brain
//       //!end of Brain
//       //!end of Brain
//       //!end of Brain
//       // console.log(colorize(Friends, { pretty: true }))
//       store.set('data',Friends)
//     })
}
catch (error) {
    // console.error(error);
    errorHandler(error,error.name)
}