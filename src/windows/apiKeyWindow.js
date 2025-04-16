const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');
const { readApiKeyFromFile, saveApiKeyToFile } = require('../services/storageService');

function removeApiKeyListeners() {
  ipcMain.removeAllListeners('submit-api-key');
}

function requestApiKey() {
  const savedKey = readApiKeyFromFile();
  
  return new Promise((resolve) => {
    const apiKeyWindow = new BrowserWindow({
      width: CONSTANTS.WINDOW.API_KEY.WIDTH,
      height: CONSTANTS.WINDOW.API_KEY.HEIGHT,
      resizable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    apiKeyWindow.loadFile(path.join(PATHS.PUBLIC, 'api-key.html'));
    apiKeyWindow.setMenu(null);

    if (savedKey) {
      apiKeyWindow.webContents.once('did-finish-load', () => {
        apiKeyWindow.webContents.send('load-saved-key', savedKey);
      });
    }

    apiKeyWindow.setVisibleOnAllWorkspaces(true);
    apiKeyWindow.focus();

    removeApiKeyListeners();

    const submitHandler = (event, apiKey) => {
      if (apiKey) {
        saveApiKeyToFile(apiKey);
      }
      apiKeyWindow.close();
      resolve(apiKey);
    };

    ipcMain.on('submit-api-key', submitHandler);

    apiKeyWindow.on('closed', () => {
      ipcMain.removeListener('submit-api-key', submitHandler);
      resolve(null);
    });
  });
}

function createApiKeyWindow() {
  const savedKey = readApiKeyFromFile();
  const apiKeyWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.API_KEY.WIDTH,
    height: CONSTANTS.WINDOW.API_KEY.HEIGHT,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  apiKeyWindow.loadFile(path.join(PATHS.PUBLIC, 'api-key.html'));
  apiKeyWindow.setMenu(null);
  
  if (savedKey) {
    apiKeyWindow.webContents.once('did-finish-load', () => {
      apiKeyWindow.webContents.send('load-saved-key', savedKey);
    });
  }
  
  apiKeyWindow.once('ready-to-show', () => {
    apiKeyWindow.show();
  });

  removeApiKeyListeners();

  const submitHandler = (event, apiKey) => {
    if (apiKey) {
      saveApiKeyToFile(apiKey);
    }
    apiKeyWindow.close();
  };

  ipcMain.on('submit-api-key', submitHandler);

  apiKeyWindow.on('closed', () => {
    ipcMain.removeListener('submit-api-key', submitHandler);
  });

  return apiKeyWindow;
}

module.exports = {
  requestApiKey,
  createApiKeyWindow
};
