try {
    const {watcherConsoleDisplay,errorHandler,pageData} = require('../utils/errorHandlers')
    const {logs} = require('../utils/logConfig')
    const { app, ipcMain, BrowserWindow,webContents  } = require('electron');
    const Store = require('electron-store');
    const windowItemsStore = new Store({ name: 'electronWindowIds'})
    const thisWindow = windowItemsStore.get('electronWindowIds')
    const client = BrowserWindow.fromId(thisWindow.win);
    // client.webContents.send('MaterialCollected', data);
    const lcs = require('../utils/loungeClientStore')
    const path = require('path')
    const fs = require('fs')
    const {fetcher} = require('./brain_functions')
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //List of events that require a brain to do work in the background. This brain handles the below.
    //      Materials (Startup)
    //      MaterialCollected (Exploration)
    //      MaterialDiscovered (Exploration)
    //      MaterialDiscarded (Exploration)
    //      MissionCompleted (Station Services)
    //      Synthesis (Other Events)
    //      MaterialTrade (Station Services)
    //      EngineerCraft (Station Services)

    //todo  EngineerContribution (Station Services)
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    function findMatObject(obj, key, value, parentKey = null) {
        if (typeof obj === 'object' && obj !== null) {
          if (obj[key] === value) {
            return { ...obj, type: parentKey };
          }
          for (const prop in obj) {
            const foundObject = findMatObject(obj[prop], key, value, prop);
            if (foundObject) {
              if (parentKey !== null) {
                foundObject.type = parentKey;
              }
              return foundObject;
            }
          }
        }
        return null;
    }
    function gradeInfos(x,y) {
        try {
          let findGrade = null;
          
          const gradeCountArray = [
            { grade: "101", count: 1 },
            { grade: "1", count: "300" },
            { grade: "2", count: "250" },
            { grade: "3", count: "200" },
            { grade: "4", count: "150" },
            { grade: "5", count: "100" }
          ]
          findGrade = gradeCountArray.find(i => i.grade == x)
          
          let findColor = null
          let calc = null;
          if (y) { 
            if (y === "101") { 
              calc = 0
            }
            else {
              calc = y / findGrade.count 
            }
            const percentColorArray = [
              { percent: "100", color: "#00FF00" },
              { percent: "70", color: "#9ACD32" },
              { percent: "50", color: "#FFFF00" },
              { percent: "30", color: "#FF4500" },
              { percent: "0", color: "#FF0000" }
            ]
            let closestDiff = Infinity;
            percentColorArray.forEach((color) => {
              const diff = Math.abs(Number(color.percent) / 100 - calc);
              if (diff < closestDiff) {
                findColor = color.color;
                closestDiff = diff;
                // logs(closestDiff)
              }
            });
            // logs(findColor,findGrade)
            
            // logs(findGrade.count,findColor,calc)
          }
        
          return [ findGrade.count, findColor, calc ];
        }
        catch(e) { 
          if (!x) { 
            logs("Missing variable data: Material Grade")
          }
          if (!y) {
            logs("Missing variable data: Material Count")
          }
        }
    }
    function sendToMaterialRenderer(data) {
        client.webContents.send('buildMatHistoryDom', data);
    }
    async function materialHistory(method_type,method_data) {
      let history = null
      // logs("MATERIAL HISTORY".yellow,"\n[TYPE:",method_type,"] \n [DATA".cyan,method_data,"]")
      if (method_type && method_type == "ADD") {
          const FET = {
            type: "materialHistory",
            method: "POST",
            filePath: ["./events/Appendix/materialHistory.json"],
            material: method_data 
          };
          // logs(colorize(FET, { pretty: true }))
          history = await fetcher(FET);
        }
        else {
        const FET = {
            method: "GET",
            filePath: ["./events/Appendix/materialHistory.json"]
          };
          history = await fetcher(FET, sendToMaterialRenderer);
        }
      return { history, method_data };
    }
    function getMats(journalData) {
      try {
          if (journalData) {
              const FET = {
                  filePath: ["../events/Appendix/materials.json"]
              }
              try {
                let gPath = path.join(__dirname,FET.filePath[0])
                gPath = path.normalize(gPath)
                const fetched = fs.readFileSync(gPath,'utf8', (err) => { if (err) return logs(err); });
                const response = JSON.parse(fetched)
                
                // const data = await arrayCombiner(fetcher(FET), journalData)
                const data = arrayCombiner(response, journalData)
                
                return data
              }
              catch(e) { errorHandler(e,e.name)}
              
              function arrayCombiner(json_materials_array, journalData) {
                try {
                  let mats_array = json_materials_array
                    let jData = journalData
                    
                    const currentDate = new Date();
                    // jData['timestamp'] = currentDate.toISOString();
                    const newStamp = { "matsCombinedStamp": currentDate.toISOString() }
                    const combinedData = {
                        ...newStamp,
                        ...mats_array,
                        Raw: mats_array.Raw.reduce((result, item) => {
                        const matchingItem = jData.Raw.find(mat => mat.Name === item.Name);
                        if (matchingItem) {
                            result.push({ ...item, ...matchingItem });
                        }
                        else {
                            const a = { "Count": 0 }
                            result.push({ ...item, ...a })
                        }
                        return result;
                        }, []),
                        Encoded: mats_array.Encoded.reduce((result, item) => {
                        const matchingItem = jData.Encoded.find(mat => mat.Name === item.Name);
                        
                        if (matchingItem) {
                            result.push({ ...item, ...matchingItem });
                        }
                        else {
                            const a = { "Count": 0 }
                            result.push({ ...item, ...a })
                        }
                        return result;
                        }, []),
                        Manufactured: mats_array.Manufactured.reduce((result, item) => {
                        const matchingItem = jData.Manufactured.find(mat => mat.Name === item.Name);
                        if (matchingItem) {
                            result.push({ ...item, ...matchingItem });
                        }
                        else {
                            const a = { "Count": 0 }
                            result.push({ ...item, ...a })
                        }
                        return result;
                        }, [])
                    };
                    const saveMaterialArray = new Store({ name: 'Materials'})
                    saveMaterialArray.set('data',combinedData)
                    return 1
                    
                  } 
                  catch(e) { errorHandler(e,e.name)}
              }
          } 
          else { logs("Materials, No Journal 'Materials' Data"); }
          }
      catch(error) { errorHandler(error,origin) }
    }
    function updateMaterialsJson(data) {
      let gPath = path.join(__dirname,"../events/Appendix/materials.json")
      gPath = path.normalize(gPath)
      let fetched = fs.readFileSync(gPath,'utf8', (err) => { if (err) return logs(err); });
      response = JSON.parse(fetched)
      response[data.Category].push(data.subData)
      response = JSON.stringify(response, null, 2);
      fs.writeFileSync(gPath, response, { flag: 'w' }, err => { if (err) { throw err}; })
    }
    //!#################################################################
    const thisBrain = 'brain-Materials'
    const visible = 0 //! Sets watcher visibility locally. watchervisibility will still have to be enabled globally in errorHandlers
    // const store = new Store({ name: `${thisBrain}` }) USED Individually
    ipcMain.on(thisBrain, (receivedData) => {
      let method_type = null;
      let method_data = null;
      if (receivedData.event == 'Materials') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        //Compbines all materials.json information and Materiels event journal data together and sorts.
        let materials = receivedData
        const ran = getMats(materials)
        
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
      }
      if (receivedData.event == 'MaterialCollected') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          //Add the new mats to the Materials.
          let MaterialCollectedData = receivedData;
          const store = new Store({ name: 'Materials' })
          let materialData = store.get('data')
          let category = MaterialCollectedData.Category
          let matObject
          matObject = findMatObject(materialData, "Name", MaterialCollectedData.Name)
          if (!matObject) { //!New Material Detector
            logs("[BE Mat]".bgRed,`${receivedData.event} Error`.yellow,receivedData,"does not exist in materials.json".red,receivedData.timestamp);

            const newObj = {
              "Name": `${MaterialCollectedData.Name}`,
              "Name_Localised": `${MaterialCollectedData.Name_Localised}`,
              "State": 0,
              "Grade": "101",
              "Group": "uncategorized",
              "known_uses": [],
              "location": "",
              "extra": "",
              "StateQRM": 0
            }
            MaterialCollectedData["subData"] = newObj
            updateMaterialsJson(MaterialCollectedData,store)
            matObject = newObj
            materialData[MaterialCollectedData.Category].push(newObj)
          }
          
          let total = null;
          let historyArray = [
            // {Name: "" },
            // {Name_Localised: "" },
            // {Count: "" },
            // {timeStamp: "" },
            {Total: "" },
            // {Grade: "" },
            // {Operator: "" },
            // {Operator_Sign: "" }
          ]
          materialData[category].forEach(mat => {
            if (mat.Name == MaterialCollectedData.Name) {
              historyArray[0].Name = MaterialCollectedData.Name
              historyArray[0].Name_Localised = MaterialCollectedData.Name_Localised
              historyArray[0].Count = MaterialCollectedData.Count
              historyArray[0].timeStamp = MaterialCollectedData.timestamp
              const gradeStuff = gradeInfos(MaterialCollectedData.Count,matObject.Grade)
              total = mat.Count + MaterialCollectedData.Count
              if (total > gradeStuff[0]) { total = gradeStuff[0] }
              else { total = mat.Count + MaterialCollectedData.Count }
              mat.Count = total
            }
            historyArray[0].Total = total;
            historyArray[0].Grade = matObject.Grade;
            historyArray[0].Operator = "+"
            historyArray[0].Operator_Sign = "»"
          })
          store.set('data',materialData)
          materialHistory("ADD",historyArray);
          if (pageData.currentPage == 'Materials') {
            // const client = BrowserWindow.fromId(thisWindow.win);
            // client.webContents.send('FromBrain-Materials-Synthesis', receivedData);
          }
          if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
        }
        catch(e) { errorHandler(e,e.name)}
      }
      if (receivedData.event == 'MissionCompleted') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          runMissionMats();
          function runMissionMats() {
            if (receivedData.MaterialsReward) {
              const store = new Store({ name: 'Materials' })
              let materialData = store.get('data')
              // logs(receivedData.MaterialsReward)
              receivedData.MaterialsReward.forEach(list=> {
                if (list.Category_Localised) { 
                  let matObject = findMatObject(materialData, "Name", list.Name.toLowerCase())
                  let total = null;
                  let historyArray = [
                    // {Name: "" },
                    // {Name_Localised: "" },
                    // {Count: "" },
                    // {timeStamp: "" },
                    {Total: "" },
                    // {Grade: "" },
                    // {Operator: "" },
                    // {Operator_Sign: "" }
                  ]
                  
                  materialData[list.Category_Localised].forEach(mat => {
                    if (mat.Name == list.Name.toLowerCase()) {
                      historyArray[0].Name = list.Name.toLowerCase()
                      historyArray[0].Name_Localised = list.Name_Localised
                      historyArray[0].Count = list.Count
                      historyArray[0].timeStamp = receivedData.timestamp
                      total = mat.Count + list.Count
                      mat.Count = total
                    }
                    historyArray[0].Total = total;
                    historyArray[0].Grade = matObject.Grade;
                    historyArray[0].Operator = "+"
                    historyArray[0].Operator_Sign = "»"
                  })
                  // logs(historyArray);
                  store.set('data',materialData)
                  materialHistory("ADD",historyArray);
                }
              })
            }
            // const client = BrowserWindow.fromId(thisWindow.win);
            // client.webContents.send('m', historyArray);
            if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
          }
        }
        catch(e) { errorHandler(e,e.name) }
      }
      if (receivedData.event == 'Synthesis') {
        
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        
        runSynthMats();
        function runSynthMats() {
          
          let synthMat = receivedData
          
          const store = new Store({ name: 'Materials' })
          let materialData = store.get('data')
          let historyArray = []
          synthMat.Materials.forEach((mat,index) => {
            let materialName = null
            if (!mat.Name_Localised) { materialName = mat.Name; }
            else { materialName = mat.Name_Localised }
            let materialObject = findMatObject(materialData, "Name",mat.Name)
            let materialGradeInfos = gradeInfos(materialObject.Grade,materialObject.Count)
            
            const calcValues = {
              ...mat,
              ...materialObject,
              ...{ "timestamp":synthMat.timestamp},
              ...{ "ReduceBy": mat.Count },
              ...{ "materialData": materialData }
            }
            const category = calcValues.type
            let materialDataUpdated = calcValues.materialData
            let total = null;
            historyArray = [
            // {Name: "" },
            // {Name_Localised: "" },
            // {Count: "" },
            // {timeStamp: "" },
            {Total: "" },
            // {Grade: "" },
            // {Operator: "" },
            // {Operator_Sign: "" }
            ]
            materialDataUpdated[category].forEach(item => {
            if (item.Name == calcValues.Name) {
                total = item.Count - calcValues.ReduceBy; 
                item.Count = total
            }
            })
            historyArray[0].Name = mat.Name
            historyArray[0].Name_Localised = mat.Name_Localised
            // if (mat.Name_Localised) {
            //   historyArray[0].Name_Localised = mat.Name_Localised
            // }
            // else {
            //   historyArray[0].Name_Localised = ""
            // }
            historyArray[0].Count = calcValues.ReduceBy
            historyArray[0].timeStamp = calcValues.timestamp
            historyArray[0].Total = total;
            historyArray[0].Grade = calcValues.Grade;
            historyArray[0].Operator = "-"
            historyArray[0].Operator_Sign = "«"
            // This updates the total materials in the Materials.json store.
            store.set('data',materialDataUpdated)
            // logs(historyArray[0].Name,historyArray[0].Total);
            materialHistory("ADD",historyArray);  
          })
          if (windowItemsStore.get('currentPage') == 'Materials') {
            const client = BrowserWindow.fromId(thisWindow.win);
            client.webContents.send('FromBrain-Materials-Synthesis', receivedData);
          }
          if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
        }
      }
      if (receivedData.event == 'MaterialTrade') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          const tradeQuoteTypes = ['Paid','Received']
          let PaidreceivedName = null;
          tradeQuoteTypes.forEach(tradeType => {
            if (tradeType == 'Paid') { 
                PaidreceivedName = receivedData.Paid
                historyBuilder('Paid')
            }
            if (tradeType == 'Received') {
                PaidreceivedName = receivedData.Received
                historyBuilder('Received')
            }
          })
          function historyBuilder(eventTypeFund) {
            const store = new Store({ name: 'Materials' })
            let materialData = store.get('data')
            let materialObject = findMatObject(materialData, "Name",PaidreceivedName.Material)
            let materialGradeInfos = gradeInfos(materialObject.Grade,materialObject.Count)
            const calcValues = {
              ...materialObject,
              ...{ "timestamp":receivedData.timestamp},
              ...{ "ReduceBy": PaidreceivedName.Quantity },
              ...{ "materialData": materialData }
            }
            const category = receivedData.Paid.Category
            let materialDataUpdated = calcValues.materialData
            let total = null;
            let historyArray = [
              {Total: "" }
            ]
            materialDataUpdated[category].forEach(item => {
              if (item.Name == PaidreceivedName.Material && eventTypeFund == 'Paid') {
                total = item.Count - calcValues.ReduceBy;
                historyArray[0].Operator = "-"
                historyArray[0].Operator_Sign = "«"
                item.Count = total
              }
              if (item.Name == PaidreceivedName.Material && eventTypeFund == 'Received') {
                total = item.Count + calcValues.ReduceBy; 
                historyArray[0].Operator = "+"
                historyArray[0].Operator_Sign = "»"
                item.Count = total
              }
            })
            historyArray[0].Name = PaidreceivedName.Material
            historyArray[0].Name_Localised = PaidreceivedName.Material_Localised
            historyArray[0].Count = calcValues.ReduceBy
            historyArray[0].timeStamp = calcValues.timestamp
            historyArray[0].Total = total;
            historyArray[0].Grade = calcValues.Grade;
            // This updates the total materials in the Materials.json store.
            store.set('data',materialDataUpdated)
            if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
            // logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp, PaidreceivedName.Material, PaidreceivedName.Quantity);
            materialHistory("ADD",historyArray);
          }
        }
        catch(e) {logs(errorHandler(e,e.name))}
      }
      if (receivedData.event == 'EngineerCraft') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
          receivedData.Ingredients.forEach(listItem => {
            const store = new Store({ name: 'Materials' })
            let materialData = store.get('data')
            let materialObject = findMatObject(materialData, "Name",listItem.Name)
            let materialGradeInfos = gradeInfos(materialObject.Grade,materialObject.Count)
            const calcValues = {
              ...materialObject,
              ...{ "timestamp":receivedData.timestamp},
              ...{ "ReduceBy": listItem.Count },
              ...{ "materialData": materialData }
            }
            const category = materialObject.type
            let materialDataUpdated = calcValues.materialData
            let total = null;
            let historyArray = [
              {Total: "" }
            ]
            materialDataUpdated[category].forEach(item => {
              if (item.Name == listItem.Name) {
                total = item.Count - calcValues.ReduceBy;
                historyArray[0].Operator = "-"
                historyArray[0].Operator_Sign = "«"
                item.Count = total
              }
            })
            historyArray[0].Name = listItem.Name
            historyArray[0].Name_Localised = listItem.Name_Localised
            historyArray[0].Count = calcValues.ReduceBy
            historyArray[0].timeStamp = calcValues.timestamp
            historyArray[0].Total = total;
            historyArray[0].Grade = calcValues.Grade;
            // This updates the total materials in the Materials.json store.
            store.set('data',materialDataUpdated)
            materialHistory("ADD",historyArray);
          })
          if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp); }
          
        }
        catch (e) {errorHandler(e,e.name)}
      }
      if (receivedData.event == 'MaterialDiscarded') {
        if (watcherConsoleDisplay('BrainEvent') && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
        try {
            const store = new Store({ name: 'Materials' })
            let materialData = store.get('data')
            let materialObject = findMatObject(materialData, "Name",receivedData.Name)
            let materialGradeInfos = gradeInfos(materialObject.Grade,materialObject.Count)
            const calcValues = {
              ...materialObject,
              ...{ "timestamp":receivedData.timestamp},
              ...{ "ReduceBy": receivedData.DiscoveryNumber },
              ...{ "materialData": materialData }
            }
            const category = receivedData.Category
            let materialDataUpdated = calcValues.materialData
            let total = null;
            let historyArray = [
              {Total: "" }
            ]
            materialDataUpdated[category].forEach(item => {
              if (item.Name == receivedData.Name) {
                total = item.Count - calcValues.ReduceBy;
                historyArray[0].Operator = "-"
                historyArray[0].Operator_Sign = "«"
                item.Count = total
              }
            })
            historyArray[0].Name = receivedData.Name
            if (receivedData.Name_Localised) {
              historyArray[0].Name_Localised = receivedData.Name_Localised
            }
            else {
              historyArray[0].Name_Localised = ""
            }
            historyArray[0].Count = calcValues.ReduceBy
            historyArray[0].timeStamp = calcValues.timestamp
            historyArray[0].Total = total;
            historyArray[0].Grade = calcValues.Grade;
            // This updates the total materials in the Materials.json store.
            store.set('data',materialDataUpdated)
            materialHistory("ADD",historyArray);
          
          logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp);
        }
        catch(e) {errorHandler(e,e.name)}
      }
      // if (receivedData.event == 'MaterialDiscovered') { //todo Is this even needed?
      //   if (watcherConsoleDisplay('BrainEvent' && visible) { logs("[BE Mat]".bgCyan,`${receivedData.event} Wait`.yellow,receivedData.timestamp); }
      //   try {
      //       const store = new Store({ name: 'Materials' })
      //       let materialData = store.get('data')
      //       let materialObject = findMatObject(materialData, "Name",receivedData.Name)
      //       // let materialGradeInfos = gradeInfos(materialObject.Grade,materialObject.Count)
      //       const calcValues = {
      //         ...materialObject,
      //         ...{ "timestamp":receivedData.timestamp},
      //         ...{ "ReduceBy": receivedData.DiscoveryNumber },
      //         ...{ "materialData": materialData }
      //       }
      //       const category = receivedData.Category
      //       let materialDataUpdated = calcValues.materialData
      //       let total = null;
      //       let historyArray = [
      //         {Total: "" }
      //       ]
      //       materialDataUpdated[category].forEach(item => {
      //         if (item.Name == receivedData.Name) {
      //           total = item.Count + calcValues.ReduceBy;
      //           historyArray[0].Operator = "+"
      //           historyArray[0].Operator_Sign = "»"
      //           item.Count = total
      //         }
      //       })
      //       historyArray[0].Name = receivedData.Name
      //       if (receivedData.Name_Localised) {
      //         historyArray[0].Name_Localised = receivedData.Name_Localised
      //       }
      //       else {
      //         historyArray[0].Name_Localised = ""
      //       }
      //       historyArray[0].Count = calcValues.ReduceBy
      //       historyArray[0].timeStamp = calcValues.timestamp
      //       historyArray[0].Total = total;
      //       historyArray[0].Grade = calcValues.Grade;
      //       // This updates the total materials in the Materials.json store.
      //       store.set('data',materialDataUpdated)
      //       materialHistory("ADD",historyArray);
          
      //     logs("[BE Mat]".bgCyan,`${receivedData.event} Comp`.green,receivedData.timestamp);
      //   }
      //   catch(e) {errorHandler(e,e.name)}
      // }
      
    })
}
catch (error) {
    // console.error(error);
    errorHandler(error,error.name)
}