try {
  const {webContents, clipboard, screen, app, BrowserWindow, ipcMain, Menu } = require('electron')
  const {watcherConsoleDisplay,errorHandler} = require('./utils/errorHandlers')
  const path = require('path')
  const fs = require('fs')
  fs.writeFileSync(path.join(app.getPath('appData'),'elitepilotslounge','logs','main.log'), '', { flag: 'w' })
  const {logs} = require('./utils/logConfig')
  logs(`=====LOUNGE-CLIENT=====`.green);
  const Store = require('electron-store');
  const store = new Store();
  const electronWindowIds = new Store({ name: "electronWindowIds" });
  electronWindowIds.set('currentPage','Dashboard');
  electronWindowIds.set('socketRooms',{})
  const thisWindow = electronWindowIds.get('electronWindowIds')
  const { mainMenu,rightClickMenu } = require('./menumaker')
  const { autoUpdater, AppUpdater } = require('electron-updater')
  // //! Immediately setup to detect if the game is running. Does an initial sweep prior to 5 second delay start, then only checks
  // //!   every 5 seconds




  require('./utils/processDetection')
  const {wingData, windowPosition } = require('./utils/loungeClientStore') //Integral for pulling client-side stored information such as commander name, window pos, ect.
  // require('./sockets/socketMain')
  //!
  //Auto Updater
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.on('error',(error)=>{
    logs(error);
  })
  // autoUpdater.on('checking-for-update')
  autoUpdater.on('update-available',(info)=>{
    logs(info)
  })
  autoUpdater.on('update-not-available',(info)=>{
    logs(info)
  })
  autoUpdater.on('update-downloaded',(info)=>{
    logs(info)
  })
  //!
  
  //! Begin creating the electron window
  let appStartTime = null;
  const isDev = app.isPackaged
  // const isDev = process.env.NODE_ENV !== 'production'
  const isMac = process.platform === 'darwin'
  //! Start splash screen
  let win
  let loadingScreen = null
  // logs(app.isPackaged)
  const tester = 0
  // if (app.isPackaged) { app.on('ready', () => { createLoadingScreen(); }); }
  if (tester) { app.on('ready', () => { createLoadingScreen(); }); }
  else {
    app.on('ready', () => { 
      createWindow();  
      Menu.setApplicationMenu(mainMenu);
      appStartTime = Date.now()
      
    });
    app.whenReady().then(() => {
      
      
    })
  }
  function createLoadingScreen() {
      // Create a loading screen window
      loadingScreen = new BrowserWindow({
      width: isDev ? 340 : 340,
        height: 320,
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
              title: "Elite Pilots Lounge",
              width: isDev ? 1000 : 500,
              height: 600,
              webPreferences: {
                  preload: path.join(__dirname, 'preload.js'),
                  nodeIntegration: false,
                  nodeIntegrationInWorker: true,
                  // devTools: true,
                  contextIsolation: true,
              },
              show: false,
              alwaysOnTop: false,
          
              // !For navigation stuff when coded
              // frame: false,
              // transparent: true,
              // icon: <path-to-icon-file>
          })
          
          win.webContents.on("context-menu", () => {
              rightClickMenu.popup(win.webContents);
          })
          ipcMain.on('electron-store-get-data', (event, key) => {
              const data = store.get(key);
              event.returnValue = data;
            });
          win.loadFile(path.join(__dirname, './renderers/test/test.html'));
          win.on("ready-to-show", () => {
              const windowPositionz = windowPosition(win,1)
              win.setPosition(windowPositionz.moveTo[0],windowPositionz.moveTo[1])
              win.setSize(windowPositionz.resizeTo[0],windowPositionz.resizeTo[1])
              win.show()
              win.webContents.openDevTools(); 
              // if (isDev) { win.webContents.openDevTools(); }
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
              if (loadingScreen != null && !isDev) {
                winids['loadingScreen'] = loadingScreen.id
                winids['win'] = win.id
                winids['appStatus'] = 'clean'
                electronWindowIds.set('electronWindowIds',winids)
                // logs("splash",electronWindowIds.get('electronWindowIds'))
                loadingScreen.close();
                loadingScreen = null
                remainderLoads()
              }
              else {
                winids['win'] = win.id
                winids['appStatus'] = 'clean'
                electronWindowIds.set('electronWindowIds',winids)
                // logs("nosplash",electronWindowIds.get('electronWindowIds'))
                remainderLoads()
              }
            }
          };
          win.webContents.on('did-finish-load',handleLoadFinish)
          module.exports = win;
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
      logs(error)
  })
  .on('ReferenceError', (error,origin) => {
    errorHandler(error,origin)
      logs(error)
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

  function remainderLoads() {
    autoUpdater.checkForUpdates()
    require('./fromRenderer') // Contains all ipcRenderer event listeners that must perform a PC related action.
    // Brains Directory: Loop through all files and load them.
    const brainsDirectory = path.join(__dirname, 'events-brain')
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
              require(filePath)
              if (files.length == index) { 
                const loadTime = (Date.now() - appStartTime) / 1000;
                if (watcherConsoleDisplay("globalLogs")) { logs("App-Initialization-Timer".bgMagenta,loadTime,"Seconds") }
              }
            } else if (stats.isDirectory()) {
              logs('Directory:', file);
            }
          });
        });
    });
    //
    
  }

  
}
catch(e) {
    logs("MAIN PROCESS ERROR".yellow,e)
}
// require('./searchtxt')


// {20:30:30GMT 880.495s} Webserver request failed: code 0, details ''