const { BrowserWindow } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { saveWindowPosition, getWindowPosition } = require('../services/windowPositionService');

let captureStatusWindow = null;

function createCaptureStatusWindow() {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    return captureStatusWindow;
  }

  const savedPosition = getWindowPosition('status');
  const defaultPosition = { x: 10, y: 10 };

  captureStatusWindow = new BrowserWindow({
    width: 300,
    height: 150,
    x: savedPosition?.x || defaultPosition.x,
    y: savedPosition?.y || defaultPosition.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  captureStatusWindow.setContentProtection(true);
  captureStatusWindow.setVisibleOnAllWorkspaces(true);
  captureStatusWindow.setAlwaysOnTop(true, 'screen-saver');
  captureStatusWindow.setFocusable(false);
  captureStatusWindow.loadFile(path.join(PATHS.PUBLIC, 'capture-status.html'));

  captureStatusWindow.on('moved', () => {
    const position = captureStatusWindow.getPosition();
    saveWindowPosition('status', { x: position[0], y: position[1] });
  });

  captureStatusWindow.on('closed', () => {
    captureStatusWindow = null;
  });

  return captureStatusWindow;
}

function updateCaptureStatus(status) {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    captureStatusWindow.webContents.send('capture-update', status);
  }
}

function showCaptureStatus() {
  const window = createCaptureStatusWindow();
  if (window) {
    window.show();
  }
}

function hideCaptureStatus() {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    captureStatusWindow.hide();
  }
}

function destroyCaptureStatus() {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    captureStatusWindow.destroy();
    captureStatusWindow = null;
  }
}

function isStatusWindowVisible() {
  return captureStatusWindow && !captureStatusWindow.isDestroyed() && captureStatusWindow.isVisible();
}

module.exports = {
  createCaptureStatusWindow,
  updateCaptureStatus,
  showCaptureStatus,
  hideCaptureStatus,
  destroyCaptureStatus,
  isStatusWindowVisible
}; 