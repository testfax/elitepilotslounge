const windowLoaded =  new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { 

});
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
ipcRenderer.on('loading-journalLoad', (data) => {
    document.getElementById('loadingNumber').textContent = data
})
ipcRenderer.on('loading-eventActioned', (data) => {
    document.getElementById('eventAction').textContent = data
})