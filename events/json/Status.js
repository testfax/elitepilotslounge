try {
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const { logs } = require('../../utils/logConfig')
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const statusFlags = require('../Appendix/statusFlags');
    const utilities = require('../eventUtilities');
    //! #### Socket Server
    // const taskManager = require('../../sockets/taskManager')
    const {Status} = require('../../sockets/tasks/jsonEntries')
    const Store = require('electron-store')
    // //! EVENT SIMULATOR
    // module.exports = (data) => {
    //     // const test = { "timestamp":"2023-03-30T03:23:32Z", "event":"WingJoin", "Others":[] }
    //     // const test = { "timestamp":"2023-03-30T03:23:11Z", "event":"WingInvite", "Name":"TestBot" }
    //     const test = { "timestamp":"2023-03-30T03:23:32Z", "event":"WingJoin", "Others":[ "TestBot","Apaxis", "titan47" ]}
    //     // const test = { "timestamp":"2023-03-30T03:23:32Z", "event":"WingLeave" }
    //     socketTaskManager.eventDataStore(test);
    //     const data2 = {
    //        Inviter: test.Name,
    //        Others: test.Others,
    //        Rooms: [],
    //        leave: 0,
    //     }
    //     lcs.wingData(data2,0) 
    // }
    // //! EVENT SIMULATOR
    module.exports = (data) =>{
        try {
            const distributionList = [
                'brain-ThargoidSample'
            ]
            //! #### Logs
            if (watcherConsoleDisplay(data.event)) { logs(`3: ${data.event.toUpperCase() } DATA` .bgMagenta); logs(data) }
           
    
            //! ### Transpose data
            let modStatus = {
                event: "Status",
                Flags1: utilities.flagsFinder(statusFlags.flags,data.Flags),
                Flags2: utilities.flagsFinder(statusFlags.flags2,data.Flags2),
                hex_flags: {Flags1: data.Flags,Flags2:data.Flags2}
            }
            let gimmeFlags = {
                Flags1: modStatus.Flags1,
                Flags2: modStatus.Flags2
            }
            // if (watcherConsoleDisplay(data.event)) { logs(colorize(gimmeFlags, { pretty: true }))  }
            if (watcherConsoleDisplay(data.event)) { logs(gimmeFlags)  }
            const combinedStatus = {...modStatus,...data}
            // socketEventManager.Status(modStatus);
             //! #### Socket Server
            //  ipcMain.removeAllListeners(`event-callback-${data.event}`);
            //  if (!ipcMain.listenerCount(`event-callback-${data.event}`)) {
            //      ipcMain.once(`event-callback-${data.event}`, (receivedData,visibile) => { 
            //          if (watcherConsoleDisplay('BrainCallbacks') || visibile) { 
            //              logs(`${data.event.toUpperCase()}-callback!`.cyan,colorize(receivedData, { pretty: true })) 
            //          }
            //          taskManager.eventDataStore(receivedData)
            //      })
            //  }
             //The response from the socket server will be a callback to this function.
             //Manipulate the data then send to the brain.
            // Status(combinedStatus, (response)=> { logs("stat",response) })
            Status(combinedStatus)
            //Gets sent to socket js file
            if (gimmeFlags.Flags1 != 0) { //0 would be a clean shutdown, use shutdown event
                //! #### Save entry into Electron-Store.
                const store = new Store({ name: `${data.event}` })
                store.set('data',combinedStatus)
            }
            const roomCache = {
                Inviter: 1,
                Others: 1,
                Rooms: ["ReadOnly1"],
                leave: 0
            }
            let socketRoomStatus = lcs.wingData(roomCache,1) //Second Parameter is ReadOnly On/Off, if Off, saves data to lounge-client.txt
            if (socketRoomStatus.length) { 
                logs("In Wing Socket")
                //todo IF commander is in a socket(room), then send to room.
            }
    
            //todo Send data to front end.
            //!NIGHT VISION IS NOT TRIGGERED IN STATUS FILE AS OF UPDATE 14.
    
            
            //! #### Send entry to the renderer... NOT RECOMMENDED. USE BRAIN
            // const client = BrowserWindow.fromId(1);
            // client.webContents.send(`${eventType}`, data);
            //! #### Send to Brain
            distributionList.forEach(event => {
                ipcMain.emit(event,combinedStatus)
            })
            if (data.returnable) { return true }
        }
        catch (e) { if (data.returnable) { return false }; errorHandler(e,e.name); }
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}





// try {
//     const { BrowserWindow } = require('electron');
//     const socketTaskManager = require('../../sockets/taskManager');
//     const colorize = require('json-colorizer');
//     const colors = require('colors');
//     const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers');
//     const statusFlags = require('../Appendix/statusFlags');
//     const utilities = require('../eventUtilities');
//     const lcs = require('../../utils/loungeClientStore');
//     const Store = require('electron-store')
//     const store = new Store({ name: 'electronWindowIds'})
//     const thisWindow = store.get('electronWindowIds')
//     const client = BrowserWindow.fromId(thisWindow.win);
//     // //! EVENT SIMULATOR
//     // module.exports = (data) => {
//     //     // const test = { "timestamp":"2023-03-30T03:23:32Z", "event":"WingJoin", "Others":[] }
//     //     // const test = { "timestamp":"2023-03-30T03:23:11Z", "event":"WingInvite", "Name":"TestBot" }
//     //     const test = { "timestamp":"2023-03-30T03:23:32Z", "event":"WingJoin", "Others":[ "TestBot","Apaxis", "titan47" ]}
//     //     // const test = { "timestamp":"2023-03-30T03:23:32Z", "event":"WingLeave" }
//     //     socketTaskManager.eventDataStore(test);
//     //     const data2 = {
//     //        Inviter: test.Name,
//     //        Others: test.Others,
//     //        Rooms: [],
//     //        leave: 0,
//     //     }
//     //     lcs.wingData(data2,0) 
//     // }
//     // //! EVENT SIMULATOR


//     module.exports = (data) => {
//         try {
//             if (watcherConsoleDisplay(data.event)) { logs("3: STATUS DATA ".bgMagenta); logs(colorize(data, { pretty: true }))  }
            
//             let modStatus = {
//                 event: "Status",
//                 Flags1: utilities.flagsFinder(statusFlags.flags,data.Flags),
//                 Flags2: utilities.flagsFinder(statusFlags.flags2,data.Flags2),
//                 hex_flags: {Flags1: data.Flags,Flags2:data.Flags2}
//             }
//             let gimmeFlags = {
//                 Flags1: modStatus.Flags1,
//                 Flags2: modStatus.Flags2
//             }
//             if (watcherConsoleDisplay(data.event)) { logs(colorize(gimmeFlags, { pretty: true }))  }
//             const combinedStatus = {...modStatus,...data}
//             socketTaskManager.eventDataStore(modStatus);
//             if (gimmeFlags.Flags1 != 0) { //0 would be a clean shutdown, use shutdown event
//                 const storeStatus = new Store({ name: 'Status' })
//                 storeStatus.set('data',combinedStatus)
//                 // logs(combinedStatus);
//                 client.webContents.send('Status', combinedStatus);
//             }
//             const roomCache = {
//                 Inviter: 1,
//                 Others: 1,
//                 Rooms: ["ReadOnly1"],
//                 leave: 0
//             }
//             let socketRoomStatus = lcs.wingData(roomCache,1) //Second Parameter is ReadOnly On/Off, if Off, saves data to lounge-client.txt
//             if (socketRoomStatus.length) { 
//                 logs("yep")
//                 //todo IF commander is in a socket(room), then send to room.
//             }

//             //todo Send data to front end.
//             //!NIGHT VISION IS NOT TRIGGERED IN STATUS FILE AS OF UPDATE 14.
//         }
//         catch(e) {console.error(e) }
//     }
// }
// catch(error) {
//     // console.error(error)
//     errorHandler(error,error)
// }
// Call the function from another page like this: 
//   logs(someVar.flagsFinder(flags,16842765)); // ["Docked", "Landed", "Landing Gear Down", "In MainShip"]