const {logs} = require('./utils/logConfig')
main();
function main() {
  try {
    const { nativeTheme, webContents, clipboard, screen, app, BrowserWindow, ipcMain, Menu } = require('electron')
    const {watcherConsoleDisplay,errorHandler} = require('./utils/errorHandlers')
    const {wingData, windowPosition } = require('./utils/loungeClientStore') //Integral for pulling client-side stored information such as commander name, window pos, ect.
    const Store = require('electron-store');
    const path = require('path')
    const fs = require('fs')
    
    const electronWindowIds = new Store({ name: "electronWindowIds" });
    electronWindowIds.set('currentPage','Dashboard');
    electronWindowIds.set('appVersion',app.getVersion());
    electronWindowIds.set('specifyDev',0);
    electronWindowIds.set('socketRooms',{})
    if (!electronWindowIds.get('electronWindowIds')) {
      electronWindowIds.set('electronWindowIds',{
        "loadingScreen": 1,
        "win": 2,
        "appStatus": "clean"
      })
    }
    if (!electronWindowIds.get('brain_ThargoidSample')) { //socket related
      electronWindowIds.set('brain_ThargoidSample',"unknown")
    }

    logs("=ELITE PILOTS LOUNGE=","isPackaged: [",JSON.stringify(app.isPackaged,null,2),"] Version: [",JSON.stringify(app.getVersion(),null,2),"]");
    // //! Immediately setup to detect if the game is running. Does an initial sweep prior to 5 second delay start, then only checks
    // //!   every 5 seconds
    function getEventsArray() {
      let eventList = null
      try { eventList = fs.readFileSync(path.join(process.cwd(),'resources','app','events','Appendix','events.json'),'utf-8')
      }
      catch(notreallyanerror) { eventList = fs.readFileSync(path.join(process.cwd(),'events','Appendix','events.json'),'utf-8') }
      eventList = JSON.parse(eventList); 
      let nameList = []
      if (eventList) { 
        eventList.events.forEach((item) => {
          nameList.push(item.event)
        })
      }
      else { console.log("eventList doest have shit") }
      const multiStores = nameList.map((name) => {
        const store = new Store({name:name})
        return {
          multiStore: {
            get: (key) => store.get(key),
            set: (key, value) => store.set(key, value),
            delete: (key) => store.delete(key),
            has: (key) => store.has(key),
            clear: () => store.clear(),
            get size() { return store.size },
            get store() { return store.store },
            onDidChange: (key, callback) => store.onDidChange(key, callback),
            offDidChange: (key, callback) => store.offDidChange(key, callback),
          },
          store,
        };
      })
      
      multiStores.forEach(({ multiStore, store }) => {
        if (!store.get('data')) {
          store.set('data',{})
        }
        // multiStore.set('key', 'value');
        // console.log(multiStore.get('key'));
      
        // store.set('key2', 'value2');
        // console.log(store.get('key2'));
      });
      return multiStores
    }
    function loadBrains() {
      // Contains all ipcRenderer event listeners that must perform a PC related action.
      // Brains Directory: Loop through all files and load them.
      const brainsDirectory = path.join(process.cwd(),'events-brain')
      fs.readdir(brainsDirectory, (err, files) => {
          if (err) {
              console.error('Error reading directory:', err);
              return;
          }
          files.forEach((file,index) => {
              index++
              const filePath = path.join(brainsDirectory, file);
              fs.stat(filePath, (err, stats) => {
                  if (err) {
                      console.error('Error getting file stats:', err);
                  return;
                  }
                  if (stats.isFile()) {
                      logs('[BRAIN]'.bgCyan,"File:", `${file}`.magenta);
                      try {  require(filePath) }
                      catch(e) { console.log(e); }
                  if (files.length == index) { 
                      // const loadTime = (Date.now() - appStartTime) / 1000;
                      // if (watcherConsoleDisplay("globalLogs")) { logs("App-Initialization-Timer".bgMagenta,loadTime,"Seconds") }
                  }
                  } else if (stats.isDirectory()) {
                      logs(`Directory: ${file}`);
                  }
              });
          });
      });
      //
      
    }
    require('./utils/processDetection')
    getEventsArray()
    loadBrains()
    //!
    //!
    
  
    const { mainMenu,rightClickMenu } = require('./menumaker')
    nativeTheme.themeSource = 'dark'
    
    //! Dev mode declaration
    const isNotDev = app.isPackaged
      // Auto Updater
    const { autoUpdater } = require('electron-updater')

    //! Begin creating the electron window
    let appStartTime = null;

    //! Start splash screen
    let win
    let loadingScreen = null
    
    app.on('ready', () => { createLoadingScreen(); });
    function createLoadingScreen() {
        // Create a loading screen window
        loadingScreen = new BrowserWindow({
          width: 340,
          height: 600,
          frame: false, // Remove window frame
          alwaysOnTop: true, // Make the loading screen always on top
          // Additional options
        });
      
        // Load your loading screen HTML file
        loadingScreen.loadFile('loading.html');
        
        // Wait for the main window to be ready
        app.whenReady().then(() => {
            Menu.setApplicationMenu(mainMenu);
            appStartTime = Date.now()
            createWindow(); 
        })
    }
    const createWindow = () => {
        try {
            win = new BrowserWindow({
                title: `Elite Pilots Lounge`,
                width: !isNotDev ? 1000 : 500,
                height: 800,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                    nodeIntegration: false,
                    nodeIntegrationInWorker: true,
                    // devTools: true,
                    contextIsolation: true,
                },
                show: false,
                alwaysOnTop: false,
              })
              // const derp = app.isPackaged
              // win.webContents.executeJavaScript(`window.isPackaged = ${derp}`)
              
                  // !For navigation stuff when coded
                  // frame: false,
                  // transparent: true,
                  // icon: <path-to-icon-file>
            
            win.webContents.on("context-menu", () => {
                rightClickMenu.popup(win.webContents);
            })
            // ipcMain.on('electron-store-get-data', (event, key) => {
            //     const data = store.get(key);
            //     event.returnValue = data;
            //   });
            win.loadFile(path.join(__dirname, './renderers/test/test.html'));
            
            win.on("ready-to-show", () => {
              require('./fromRenderer')
              win.setTitle(`Elite Pilots Lounge - ${app.getVersion()}`)
              if (app.isPackaged) { 
                autoUpdater.logger = require('electron-log')
                autoUpdater.checkForUpdatesAndNotify();
                // autoUpdater.logger.transports.file.level = 'info';
                // autoUpdater.autoDownload = true
                // autoUpdater.autoInstallOnAppQuit = true
                autoUpdater.on('download-progress', (progressObj) => {
                  let log_message = "Download speed: " + progressObj.bytesPerSecond;
                  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
                  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
                  logs(`${log_message}`)
                })
                autoUpdater.on('error',(error)=>{
                  // logs(`-AU error: ${error}`);
                })
                autoUpdater.on('checking-for-update', (info)=>{
                  // logs(`-AU checking-for-update: ${info}`)
                })
                autoUpdater.on('update-available',(info)=>{
                  logs(`-AU update-available: ${info}`)
                  win.setTitle(`Elite Pilots Lounge - ${JSON.stringify(info)}`)
                })
                autoUpdater.on('update-not-available',(info)=>{
                  // logs(`-AU update-not-available: ${info}`)
                })
                autoUpdater.on('update-downloaded',(info)=>{
                  // logs(`-AU update-downloaded: ${info}`)
                })
              }
              const windowPositionz = windowPosition(win,1)
              win.setPosition(windowPositionz.moveTo[0],windowPositionz.moveTo[1])
              win.setSize(windowPositionz.resizeTo[0],windowPositionz.resizeTo[1])
              win.show()
              if (!isNotDev) { win.webContents.openDevTools(); }
            })
            // const primaryDisplay = screen.getPrimaryDisplay();
            // logs(primaryDisplay)
            
            win.on('resize', () => { windowPosition(win,0) })
            win.on('moved', () => { windowPosition(win,0); })


            let winids = {}
            let isLoadFinished = false;
            const handleLoadFinish = () => {
              if (!isLoadFinished) {
                isLoadFinished = true;      
                const loadTime = (Date.now() - appStartTime) / 1000;
                logs("App-Initialization-Timer".bgMagenta,loadTime,"Seconds")       
                if (loadingScreen.id != null) {
                  winids['loadingScreen'] = loadingScreen.id
                  winids['win'] = win.id
                  winids['appStatus'] = 'clean'
                  electronWindowIds.set('electronWindowIds',winids)
                  // logs("splash",electronWindowIds.get('electronWindowIds'))
                  // setTimeout(() => {
                  // },2000)
                  loadingScreen.close();
                  loadingScreen = null
                  
                }
                else {
                  winids['win'] = win.id
                  winids['appStatus'] = 'clean'
                  electronWindowIds.set('electronWindowIds',winids)
                  // logs("nosplash",electronWindowIds.get('electronWindowIds'))
                }
              }
            };
            
            const cwd = app.isPackaged ? path.join(process.cwd(),'resources','app') : process.cwd()
            win.webContents.on('did-finish-load',handleLoadFinish)
            module.exports = { win, cwd };
        }
        catch(e) {
            logs("failed to load load window",e)
            return;
        }
    }
    app.on('window-all-closed', () =>{
        // watcher.wat.watcher.close()
        if (process.platform !== 'darwin') app.quit()
        logs(`App Quit`.red)
        const roomCache = {
            Inviter: 0,
            Others: [],
            Rooms: [],
            leave: 1
        }
        wingData(roomCache,0)
    })
    process.on('uncaughtException', (error,origin) => {
      errorHandler(error,origin)
      //  logs('ReferenceError occurred:'.red, error.stack);
    })
    .on('unhandledRejection', (error, origin) => {
        errorHandler(error,origin)
    })
    .on('TypeError', (error,origin) => {
        errorHandler(error,origin)
        // logs(error)
    })
    .on('ReferenceError', (error,origin) => {
      errorHandler(error,origin)
        // logs(error)
    })
    .on('warning', (warning) => {
      errorHandler(warning.stack,warning.name)
      // logs('ReferenceError occurred:'.red, warning.stack);
    })
    .on('ERR_INVALID_ARG_TYPE', (error,origin) => {
        errorHandler(error,origin)
        // logs(error)
    })
    
    //todo need to add unhandledPromises error handling.
    //The errorHandlers functions sometimes dont capture errors that are the resultant of another function on a different page.
  }
  catch(e) {
      console.log("MAIN PROCESS ERROR".yellow,e)
  }
}


// {20:30:30GMT 880.495s} Webserver request failed: code 0, details ''