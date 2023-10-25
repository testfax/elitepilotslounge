try {
    const { BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    const {EngineerProgress} = require('../../sockets/tasks/stationServices')
    const Store = require('electron-store')
   
    module.exports = (data) =>{
        if (watcherConsoleDisplay(data.event)) { console.log("3: ENGINEERPROGRESS DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }

        
        //! No Requirement to send information to webserver at the moment.
        // EngineerProgress(data, (response)=> { console.log(response) })

        const storeEngineerProgress = new Store({ name: 'EngineerProgress' })
        storeEngineerProgress.set('data',data)
        // console.log("eng",storeEngineerProgress.get('data'))
        const client = BrowserWindow.fromId(1); 
        client.webContents.send('EngineerProgress', data);

        
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}