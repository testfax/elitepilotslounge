try {
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const colorize = require('json-colorizer');
    //! #### Socket Server
    // const {FactionKillBond} = require('../../sockets/tasks/combat')
    const taskManager = require('../../sockets/taskManager')
    const Store = require('electron-store')
    module.exports = (data) =>{
        const distributionList = [
            'brain-ThargoidSample'
        ]
        //! #### Logs
        if (watcherConsoleDisplay(data.event)) { console.log(`3: ${data.event.toUpperCase() } DATA` .bgMagenta); console.log(colorize(data, { pretty: true })) }
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
        // FactionKillBond(data, (response)=> { console.log("stat",response) })
        // FactionKillBond(data)
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