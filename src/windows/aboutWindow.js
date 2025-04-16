const { BrowserWindow } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.ABOUT.WIDTH,
    height: CONSTANTS.WINDOW.ABOUT.HEIGHT,
    resizable: false,
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  aboutWindow.loadFile(path.join(PATHS.PUBLIC, 'about.html'));
  return aboutWindow;
}

module.exports = {
  createAboutWindow
};
