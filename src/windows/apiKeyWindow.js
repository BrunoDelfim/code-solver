const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { CONSTANTS } = require('../config/constants');
const { readApiKeyFromFile, saveApiKeyToFile } = require('../services/storageService');
const { initializeGemini } = require('../services/geminiService');

let apiKeyWindow = null;

function removeApiKeyListeners() {
  ipcMain.removeAllListeners('submit-api-key');
}

async function validateAndSaveApiKey(apiKey) {
  try {
    const isValid = await initializeGemini(apiKey);
    if (isValid) {
      saveApiKeyToFile(apiKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}

function requestApiKey() {
  const savedKey = readApiKeyFromFile();
  
  return new Promise((resolve) => {
    if (apiKeyWindow && !apiKeyWindow.isDestroyed()) {
      apiKeyWindow.focus();
      return;
    }

    apiKeyWindow = new BrowserWindow({
      width: CONSTANTS.WINDOW.API_KEY.WIDTH,
      height: CONSTANTS.WINDOW.API_KEY.HEIGHT,
      resizable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(PATHS.ASSETS, 'icon.ico')
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

    const submitHandler = async (event, apiKey) => {
      if (apiKey) {
        const isValid = await validateAndSaveApiKey(apiKey);
        if (isValid) {
          apiKeyWindow.close();
          resolve(apiKey);
        } else {
          event.reply('api-key-error', 'Invalid API key. Please check and try again.');
        }
      }
    };

    ipcMain.on('submit-api-key', submitHandler);

    apiKeyWindow.on('closed', () => {
      ipcMain.removeListener('submit-api-key', submitHandler);
      apiKeyWindow = null;
      resolve(null);
    });
  });
}

function createApiKeyWindow() {
  if (apiKeyWindow && !apiKeyWindow.isDestroyed()) {
    apiKeyWindow.focus();
    return apiKeyWindow;
  }

  const savedKey = readApiKeyFromFile();
  apiKeyWindow = new BrowserWindow({
    width: CONSTANTS.WINDOW.API_KEY.WIDTH,
    height: CONSTANTS.WINDOW.API_KEY.HEIGHT,
    resizable: false,
    minimizable: false,
    maximizable: false,
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

  apiKeyWindow.setContentProtection(true);

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

  const submitHandler = async (event, apiKey) => {
    if (apiKey) {
      const isValid = await validateAndSaveApiKey(apiKey);
      if (isValid) {
        apiKeyWindow.close();
      } else {
        event.reply('api-key-error', 'Invalid API key. Please check and try again.');
      }
    }
  };

  ipcMain.on('submit-api-key', submitHandler);

  apiKeyWindow.on('closed', () => {
    ipcMain.removeListener('submit-api-key', submitHandler);
    apiKeyWindow = null;
  });

  return apiKeyWindow;
}

module.exports = {
  createApiKeyWindow,
  requestApiKey
};
