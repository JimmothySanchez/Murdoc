import { app, BrowserWindow, screen, Menu, MenuItem, ipcMain, protocol } from 'electron';
import { createTracing } from 'node:trace_events';
import { DataManager } from './data-manager';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { generate } from 'rxjs';

// Initialize remote module
require('@electron/remote/main').initialize();

let win: BrowserWindow = null;
let mConfig: any = null;
let initEvent: Electron.IpcMainEvent = null;
let _dataManager = new DataManager();

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    //width: size.width,
    //height: size.height,
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });
  initMenu();
  initIpcListener();
  loadConfig();
  if (serve) {

    //win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

function initIpcListener(): void {
  console.log('Setting IPC listeners');
  ipcMain.on('init-ipc', (event, arg) => {
    initEvent = event;
    //initEvent.reply('update-data','pong');
    initEvent.reply("update-data", _dataManager.GetData());
  })
}


function initMenu() {
  var menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Load Config', click() { loadConfig(); } },
        { label: 'Save Config', click() { saveConfig(); } },
        { label: 'Exit', click() { app.quit(); } }
      ]
    },
    {
      label: 'Videos',
      submenu: [
        { label: 'Scan Files', click() { spiderFiles(); } },
        { label: 'Start Generating Thumbs', click() { _dataManager.GenerateThumbs(mConfig.thumbPath); } },
        { label: 'Stop Generating Thumbs', click() { _dataManager.StopGeneratingThumbs(); } },
      ]
    },
    {
      label: 'Debug',
      submenu: [
        { label: 'Debug', click() { win.webContents.openDevTools(); } }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}


function saveConfig(): void {
  console.log("Creating config.")
  mConfig = {
    filePaths: ["K:\\YoutubeDownload\\Music"]
  };
  fs.writeFileSync(path.resolve(__dirname, 'MurdocConfig.json'), JSON.stringify(mConfig));
}

function loadConfig(): void {
  let rawdata: Buffer = fs.readFileSync(path.resolve(__dirname, 'MurdocConfig.json'));
  mConfig = JSON.parse(rawdata.toString());
  console.log(mConfig);
}


function spiderFiles(): void {
  let directories = mConfig["filePaths"];
  let updatePromise = _dataManager.SimpleScanDirectories(directories);
  updatePromise.then((data => {
    initEvent.reply("update-data", data);
  }));
}

// function saveData():void {
//   _dataManager.SaveDataToDisk();
// }

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More details at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    //Trying to get images to work
    protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = decodeURI(request.url.replace('file:///', ''));
      callback(pathname);
    });



    setTimeout(createWindow, 400)
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
