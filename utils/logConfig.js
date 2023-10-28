try {
    const { app } = require('electron'); 
    const fs = require('fs')
    const path = require('path')
    const log = require('electron-log'); 
    const getPath = require('platform-folders')
    let loungeClientFile = `${getPath.getHomeFolder()}/Saved Games/Frontier Developments/Elite Dangerous/lounge-client.txt`
    loungeClientFile = path.normalize(loungeClientFile)
    let logspath = `${getPath.getHomeFolder()}/Saved Games/Frontier Developments/Elite Dangerous/`
    logspath = path.normalize(logspath)
    function latestLog() { 
        try {
            const files = fs.readdirSync(logspath);
            const filteredFiles = files.filter(file=> path.extname(file) === ".log");
            const sortedFiles = filteredFiles.sort((a,b) => {
                return fs.statSync(path.join(logspath,b)).mtime.getTime() -
                fs.statSync(path.join(logspath,a)).mtime.getTime();
            })
            return path.join(sortedFiles[0]);
        }
        catch(error) {
            logs("[LOGS]".red,"NO LOGS FOUND....")
        }
    }
    log.initialize({ preload: true });
    // log.transports.file.file = 'session.log'; // Set a fixed filename for the log
    log.transports.file.level = 'verbose';
    log.transports.file.format = '{h}:{i}:{s}:{ms} [{level}] {text}'; // Customize log formatpm2 
    log.transports.file.maxSize = 10 * 1024 * 1024; // Set maximum log file size
    log.transports.file.maxFiles = 3; // Limit the number of log files
    log.transports.remote = (logData) => { 
        let result = fs.readFileSync(loungeClientFile,'utf8')
        result = JSON.parse(result)
        const formattedLogData = {
            commander: result[0].commander,
            journalLog: latestLog(),
            timestamp: new Date(),
            level: logData.level,
            message: logData.data,
        };
        fetch('http://elitepilotslounge.com:3003/', {
            method: 'POST',
            body: JSON.stringify(formattedLogData),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const logsUtil = {
        logs: async (...input) => {
            let logMessage = input.join(' ');
            if (app.isPackaged) { 
                log.info(logMessage); 
            }
            else {
                log.info(logMessage);
            }
        }
    }
    
    module.exports = logsUtil;
}
catch(e) { console.log(e) }