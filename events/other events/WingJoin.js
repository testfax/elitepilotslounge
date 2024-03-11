try {
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const { logs } = require('../../utils/logConfig')
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    const {wingData} = require('../../utils/loungeClientStore')
    //! #### Socket Server
    const Store = require('electron-store')
    module.exports = (data) =>{
        try {
            const distributionList = [
                'brain-ThargoidSample'
            ]
            //! #### Logs
            if (watcherConsoleDisplay(data.event)) { logs(`3: ${data.event.toUpperCase() } DATA` .bgMagenta); logs(colorize(data, { pretty: true })) }
            //! #### Socket Server
            // socketEventManager.WingJoin(data, (response)=> {
            //     const data2 = {
            //         Inviter: 0,
            //         Others: data.Others,
            //         Rooms: [JSON.stringify(response.emitResult.redisQueryResult.room)],
            //         leave: 0,
            //     }
            //     wingData(data2,0)
            //     // const client = BrowserWindow.fromId(1);
            //     // client.webContents.send('WingJoin', JSON.stringify(response.emitResult.redisQueryResult))
            // })
            ipcMain.removeAllListeners(`event-callback-${data.event}`);
            if (!ipcMain.listenerCount(`event-callback-${data.event}`)) {
                ipcMain.once(`event-callback-${data.event}`, (receivedData,visibile) => { 
                    if (watcherConsoleDisplay('BrainCallbacks') || visibile) { 
                        logs(`${data.event.toUpperCase()}-callback!`.cyan,colorize(receivedData, { pretty: true })) 
                    }
                    socketEventManager.eventDataStore(receivedData)
                })
            }
            //The response from the socket server will be a callback to this function.
            //Manipulate the data then send to the brain.
            // WingJoin(data, (response)=> { logs("stat",response) })
            // WingJoin(data)
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
            if (data.returnable) { return true }
        }
        catch (e) { if (data.returnable) { return false }; errorHandler(e,e.name); }
    }
}
catch (error) {
    errorHandler(error,error.name)
}
