try {
    const { BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    // const {ShipyardTransfer} = require('../../sockets/tasks/Station Services')
    const Store = require('electron-store')
   
    module.exports = (data) =>{
       
        if (errorHandlers.watcherConsoleDisplay(data.event)) { console.log("3: SHIPYARDTRANSFER DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }

        // ShipyardTransfer(data, (response)=> { console.log(response) })

        //Gets sent to dashboard.js

        const storeShipyardTransfer = new Store({ name: 'ShipyardTransfer' })
        storeShipyardTransfer.set('data',data)
        //console.log(storeShipyardTransfer.get('data'))
        const client = BrowserWindow.fromId(1);
        client.webContents.send('ShipyardTransfer', data);

        
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}