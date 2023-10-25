const colorize = require('json-colorizer');
const colors = require('colors');
const {watcherConsoleDisplay,errorHandler} = require('../utils/errorHandlers');
const lcs = require('../utils/loungeClientStore');

try {
    
    const utilities = {
        // const statusFlags = require('./Appendix/statusFlags.json'); // must be included in other files needing the flagsFinder utility
        flagsFinder:  function(flags,value) {  return flags.filter(flags => value & flags.mask).map(flags => flags.name); },
        flags2Finder: function(flags2,value) { return flags2.filter(flags2 => value & flags2.mask).map(flags2 => flags2.name); },
    }
    module.exports = utilities 
}
catch(e) { console.log(e) }
