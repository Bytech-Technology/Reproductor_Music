const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getMusicList: () => ipcRenderer.invoke('get-music-list')
});
