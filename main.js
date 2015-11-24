'use strict';
const fs = require('fs');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

const dialog = electron.dialog;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

// Report crashes to our server.
electron.crashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createMainWindow() {
    // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  return win;
}

function setMenu() {
  let template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open..',
          accelerator: 'CmdOrCtrl+O',
          click(item, focusedWindow) {
            dialog.showOpenDialog(fileNames => {
              if(fileNames === undefined) return;
              let fileName = fileNames[0];
              fs.readFile(fileName, 'utf-8', (err, data) => {
                mainWindow.webContents.send('setText', data);
              });
            });
          }
        },
        {
          label: 'Save As..',
          accelerator: 'CmdOrCtrl+S',
          click(item, focusedWindow) {
            dialog.showSaveDialog(fileName => {
              if(fileName === undefined) return;
              let arg = mainWindow.webContents.send('getText', '');
              fs.writeFile(fileName, arg, err => {});
            });
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if(focusedWindow) focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (() => (process.platform == 'darwin') ? 'Ctrl+Command+F' : 'F11')(),
          click(item, focusedWin) {
            if(focusedWin) focusedWin.setFullScreen(!focusedWin.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (() => (process.platform == 'darwin') ? 'Alt+Command+I' : 'Ctrl+Shift+I')(),
          click(item, focusedWindow) {
            if(focusedWindow) focusedWindow.toggleDevTools();
          }
        },
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            electron.shell.openExternal('http://electron.atom.io');
          }
        },
      ]
    },
  ];

  if (process.platform == 'darwin') {
    let name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: `About ${name}`,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: `Hide ${name}`,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() { app.quit(); }
        },
      ]
    });
    // Window menu.
    template[3].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    );
  }

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
  setMenu();
});