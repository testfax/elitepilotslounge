try {
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const { logs } = require('../../utils/logConfig')
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const colorize = require('json-colorizer');
    //! #### Socket Server
    const taskManager = require('../../sockets/taskManager')
    const Store = require('electron-store')
    module.exports = (data) =>{
        try {
            const distributionList = [
                'brain-ThargoidSample'
            ]
            //! #### Logs
            if (watcherConsoleDisplay(data.event)) { logs(`3: ${data.event.toUpperCase() } DATA` .bgMagenta); logs(colorize(data,{pretty:true})) }
            //! #### Mutate Data
            let result = lcs.loungeClientStore(lcs.savedGameLocation('commander-event').loungeClientFile)
            if (!result[0].commander.hasOwnProperty('commander')) { 
                //get path for the savedGame path for the lounge-client.txt
                const path = result[0]["file"]
                //read commander name 
                result[0]["commander"] = { commander: data.Name, FID: data.FID }
                //pass into the clientStore the path and data to store
                lcs.loungeClientStore(path,result) 
                //"commander":{"commander":"Medi0cr3","FID":"F1279183"} <-- Saves as that. Need to do this for multiple commanders. 
                //Need to make it go through a higher order function. REDUCE comes to mind. 
            } 
            //! #### Socket Server 
            ipcMain.removeAllListeners(`event-callback-${data.event}`); 
            if (!ipcMain.listenerCount(`event-callback-${data.event}`)) { 
                ipcMain.once(`event-callback-${data.event}`, (receivedData,visibile) => { 
                    if (watcherConsoleDisplay('BrainCallbacks') || visibile) { 
                        logs(`${data.event.toUpperCase()}-callback!`.cyan,colorize(data,{pretty:true})) 
                    } 
                    taskManager.eventDataStore(receivedData) 
                }) 
            } 
            //The response from the socket server will be a callback to this function.
            //Manipulate the data then send to the brain.
            // eventName(data, (response)=> { logs("stat",response) })
            // eventName(data)
            //Gets sent to socket js file
            //! #### Save entry into Electron-Store.
            const store = new Store({ name: `${data.event}` })
            store.set('data',data)
            //! #### Send entry to the renderer... NOT RECOMMENDED.
            // const client = BrowserWindow.fromId(1);
            // client.webContents.send(`${data.event}`, data);
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
    errorHandler(error,error.name)
}