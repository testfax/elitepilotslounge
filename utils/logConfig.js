try {
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
            return "unknown.log" 
        }
    }
    function getCommander() {
        let contents = fs.readFileSync(path.join(logspath,latestLog()),'utf8').split("\n")
            let cmdr = false
            for (let index in contents) {
                let events = contents[index]
                if (events.length >=3) {
                    events = events.replace(/\r/g, '');
                    events = JSON.parse(events);
                    if (events.event === 'Commander') {
                        cmdr = {
                            commander: events.Name,
                            FID: events.FID
                        }
                        return cmdr
                    }
                }
            }
            return cmdr
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
        let theCommander = result[0].commander
        if (!result[0].commander.hasOwnProperty('commander')) { theCommander = getCommander(); }
        const formattedLogData = {
            commander: theCommander,
            journalLog:  latestLog(),
            timestamp: new Date(),
            level: logData.level,
            message: logData.data,
        };
        if (theCommander) {
            try {
                fetch('http://elitepilotslounge.com:3003/', {
                    method: 'POST',
                    body: JSON.stringify(formattedLogData),
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            catch (e) {
                fetch('http://elitepilotslounge.com:3003/', {
                    method: 'POST',
                    body: JSON.stringify(formattedLogData),
                    headers: { 'Content-Type': 'application/json' },
                });
                
            }
            
        }
        else { logs("[LOGS]".red,"Remote Temp Disabled: NO COMMANDER".yellow)}
    }

    const logsUtil = {
        logs: async (...input) => {
            let logMessage = input.join(' ');
            log.info(logMessage);
        }
    }
    
    module.exports = logsUtil;
}
catch(e) { console.log(e) }