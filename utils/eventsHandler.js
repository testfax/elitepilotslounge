//! Watcher Console Display is located in loungeClientStore.js
const {app} = require('electron')
const {logs} = require('./logConfig')
const {watcherConsoleDisplay,errorHandler} = require('./errorHandlers')
const path = require('path')
const fs = require('fs')
const {eventJSON} = require('./loungeClientStore')
const Store = require('electron-store');
try  {
    loadBrains()
    getEventsArray()
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
        let brainsDirectory = null;
        if (app.isPackaged) {
            brainsDirectory = path.join(process.cwd(),'resources','app','events-brain')
        }
        else {
            brainsDirectory = path.join(process.cwd(),'events-brain')
        }
        fs.readdir(brainsDirectory, (err, files) => {
            if (err) {
                logs(err)
                return;
            }
            files.forEach((file,index) => {
                index++
                const filePath = path.join(brainsDirectory, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        logs(err)
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
    }
    
    let eventsJSON = JSON.parse(eventJSON())
    //###### This eventsHandler.js is basically middleware for the specific events "*.js" files. ######
    let failEvents = new Array()
    function handleEvent(eventName, category, eventData, returnable) {
        let modulePath; let fileType;
        if (category == "json") { fileType = '.json' } else { fileType = '.js' }
            modulePath = path.join(__dirname,'..','events', category, eventName + ".js");
        if (fs.existsSync(modulePath)) {
            if (watcherConsoleDisplay(eventName)) { logs(`2: ${path.join(category, eventName + ".js")} `.bgCyan,"FILE EXISTS ".green) }
            
            const handler = require(modulePath);
            
            if (returnable) { //! RETURNS DATA FROM EVENT CALLED
                if (watcherConsoleDisplay(eventName)) { logs("2.3 RETURNABLE -> ".bgMagenta,returnable) }
                return handler(eventData); 
            }
            else { //! DOESN"T RETURN ANYTHING FROM THE EVENT CALLED.
                try {
                    if (watcherConsoleDisplay(eventName)) { logs("2.4: Event Handling -> ".bgCyan,`${eventName}`.yellow); }
                    try {
                        handler(eventData);
                        // console.log(`${eventData.event}`.yellow)
                    }
                    catch (e) {
                        console.log(e)
                    }
    
                }   
                catch(error) {
                    // logs("2.5 Error:",modulePath)
                    //todo FUTURE GUI NOTIFICATIN FOR COMMANDER SPECIFIC ?ADMINS?
                    // if (watcherConsoleDisplay("showNoEventHandler")) { logs("2.5: NO HANDLER -> ".bgRed, `${eventName + ".js"}`.yellow); }
                    incrimentNoHandler(category,eventName);
                }
            }
        }
        else {
            if (watcherConsoleDisplay(eventName)) { logs(`2: ${path.join(category, eventName + ".js")}`.bgCyan,"FILE DOES NOT EXIST".red) } 
        }
    }
    function getCategoryFromEvent(eventName) {
        let eventCat = eventsJSON.events.find(event => event.event === eventName)
        if (!eventCat) return null
        return eventCat.category
        
        // for (const event of eventsJSON.events) {
        //   if (event.event === eventName) {
        //     return event.category;
        //   }
        // }
        // return null; // Return null if event name not found
    }
    //todo The goal is to code handlers for everything. This tool is mainly for the development process, but will act as a notification for future updates to the game API events.
    function incrimentNoHandler(category, eventName) {
        // Check if the event already exists in the array
        const existingEvent = failEvents.find(event => event.category === category && event.eventName === eventName);
        
        if (!existingEvent) {
          // Add the event to the array if it doesn't already exist
          failEvents.push({ category, eventName, });
        }
      
        // Sort the array by category
        failEvents.sort((a, b) => a.category.localeCompare(b.category));
        if (watcherConsoleDisplay("showNoEventHandler")) { logs("2.7 ADDED NON-EXISTANT HANDLER TO ARRAY -> ".bgRed,`\n{`,`${category}`.red,`:`,`${eventName}`.yellow,`}`) }
        if (watcherConsoleDisplay("showNoEventHandlerShowArray")) { logs(failEvents) }
    }
    const initializeEvent = { //! ONLY FOR "*.log" FILES.        
        startEventSearch: (JSONevent,returnable,eventMod) => {            
            let SpecifyEvent = JSONevent.event
            if (eventMod != undefined) { SpecifyEvent = eventMod }; 
            const category = getCategoryFromEvent(SpecifyEvent)
            
            //todo Need to make big alert if "EVENT" does not exist... Probably should bring it to the front side and make a form that posts to discord informing us.
            if (category == null) { 
                logs("2.6 NO EVENT IN 'appendix/events.json'-> ".bgRed,`${SpecifyEvent}`.yellow);
                return
            }
            //category should give the Folder Path (Folder Path)
            const result = handleEvent(SpecifyEvent, category, JSONevent, returnable);
            if (returnable && result) { 
                if (watcherConsoleDisplay(SpecifyEvent)) { logs("3: Event Returning to Watcher -> ".bgCyan,result); }
                return result 
            }
        }
    }
    const jsonEvent = { //! ONLY FOR "*.json" FILES. 
    }
    
   
    module.exports = { initializeEvent, jsonEvent }
}
catch (error) {
    errorHandler(error,error.name)
   // logs(error)
}