const { BrowserWindow } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');

let aboutWindow = null;

function createAboutWindow() {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return aboutWindow;
  }

  aboutWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.ABOUT.WIDTH,
    height: CONSTANTS.WINDOW.ABOUT.HEIGHT,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    menuBarVisible: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(PATHS.ASSETS, 'icon.ico')
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.loadFile(path.join(PATHS.PUBLIC, 'about.html'));
  return aboutWindow;
}

module.exports = {
  createAboutWindow
};
