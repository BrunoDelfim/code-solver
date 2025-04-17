const { BrowserWindow, Tray, Menu, app } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');

let mainWindow = null;
let tray = null;

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.MAIN.WIDTH,
    height: CONSTANTS.WINDOW.MAIN.HEIGHT,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(PATHS.ASSETS, 'icon.ico')
  });

  mainWindow.setContentProtection(true);
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.loadFile(path.join(PATHS.PUBLIC, 'index.html')).catch(error => {
    console.error('Error loading index.html:', error);
  });
  mainWindow.setMenu(null);

  try {
    createTray();
  } catch (error) {
    console.error('Error creating tray:', error);
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function createTray() {
  if (tray) {
    return;
  }

  try {
    const iconPath = path.join(PATHS.ASSETS, 'icon.ico');
    if (!require('fs').existsSync(iconPath)) {
      console.error('Icon file not found:', iconPath);
      return;
    }

    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Mostrar/Ocultar',
        click: () => {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Sair',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Ghost');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    console.error('Error in createTray:', error);
  }
}

function getMainWindow() {
  return mainWindow;
}

function destroyMainWindow() {
  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

module.exports = {
  createMainWindow,
  getMainWindow,
  destroyMainWindow
};
