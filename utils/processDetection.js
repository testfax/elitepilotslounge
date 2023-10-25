try {
  const {watcherConsoleDisplay,errorHandler} = require('./errorHandlers')
  const Store = require('electron-store');
  const store = new Store({ name: `brain-ThargoidSample` })
  const colors = require('colors')
  const { exec } = require('child_process');
  const { EventEmitter } = require('events');


  function isProcessRunning(processName, callback) {
    const cmd = process.platform === 'win32' ? `tasklist` : `ps aux`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          callback(err, null);
          return;
        }
        const lines = stdout.toString().split('\n');
        const processLine = lines.find(line => line.toLowerCase().includes(processName.toLowerCase()));
        callback(null, processLine !== undefined);
      });
    }
    
    
    class EliteDangerousWatcher extends EventEmitter {
      constructor() {
        super();
        this.isRunning = false;
        this.pollingInterval = 5000; // Check every 5 seconds
        this.pollingTimer = null;
    }
    
    startWatching() {
      if (watcherConsoleDisplay("globalLogs")) { console.log(`Monitoring Game Status, Interval: ${this.pollingInterval}ms `.bgWhite) }
      this.checkIsRunning();
      this.pollingTimer = setInterval(() => {
        // if (watcherConsoleDisplay("globalLogs")) { console.log(`Monitoring Game Status, Interval: ${this.pollingInterval}ms `.bgWhite) }
        this.checkIsRunning();
      }, this.pollingInterval);
      
    }
    
    stopWatching() {
      clearInterval(this.pollingTimer);
    }
    
    checkIsRunning() {
      const cmd = process.platform === 'win32' ? `tasklist` : `ps aux`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        const lines = stdout.toString().split('\n');
        const processName = 'EliteDangerous'
        const eliteDangerousLine = lines.find(line => line.toLowerCase().includes(processName.toLowerCase()));
        const isRunning = eliteDangerousLine !== undefined;
        if (isRunning !== this.isRunning) {
          this.isRunning = isRunning;
          if (isRunning) {
            this.emit('start');
          } else {
            this.emit('stop');
          }
        }
      });
    }
  }

  const eliteDangerousWatcher = new EliteDangerousWatcher();
  
  eliteDangerousWatcher.on('start', () => {
    store.set('data',{})
    if (watcherConsoleDisplay('globalLogs')) { 
      console.log("[PD]".yellow,'Elite Dangerous is running'.bgYellow);
    }
    //initate start process
    const watcher = require('./watcher')
    if (!watcher) {
      const timer = setInterval(() => {
        delete require.cache[require.resolve('./watcher')];
        const watcher = require('./watcher');
        if (!watcher) { if (watcherConsoleDisplay('globalLogs')) { console.log("[PD]".yellow,"PROCESS DETECTOR -t- -> Commander??: ".red,false) } }
        if (watcher != false) {
          clearInterval(timer);
          if (watcherConsoleDisplay('globalLogs')) { 
            console.log("[PD]".yellow," -t- -> Commander??".green,true)
          }
          watcher.eliteIO['status'] = true
          watcher.tailFile(watcher.savedGameP)
          const {gameStatus} = require('../sockets/taskManager')
          gameStatus(watcher.eliteIO)
        }
      }, 15000);
    }
    else {
      if (watcherConsoleDisplay('globalLogs')) { console.log("[PD]".yellow, "Commander??".green,true) }
      watcher.eliteIO['status'] = true
      watcher.tailFile(watcher.savedGameP)
      const {gameStatus} = require('../sockets/taskManager')
      gameStatus(watcher.eliteIO)
    }
  });
  eliteDangerousWatcher.on('stop', () => {
    if (watcherConsoleDisplay('globalLogs')) { console.log("[PD]".yellow,'Elite Dangerous has stopped'.bgRed); }
    let watcher = require('./watcher')
    watcher.eliteIO['status'] = false
    const {gameStatus} = require('../sockets/taskManager')
    gameStatus(watcher.eliteIO)
    store.set('data',{})
  });

  eliteDangerousWatcher.startWatching()
  module.exports = { isProcessRunning };
}
catch(e) {
  console.log("PROCESS DETECTION ERROR".yellow,e)
}