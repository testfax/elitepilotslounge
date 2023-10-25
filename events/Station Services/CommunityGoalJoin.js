try {
    const { BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    const {CommunityGoalJoin} = require('../../sockets/tasks/stationServices')
   
   
    module.exports = (data) =>{
        // {
        //     "timestamp": "2023-05-07T02:32:46Z",
        //     "event": "CommunityGoalJoin",
        //     "CGID": 778,
        //     "Name": "Establish Thargoid Pulse Neutraliser Production",
        //     "System": "YZ Ceti"
        //   }
        if (watcherConsoleDisplay(data.event)) { console.log("3: COMMUNITYGOALJOIN DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }

        
        
        //! No Requirement to send Commander information to webserver at the moment.
        // CommunityGoalJoin(data, (response)=> {})

        const client = BrowserWindow.fromId(1); 
        client.webContents.send('CommunityGoalJoin', data);

        
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}