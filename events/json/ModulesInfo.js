
try {
    const colorize = require('json-colorizer');
    const colors = require('colors');
    const {watcherConsoleDisplay,errorHandler} = require('../../utils/errorHandlers')
    module.exports = (data) => {
        if (watcherConsoleDisplay(data.event)) { console.log("3: MODULESINFO DATA ".bgMagenta); console.log(colorize(data, { pretty: true }))  }
    }
}
catch(error) {
    //console.error(error)
    errorHandler(error,error.name)
}
// Call the function from another page like this: 
//   console.log(someVar.flagsFinder(flags,16842765)); // ["Docked", "Landed", "Landing Gear Down", "In MainShip"]