try {
    const { BrowserWindow } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    const {Statistics} = require('../../sockets/tasks/startup')
    const Store = require('electron-store')
   
    module.exports = (data) =>{
        //Receive commander data and update the lounge-client.txt file.
        //Use the loungeClientStore function.
        //Data is received as an object
        // {
        //     timestamp: '2023-03-12T22:43:02Z',
        //     event: 'Commander',
        //     FID: 'F1279183',
        //     Name: 'Medi0cr3'
        // }
        if (watcherConsoleDisplay(data.event)) { console.log("3: STATISTICS DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }

        //! No Requirement to send information to webserver at the moment.
        // Statistics(data, (response)=> { console.log(response) })

        const storeStatistics = new Store({ name: 'Statistics' })
        storeStatistics.set('data',data)
        //console.log(storeStatistics.get('data'))
        const client = BrowserWindow.fromId(1);
        client.webContents.send('Statistics', data);

        
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}