try {
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const { ipcMain, BrowserWindow,webContents  } = require('electron');
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    // const {MaterialTrade} = require('../../sockets/tasks/Station Services')
    const Store = require('electron-store')
    module.exports = (data) =>{
        const distributionList = [
            'brain-Materials'
        ]
        //! #### Logs
        if (watcherConsoleDisplay(data.event)) { console.log(`3: ${data.event.toUpperCase() } DATA` .bgMagenta);console.log(colorize(data, { pretty: true })) }
        //! #### Socket Server
        // (((EVENTFUNCTION)))(data, (response)=> { console.log(response) })
        //Gets sent to socket js file
        //! #### Save entry into Electron-Store.
        const store = new Store({ name: `${data.event}` })
        store.set('data',data)
        // console.log(store.get('data'))
        //! #### Send entry to the renderer... NOT RECOMMENDED.
        // const client = BrowserWindow.fromId(1);
        // client.webContents.send(`${eventType}`, data);
        //! #### Send to Brain
        if (distributionList) {
            distributionList.forEach(event => {
                ipcMain.emit(event,data)
            })
        }
    }
}
catch (error) {
    errorHandler(error,error.name)
   console.error(error);
}