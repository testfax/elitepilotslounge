try {
    const { BrowserWindow,webContents  } = require('electron');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const lcs = require('../../utils/loungeClientStore')
    const socketEventManager = require('../../sockets/taskManager')
    const colorize = require('json-colorizer');
    const {CommunityGoal} = require('../../sockets/tasks/stationServices')
    const Store = require('electron-store')
   
    module.exports = (data) =>{
        // {
        //     "timestamp": "2023-05-07T02:34:16Z",
        //     "event": "CommunityGoal",
        //     "CurrentGoals": [
        //       {
        //         "CGID": 778,
        //         "Title": "Establish Thargoid Pulse Neutraliser Production",
        //         "SystemName": "YZ Ceti",
        //         "MarketName": "Clement Orbital",
        //         "Expiry": "2023-05-09T05:00:00Z",
        //         "IsComplete": false,
        //         "CurrentTotal": 15672054,
        //         "PlayerContribution": 0,
        //         "NumContributors": 2188,
        //         "TopTier": {
        //           "Name": "Tier 3",
        //           "Bonus": ""
        //         },
        //         "TopRankSize": 10,
        //         "PlayerInTopRank": false,
        //         "TierReached": "Tier 1",
        //         "PlayerPercentileBand": 100,
        //         "Bonus": 400000
        //       },
        //       {
        //         "CGID": 779,
        //         "Title": "Protect Deliveries to Clement Orbital",
        //         "SystemName": "YZ Ceti",
        //         "MarketName": "Clement Orbital",
        //         "Expiry": "2023-05-09T05:00:00Z",
        //         "IsComplete": false,
        //         "CurrentTotal": 61134035341,
        //         "PlayerContribution": 346592134,
        //         "NumContributors": 1878,
        //         "TopTier": {
        //           "Name": "Tier 5",
        //           "Bonus": ""
        //         },
        //         "TopRankSize": 10,
        //         "PlayerInTopRank": false,
        //         "TierReached": "Tier 3",
        //         "PlayerPercentileBand": 10,
        //         "Bonus": 6400000
        //       }
        //     ]
        //   }

        //! This will be fired on every 10 minute server tick.

        if (watcherConsoleDisplay(data.event)) { console.log("3: COMMUNITYGOAL DATA ".bgMagenta);console.log(colorize(data, { pretty: true })) }

        
        
        //! No Requirement to send Commander information to webserver at the moment.
        // CommunityGoal(data, (response)=> {})
        const storeCommunityGoal = new Store({ name: 'CommunityGoal' })
        storeCommunityGoal.set('data',data)
        //console.log(storeCommunityGoal.get('data'))
        const client = BrowserWindow.fromId(1); 
        client.webContents.send('CommunityGoal', data);

        
    }
}
catch (error) {
    errorHandler(error,error.name)
//    console.error(error);
}