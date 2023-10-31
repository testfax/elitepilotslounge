const {logs} = require('./utils/logConfig')
main();
function main() {
  try {
    const { dialog, nativeTheme, webContents, clipboard, screen, app, BrowserWindow, ipcMain, Menu } = require('electron')
    const Store = require('electron-store');
    const path = require('path')
    const fs = require('fs')
    
    const electronWindowIds = new Store({ name: "electronWindowIds" });
    electronWindowIds.set('currentPage','test');
    electronWindowIds.set('socketServerStatus','Not Connected to Server');
    electronWindowIds.set('appVersion',app.getVersion());
    electronWindowIds.set('socketRooms',{})
    if (app.isPackaged) { electronWindowIds.set('specifyDev',0); }
    else { electronWindowIds.set('specifyDev',1) }
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
    require('./utils/processDetection')
    const {watcherConsoleDisplay,errorHandler} = require('./utils/errorHandlers')
    const {wingData, windowPosition } = require('./utils/loungeClientStore') //Integral for pulling client-side stored information such as commander name, window pos, ect.
    
  
    //!
    //!
   
  
    const { mainMenu,rightClickMenu } = require('./menumaker')
    nativeTheme.themeSource = 'dark'
    
    //! Dev mode declaration
    const isNotDev = app.isPackaged
      // Auto Updater
    const { autoUpdater } = require('electron-updater')
    if (app.isPackaged) { 
      autoUpdater.logger = require('electron-log')
      autoUpdater.checkForUpdatesAndNotify();
      // autoUpdater.logger.transports.file.level = 'info';
      // autoUpdater.autoDownload = true
      // autoUpdater.autoInstallOnAppQuit = true
      autoUpdater.on('download-progress', (progressObj) => {
        const thisPercent = progressObj.percent / 100
        const formattedNumber = (thisPercent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits:1});
        win.setTitle(`Elite Pilots Lounge - ${JSON.stringify(app.getVersion())} Downloading New Update ${formattedNumber}`)
      })
      autoUpdater.on('error',(error)=>{
      })
      autoUpdater.on('checking-for-update', (info)=>{
      })
      autoUpdater.on('update-available',(info)=>{
        win.setTitle(`Elite Pilots Lounge - ${JSON.stringify(app.getVersion())} - ${JSON.stringify(info.version)} Update Available, Close Client to Install.`)
      })
      autoUpdater.on('update-not-available',(info)=>{
        // logs(`-AU update-not-available: ${info}`)
      })
      autoUpdater.on('update-downloaded',(info)=>{
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Available',
          message: 'A new version of the app is available. App will now automatically install and restart once completed.',
          buttons: ['Continue']
        }).then((result) => {
          if (result.response === 0) {
            // User chose to install now, quit the app and install the update.
            autoUpdater.quitAndInstall();
          }
        });
      })
    }
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
        })
        loadingScreen.on("ready-to-show", () => {
          loadingScreen.show()
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
              win.setTitle(`Elite Pilots Lounge - ${electronWindowIds.get('socketServerStatus')} - ${app.getVersion()}`)
              
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