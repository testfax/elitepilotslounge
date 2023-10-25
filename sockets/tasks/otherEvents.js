try {
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    const { io, Manager } = require('socket.io-client')
    const { socket } = require('../socketMain')
    const colorize = require('json-colorizer');
    const {requestCmdr} = require('../../utils/loungeClientStore')
    const uuid = require('uuid');
    // const fs = require('fs')
    // const path = require('path')
    // const statusFlags = require('../../events/Appendix/statusFlags.json');
    // const utilities = require('../../events/eventUtilities');
    const theCommander = requestCmdr().commander
    function transmitter(data,callback) {
        data = {...data,...theCommander}
        // console.log(data);
        let emitResult = null;
        const timerID = uuid.v4().slice(-5); 
        if (watcherConsoleDisplay(data.event)) { console.time(timerID) }
        socket.emit('eventTransmit',data, (response) => {
            //! No response necessarily needed, unless there's some kind of visual need to show on the client.
            if (response.event === data.event) { 
                //A response from socketServer, Dont really need this.
                emitResult = response
                if (callback) { callback({ emitResult }) } //Must be 0/1
            }
            if (watcherConsoleDisplay(data.event)) { 
                console.log(`[SOCKET SERVER - OTHER EVENTS - '${data.event}']`.yellow)
                console.timeEnd(timerID)
                console.log(colorize(response, {pretty:true}))
            }
        });
    }

    const otherEvents = {
        //! Transmits all events that the client receives to the server as long as task is being called from the "EVENT" js file.
        //! Can use a callback to the originating event.js
        Music: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        WingAdd: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        WingInvite: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        WingLeave: function(data,callback) {
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        WingJoin: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        Shutdown: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        LaunchDrone: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        ReceiveText: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        USSDrop: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
        SupercruiseDestinationDrop: function(data,callback) { 
            try { data = {...data}; transmitter(data,callback); }
            catch(error) { errorHandler(error,error.name) }
        },
    }
    module.exports = otherEvents
}
catch (error) {
    errorHandler(error,error.name)
    // console.error(error);
}