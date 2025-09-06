const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getMusicList: () => ipcRenderer.invoke('get-music-list')
});

contextBridge.exposeInMainWorld('electronAPI', {
  onTrayControl: (callback) => ipcRenderer.on('tray-control', (_, action) => callback(action)),
  updateCurrentSong: (title) => ipcRenderer.send('update-current-song', title),
  updateCurrentCover: (cover) => ipcRenderer.send('update-current-cover', cover) // 🔥 nueva función
});
