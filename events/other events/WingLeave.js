try {
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    //! #### Socket Server
    const {WingLeave} = require('../../sockets/tasks/otherEvents')
    const Store = require('electron-store')
    module.exports = (data) =>{
        const distributionList = [
            'brain-ThargoidSample'
        ]
        //! #### Logs
        if (watcherConsoleDisplay(data.event)) { console.log(`3: ${data.event.toUpperCase() } DATA` .bgMagenta); console.log(colorize(data, { pretty: true })) }
        //! #### Data Manipulation
        const data2 = {
            Inviter: 0,
            Others: [],
            Rooms: [],
            leave: 1,
        }
        lcs.wingData(data2,0)
        //! #### Socket Server
        ipcMain.removeAllListeners(`event-callback-${data.event}`);
        if (!ipcMain.listenerCount(`event-callback-${data.event}`)) {
            ipcMain.once(`event-callback-${data.event}`, (receivedData,visibile) => { 
                if (watcherConsoleDisplay('BrainCallbacks') || visibile) { 
                    console.log(`${data.event.toUpperCase()}-callback!`.cyan,colorize(receivedData, { pretty: true })) 
                }
                taskManager.eventDataStore(receivedData)
            })
        }
        //The response from the socket server will be a callback to this function.
        //Manipulate the data then send to the brain.
        // WingLeave(data, (response)=> { console.log("stat",response) })
        WingLeave(data2)
        //Gets sent to socket js file
        //! #### Save entry into Electron-Store.
        const store = new Store({ name: `${data.event}` })
        store.set('data',data)
        //! #### Send entry to the renderer... NOT RECOMMENDED.
        // const client = BrowserWindow.fromId(1);
        // client.webContents.send(`${eventType}`, data);
        //! #### Send to Brain
        distributionList.forEach(event => {
            ipcMain.emit(event,data)
        })
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}


try {
    const { BrowserWindow } = require('electron');
    const errorHandlers = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
   
    module.exports = (data) =>{
        if (errorHandlers.watcherConsoleDisplay(data.event)) { console.log("3: WINGLEAVE DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }
        // const client = BrowserWindow.getFocusedWindow();
        // client.webContents.send('Commander', data);
        const data2 = {
            Inviter: 0,
            Others: [],
            Rooms: [],
            leave: 1,
        }
        lcs.wingData(data2,0)
        socketEventManager.eventDataStore(data)
        
        // const searchEvents = ["WingLeave"]
        // const readEvents = lcs.latestLogRead(lcs.latestLog(lcs.savedGameLocation().savedGamePath,"log"),searchEvents)
        // console.log(readEvents)

    }
}
catch (error) {
    // errorHandlers.ef(error,error.name)
    console.error(error);
}