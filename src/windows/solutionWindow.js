const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');

let solutionWindow = null;

function createSolutionWindow() {
  if (solutionWindow && !solutionWindow.isDestroyed()) {
    return solutionWindow;
  }

  solutionWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.SOLUTION.WIDTH,
    height: CONSTANTS.WINDOW.SOLUTION.HEIGHT,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    menuBarVisible: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(PATHS.ASSETS, 'icon.ico')
  });

  solutionWindow.setContentProtection(true);
  solutionWindow.setVisibleOnAllWorkspaces(true);
  solutionWindow.setAlwaysOnTop(true, 'screen-saver');
  solutionWindow.setFocusable(false);
  solutionWindow.loadFile(path.join(PATHS.PUBLIC, 'solution.html'));

  solutionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error loading solution window:', errorDescription);
  });

  solutionWindow.on('closed', () => {
    console.log('Solution window closed');
    solutionWindow = null;
  });

  ipcMain.on('hide-solution', () => {
    if (solutionWindow && !solutionWindow.isDestroyed()) {
      solutionWindow.hide();
    }
  });

  return solutionWindow;
}

function showSolutionWindow(result) {
  if (!solutionWindow || solutionWindow.isDestroyed()) {
    solutionWindow = createSolutionWindow();
    solutionWindow.webContents.once('did-finish-load', () => {
      solutionWindow.webContents.send('solution-update', result);
      if (!solutionWindow.isVisible()) {
        solutionWindow.show();
      }
    });
  } else {
    solutionWindow.webContents.send('solution-update', result);
    if (!solutionWindow.isVisible()) {
      solutionWindow.show();
    }
  }
}

function hideSolutionWindow() {
  if (solutionWindow && !solutionWindow.isDestroyed()) {
    solutionWindow.hide();
  }
}

function toggleSolutionWindow(result) {
  if (!solutionWindow || solutionWindow.isDestroyed()) {
    showSolutionWindow(result);
  } else if (solutionWindow.isVisible()) {
    hideSolutionWindow();
  } else {
    solutionWindow.webContents.send('solution-update', result);
    solutionWindow.show();
  }
}

module.exports = {
  createSolutionWindow,
  showSolutionWindow,
  hideSolutionWindow,
  toggleSolutionWindow,
  getSolutionWindow: () => solutionWindow
};
