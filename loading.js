const windowLoaded =  new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { 

});
ipcRenderer.on('eliteRunning', (data) => {
    document.getElementById('eliteNotRunning').classList.add('w3-hide')
})
ipcRenderer.on('loadingInProgress', (data) => {
    const check1 = document.getElementById('eliteNotRunning')
    const check2 = document.getElementById('loadingNumber')
    if (check1 && !check1.classList.contains('w3-hide')) { 
        check1.classList.add('w3-hide');
    }
    if (check2 && check2.classList.contains('w3-hide')) { 
        check2.classList.remove('w3-hide');
    }
})
ipcRenderer.on('starting-allEventsInCurrentLogFile', (data) => {
    const check2 = document.getElementById('eliteNotRunning')
    if (check2 && !check2.classList.contains('w3-hide')) { 
        check2.classList.add('w3-hide');
    }
    const check1 = document.getElementById('awaitingEventStart')
    if (check1 && check1.classList.contains('w3-hide')) { 
        check1.classList.remove('w3-hide');
    }
})
ipcRenderer.on('loading-journalLoad', (data) => {
    document.getElementById('loadingNumber').textContent = data
    const check1 = document.getElementById('awaitingEventStart')
    if (check1 && !check1.classList.contains('w3-hide')) { 
        check1.classList.add('w3-hide');
    }
})
ipcRenderer.on('loading-eventActioned', (data) => {
    document.getElementById('eventAction').textContent = data
})
ipcRenderer.on('handleFailure', (data) => {
    document.getElementById('awaitingEventStart').classList.add('w3-hide')

    const container = document.getElementById('failedEvents')
    const newDiv = document.createElement('div')
    container.appendChild(newDiv)
    newDiv.setAttribute('class','w3-vivid-red')
    newDiv.textContent = data
})
