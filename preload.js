const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('chimbaland', {
    downloadMods: () => ipcRenderer.invoke('downloadMods'),
    unzipMods: () => ipcRenderer.invoke('unzipMods'),
    deleteModFolder: () => ipcRenderer.invoke('deleteModFolder'),
    checkInstalled: () => ipcRenderer.invoke('checkInstalled'),

    //createProfile: () => ipcRenderer.invoke('createProfile'),

    getVersion: () => ipcRenderer.invoke('getVersion')
})