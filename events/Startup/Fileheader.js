try {
    const { ipcMain } = require('electron');
    const { logs,logs_error} = require('../../utils/logConfig')
    const {watcherConsoleDisplay,errorHandler,logF} = require('../../utils/errorHandlers')
    //! #### Socket Server
    const taskManager = require('../../sockets/taskManager')
    // const { findActiveSocketKey } = require('../../events-brain/brain_functions')
    // const {requestCmdr} = require('../../utils/loungeClientStore')
    const Store = require('electron-store')
    // const thargoidSample = new Store({ name: "brain-ThargoidSample" });
    module.exports = (data) =>{
        try {
            // if (thargoidSample.get('processStart')) {
            //     let compiledArray = { 
            //         "event": 'eliteProcess', 
            //         "brain": "brain-ThargoidSample", 
            //         "combinedData": data, 
            //         "systemAddress": thargoidSample.get('thisSampleSystem'), 
            //         "FID": requestCmdr().commander.FID
            //       }
            //       compiledArray.combinedData["thisSampleSystem"] = thargoidSample.get('thisSampleSystem')
            //       compiledArray.combinedData["event"] = 'eliteProcess'
            //       taskManager.brain_ThargoidSample_socket(compiledArray,'eliteProcess',findActiveSocketKey(thargoidSample.get('socketRooms'),thargoidSample.get('brain_ThargoidSample.currentTitanState')))
            // }
            const distributionList = [
                'brain-ThargoidSample'
            ]
            //! #### Logs
            if (watcherConsoleDisplay(data.event)) { logs(`3: ${data.event.toUpperCase() } DATA` .bgMagenta); logs(data) }
            //! #### Socket Server
            ipcMain.removeAllListeners(`event-callback-${data.event}`);
            if (!ipcMain.listenerCount(`event-callback-${data.event}`)) {
                ipcMain.once(`event-callback-${data.event}`, (receivedData,visibile) => { 
                    if (watcherConsoleDisplay('BrainCallbacks') || visibile) { 
                        logs(`${data.event.toUpperCase()}-callback!`.cyan,receivedData) 
                    }
                    taskManager.eventDataStore(receivedData)
                })
            }
            //The response from the socket server will be a callback to this function.
            //Manipulate the data then send to the brain.
            // LaunchDrone(data, (response)=> { logs("stat",response) })
            // LaunchDrone(data)
            //Gets sent to socket js file
            //! #### Save entry into Electron-Store.
            
            const store = new Store({ name: `${data.event}` })
            store.set('data',data)
            //! #### Send entry to the renderer... NOT RECOMMENDED.
            // const client = BrowserWindow.fromId(1);
            // client.webContents.send(`${eventType}`, data);
            //! #### Send to Brain
            if (distributionList.length > 0) {
                distributionList.forEach(event => {
                    ipcMain.emit(event,data)
                })
            }
            if (data.returnable) { return true }
        }
        catch (e) { if (data.returnable) { return false }; errorHandler(e,e.name); }
    }
}
catch (error) {
    console.log(error)
    errorHandler(error,error.name)
}
