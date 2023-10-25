//! Watcher Console Display is located in loungeClientStore.js

const colors = require('colors');
const colorize = require('json-colorizer');
const {watcherConsoleDisplay,errorHandler} = require('./errorHandlers')
const path = require('path')
const fs = require('fs')
// const colorize = require('json-colorizer');
const lcs = require('./loungeClientStore')
try  {
    let eventsJSON = fs.readFileSync('./events/Appendix/events.json', (err) => { if (err) return console.log(err); });
    eventsJSON = JSON.parse(eventsJSON)   
    //###### This eventsHandler.js is basically middleware for the specific events "*.js" files. ######
    let failEvents = new Array()
    function handleEvent(eventName, category, eventData, returnable) {
        let modulePath; let fileType;
        if (category == "json") { fileType = '.json' } else { fileType = '.js' }
        modulePath = path.join(__dirname,'..','events', category, eventName + ".js");
        if (fs.existsSync(modulePath)) {
            if (watcherConsoleDisplay(eventName)) { console.log(`2: ${path.join(category, eventName + ".js")} `.bgCyan,"FILE EXISTS ".green) }
            const handler = require(modulePath);
           
            if (returnable) { //! RETURNS DATA FROM EVENT CALLED
                if (watcherConsoleDisplay(eventName)) { console.log("2.3 RETURNABLE -> ".bgMagenta,returnable) }
                return handler(eventData); 
            }
            else { //! DOESN"T RETURN ANYTHING FROM THE EVENT CALLED.
                try {
                    if (watcherConsoleDisplay(eventName)) { console.log("2.4: Event Handling -> ".bgCyan,`${eventName}`.yellow); }
                    handler(eventData);
                }   
                catch(error) {
                    // console.log("YOLO")
                    // console.log("2.5 Error:",modulePath)
                    //todo FUTURE GUI NOTIFICATIN FOR COMMANDER SPECIFIC ?ADMINS?
                    // if (watcherConsoleDisplay("showNoEventHandler")) { console.log("2.5: NO HANDLER -> ".bgRed, `${eventName + ".js"}`.yellow); }
                    incrimentNoHandler(category,eventName);
                }
            }
        }
        else {
            if (watcherConsoleDisplay(eventName)) { console.log(`2: ${path.join(category, eventName + ".js")}`.bgCyan,"FILE DOES NOT EXIST".red) } 
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
        if (watcherConsoleDisplay("showNoEventHandler")) { console.log("2.7 ADDED NON-EXISTANT HANDLER TO ARRAY -> ".bgRed,`\n{`,`${category}`.red,`:`,`${eventName}`.yellow,`}`) }
        if (watcherConsoleDisplay("showNoEventHandlerShowArray")) { console.log(colorize(failEvents, { pretty: true }))  }
        // console.log(colorize(failEvents, {STRING_KEY: 'magenta', STRING_VALUE: 'yellow'})); //Array only stays alive for the lifetime of the App.
    }
    const initializeEvent = { //! ONLY FOR "*.log" FILES.        
        startEventSearch: (JSONevent,returnable,eventMod) => {
            
            let SpecifyEvent = JSONevent.event
            if (eventMod != undefined) { SpecifyEvent = eventMod }; 
            const category = getCategoryFromEvent(SpecifyEvent)
            //todo Need to make big alert if "EVENT" does not exist... Probably should bring it to the front side and make a form that posts to discord informing us.
            if (category == null) { 
                console.log("2.6 NO EVENT IN 'appendix/events.json'-> ".bgRed,`${SpecifyEvent}`.yellow);
                return
            }
            //category should give the Folder Path (Folder Path)
            const result = handleEvent(SpecifyEvent, category, JSONevent, returnable);
            if (returnable && result) { 
                if (watcherConsoleDisplay(SpecifyEvent)) { console.log("3: Event Returning to Watcher -> ".bgCyan,result); }
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
   // console.log(error)
}