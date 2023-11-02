const windowLoaded =  new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { 

});

ipcRenderer.on('loading-journalLoad', (data) => {
    document.getElementById('loadingNumber').textContent = data
})
ipcRenderer.on('loading-eventActioned', (data) => {
    document.getElementById('eventAction').textContent = data
})