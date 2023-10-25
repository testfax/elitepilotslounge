try {
    const { BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    //const {Missions} = require('../../sockets/tasks/startup')
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
        if (watcherConsoleDisplay(data.event)) { console.log("3: MISSIONS DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }
        
        //! No Requirement to send Commander information to webserver at the moment.
        // Missions(data, (response)=> {})
        const storeMissions = new Store({ name: 'Missions' })
        storeMissions.set('data',data)
        //console.log(storeMissions.get('data'))
        const client = BrowserWindow.fromId(1); 
        client.webContents.send('Missions', data);

        
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}