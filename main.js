try {
  const {watcherConsoleDisplay,errorHandler} = require('./utils/errorHandlers')
    const colors = require('colors');
    let options = { timeZone: 'America/New_York',year: 'numeric',month: 'numeric',day: 'numeric',hour: 'numeric',minute: 'numeric',second: 'numeric',},myTime = new Intl.DateTimeFormat([], options);
    console.log(`\n \n \n\n \n \n\n \n \n${myTime.format(new Date())} =====LOUNGE-CLIENT=====`.green);
    const Store = require('electron-store');
    const store = new Store();
    const electronWindowIds = new Store({ name: "electronWindowIds" });
    electronWindowIds.set('currentPage','Dashboard');
    electronWindowIds.set('socketRooms',{})
    const thisWindow = electronWindowIds.get('electronWindowIds')
    const path = require('path')
    const {webContents, clipboard, screen, app, BrowserWindow, ipcMain, Menu } = require('electron')
    const fs = require('fs')
    const { mainMenu,rightClickMenu } = require('./menumaker')
    //! Immediately setup to detect if the game is running. Does an initial sweep prior to 5 second delay start, then only checks
    //!   every 5 seconds
    
    require('./utils/processDetection')
    const lcs = require('./utils/loungeClientStore') //Integral for pulling client-side stored information such as commander name, window pos, ect.
    require('./sockets/socketMain')
    //!
    //!
    
    //constoletest
    //! Begin creating the electron window
    let appStartTime = null;
    const isDev = app.isPackaged
    // const isDev = process.env.NODE_ENV !== 'production'
    const isMac = process.platform === 'darwin'
    //! Start splash screen
    let win
    let loadingScreen = null
    // console.log(app.isPackaged)
    const tester = 1
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
            win.loadFile(path.join(__dirname, './renderers/dashboard/dashboard.html'));
            win.on("ready-to-show", () => {
                const windowPosition = lcs.windowPosition(win,1)
                win.setPosition(windowPosition.moveTo[0],windowPosition.moveTo[1])
                win.setSize(windowPosition.resizeTo[0],windowPosition.resizeTo[1])
                win.show()
                if (isDev) { win.webContents.openDevTools(); }
            })
            // const primaryDisplay = screen.getPrimaryDisplay();
            // console.log(primaryDisplay)
            
            win.on('resize', () => { lcs.windowPosition(win,0) })
            win.on('moved', () => { lcs.windowPosition(win,0); })
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
                  loadingScreen.close();
                  loadingScreen = null
                  const loadTime = (Date.now() - appStartTime) / 1000;
                  if (watcherConsoleDisplay("globalLogs")) { console.log("1App-Initialization-Timer".bgMagenta,loadTime) }
                }
                else {
                  winids['win'] = win.id
                  winids['appStatus'] = 'clean'
                  electronWindowIds.set('electronWindowIds',winids)
                  const loadTime = (Date.now() - appStartTime) / 1000;
                  if (watcherConsoleDisplay("globalLogs")) { console.log("App-Initialization-Timer".bgMagenta,loadTime,"Seconds") }
                }
              }
            };
            win.webContents.on('did-finish-load',handleLoadFinish)

            module.exports = win;
            
            
        }
        catch(e) {
            console.log("failed to load load window",e)
            return;
        }
    }

    app.on('window-all-closed', () =>{
        // watcher.wat.watcher.close()
        if (process.platform !== 'darwin') app.quit()
        console.log(`App Quit`.red)
        const roomCache = {
            Inviter: 0,
            Others: [],
            Rooms: [],
            leave: 1
        }
        lcs.wingData(roomCache,0)
    })


    process.on('uncaughtException', (error,origin) => {
      errorHandler(error,origin)
     //  console.log('ReferenceError occurred:'.red, error.stack);
   })
    .on('unhandledRejection', (error, origin) => {
       errorHandler(error,origin)
    })
    .on('TypeError', (error,origin) => {
       errorHandler(error,origin)
        console.log(error)
    })
    .on('ReferenceError', (error,origin) => {
      errorHandler(error,origin)
       console.log(error)
   })
    .on('warning', (warning) => {
      errorHandler(warning.stack,warning.name)
      // console.log('ReferenceError occurred:'.red, warning.stack);
   })
    .on('ERR_INVALID_ARG_TYPE', (error,origin) => {
       errorHandler(error,origin)
        // console.log(error)
    })
    
    //todo need to add unhandledPromises error handling.
    //The errorHandlers functions sometimes dont capture errors that are the resultant of another function on a different page.



    require('./fromRenderer') // Contains all ipcRenderer event listeners that must perform a PC related action.
    // Brains Directory: Loop through all files and load them.
    const brainsDirectory = path.join(__dirname, 'events-brain')
    fs.readdir(brainsDirectory, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return;
        }
        files.forEach((file) => {
          const filePath = path.join(brainsDirectory, file);
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error('Error getting file stats:', err);
              return;
            }
            if (stats.isFile()) {
              console.log('[BRAIN]'.bgCyan,"File:", `${file}`.magenta);
              require(filePath)
            } else if (stats.isDirectory()) {
              console.log('Directory:', file);
            }
          });
        });
      });
    //
  }
catch(e) {
    console.log("MAIN PROCESS ERROR".yellow,e)
}
// require('./searchtxt')


// {20:30:30GMT 880.495s} Webserver request failed: code 0, details ''