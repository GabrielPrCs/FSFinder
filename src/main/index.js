import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain
} from 'electron'


var path = require('path');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}


let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`


function createWindow() {
  if (mainWindow != null) return;

  mainWindow = new BrowserWindow({
    height: 300,
    useContentSize: true,
    width: 1000,
    frame: false,
    resizable: false,
    webPreferences: {
      devTools: false
    }
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => mainWindow = null);
};

function initWindow() {
  createWindow();
  globalShortcut.register('Alt+Space', createWindow)
}

app.on('ready', initWindow)

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('browser-window-blur', (event, win) => {
  if (!win.webContents.isDevToolsFocused()) mainWindow.close();
})

app.on('activate', () => {
  if (mainWindow === null) {
    initWindow()
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */


let response = [];
let search = "";

ipcMain.on('fs-search', (event, args) => {

  console.log(response, search);
  

  search = args.search;

  const ignore = [".git/", "node_modules/"];

  var finder = require('findit')(args.path);


  response = [];

  finder.on('directory', function (dir, stat, stop) {
    var base = path.basename(dir);
    if (!ignore.includes(base + "/") && dir.includes(search)) response.push(dir + '/')
  });

  finder.on('file', function (file, stat) {
    var base = path.basename(file);
    if (!ignore.includes(base) && base.startsWith(search)) response.push(file);
  });

  finder.on('end', () => event.sender.send('fs-search-response', response))

  // finder.on('link', function (link, stat) {
  //     console.log(link);
  // });

  finder.on('error', function (err) {
    if (err.code != 'EACCES') finder.stop();
  })
});

ipcMain.on('fs-last-results', (event, args) => event.sender.send('fs-last-results-response', {
  search,
  response
}));