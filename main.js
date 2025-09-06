const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const mm = require('music-metadata');
const path = require('path');
const fs = require('fs');

let win;
let tray;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: true,
            webSecurity: false
        }
    });

    win.loadFile('renderer/index.html');
    win.removeMenu();

    // Evitar cierre completo → se oculta
    win.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            win.hide();
        }
        return false;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Crear ícono en bandeja del sistema
    tray = new Tray(path.join(__dirname, 'favicon.ico')); // tu ícono
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '▶️ Play/Pause',
            click: () => {
                if (win) {
                    win.webContents.send('tray-control', 'togglePlayPause');
                }
            }
        },
        {
            label: '⏭️ Siguiente',
            click: () => {
                if (win) {
                    win.webContents.send('tray-control', 'next');
                }
            }
        },
        {
            label: '⏮️ Anterior',
            click: () => {
                if (win) {
                    win.webContents.send('tray-control', 'prev');
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Mostrar',
            click: () => {
                win.show();
            }
        },
        {
            label: 'Salir',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Reproductor de Música');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        win.show();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // dejamos en segundo plano
    }
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
