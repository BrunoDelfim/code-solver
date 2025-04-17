const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');
const { saveWindowPosition, getWindowPosition } = require('../services/windowPositionService');

let solutionWindow = null;

function createSolutionWindow() {
  if (solutionWindow && !solutionWindow.isDestroyed()) {
    return solutionWindow;
  }

  const savedPosition = getWindowPosition('solution');
  const defaultPosition = { x: 10, y: 10 };

  solutionWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.SOLUTION.WIDTH,
    height: CONSTANTS.WINDOW.SOLUTION.HEIGHT,
    x: savedPosition?.x || defaultPosition.x,
    y: savedPosition?.y || defaultPosition.y,
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

  solutionWindow.on('moved', () => {
    const position = solutionWindow.getPosition();
    saveWindowPosition('solution', { x: position[0], y: position[1] });
  });

  solutionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error loading solution window:', errorDescription);
  });

  solutionWindow.on('closed', () => {
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
      if (result) {
        solutionWindow.webContents.send('solution-update', result);
      }
      solutionWindow.show();
    });
  } else {
    if (result) {
      solutionWindow.webContents.send('solution-update', result);
    }
    solutionWindow.show();
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
    showSolutionWindow(result);
  }
}

module.exports = {
  createSolutionWindow,
  showSolutionWindow,
  hideSolutionWindow,
  toggleSolutionWindow
};
