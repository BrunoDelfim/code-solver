const { BrowserWindow } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');

let captureStatusWindow = null;

function createCaptureStatusWindow() {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    return captureStatusWindow;
  }

  captureStatusWindow = new BrowserWindow({
    width: 300,
    height: 150,
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