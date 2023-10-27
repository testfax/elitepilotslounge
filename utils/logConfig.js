
try {
    const { app } = require('electron')
    const log = require('electron-log');
    log.initialize({ preload: true });
    const colors = require('colors');
    const colorize = require('json-colorizer');
    // log.transports.file.file = 'session.log'; // Set a fixed filename for the log
    log.transports.file.level = 'verbose';
    log.transports.file.format = '{h}:{i}:{s}:{ms} [{level}] {text}'; // Customize log format
    log.transports.file.maxSize = 10 * 1024 * 1024; // Set maximum log file size
    log.transports.file.maxFiles = 3; // Limit the number of log files

    
    const logsUtil = {
        norm: 0,
        strictDev: 0,
        logs: (...input) => {
            if (app.isPackaged) { log.info(...input) }
            if (logsUtil.strictDev) { log.info(...input) }
            if (logsUtil.norm) { console.log(...input) }
        }
    }
    
    module.exports = logsUtil;
}
catch(e) { console.log(e) }
