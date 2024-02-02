// const { socket } = require('./sockets/socketMain')
// const taskManager = require('./sockets/taskManager')
const colorize = require('json-colorizer')
console.log("running dcoh pull".cyan)
function compareByProgress(a, b) {
    const progressA = parseInt(a[Object.keys(a)[0]]["Progress:"].replace('%', ''));
    const progressB = parseInt(b[Object.keys(b)[0]]["Progress:"].replace('%', ''));
    return progressB - progressA;
  }
function timeConvert(data) {
    const isoDateString = data;
    const date = new Date(isoDateString);

    // Format the time as HH:mm
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    // Format the day as DMMMYY (e.g., 6NOV23)
    const day = date.getUTCDate();
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear().toString().slice(-2);

    const formattedDate = `${hours}:${minutes} ${day}${month}${year}`;
    return formattedDate
}

const forRedis = fetch(`https://dcoh.watch/api/v1/Overwatch/Systems`)
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok',response.status);
    }
    return response.json();
})
.then(data => {
    
    let buildMaster = []
    const targetTitan = 'Thor'
    data.systems.forEach(system=>{
        if (
            system.maelstrom.name == targetTitan &&
            system.stateProgress.isCompleted == false &&
            system.thargoidLevel.name == 'Controlled' &&
            system.stateProgress.progressPercent > 0.00

        ) {
            buildMaster.push(
                {
                    [system.name]:{
                        "Titan": system.maelstrom.name,
                        "Titan Dist": system.distanceToMaelstrom,
                        "Progress:": system.stateProgress.progressPercent * 100 + "%",
                        "Last Change:": timeConvert(system.stateProgress.progressLastChange),
                        "Last Checked:": timeConvert(system.stateProgress.progressLastChecked),
                        "Spire System:": system.thargoidSpireSiteInSystem
                    }
                }
            );
            
        }
    })
    buildMaster.sort(compareByProgress);
    console.log(colorize(buildMaster,{pretty:true}))
})
.catch(e => {
    console.log(`[DCOH] updateDcoh failed`.bgYellow,e.stack)
})
