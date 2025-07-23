const { app, BrowserWindow, ipcMain } = require('electron');
const mm = require('music-metadata');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        resizable: false,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: true,
            webSecurity: false
        }
    });

    win.loadFile('renderer/index.html');
    win.setFullScreen(true);
    win.removeMenu();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-music-list', async () => {
    const musicFolder = path.join('C:/Users/tatil/Desktop/music/');
    const files = fs.readdirSync(musicFolder).filter(file => file.endsWith('.mp3'));
    const songs = [];

    for (const file of files) {
        const filePath = path.join(musicFolder, file);
        const metadata = await mm.parseFile(filePath);
        const stats = fs.statSync(filePath);

        let cover = null;
        if (metadata.common.picture && metadata.common.picture[0]) {
            const pictureData = Buffer.from(metadata.common.picture[0].data);
            cover = `data:${metadata.common.picture[0].format};base64,${pictureData.toString('base64')}`;
        }

        const duration = typeof metadata.format.duration === 'number' ? metadata.format.duration : 0;


        songs.push({
            title: metadata.common.title || path.parse(file).name,
            path: filePath,
            cover: cover,
            duration: duration,
            createdAt: stats.birthtime
        });
    }

    songs.sort((a, b) => b.createdAt - a.createdAt);
    return songs;
});
