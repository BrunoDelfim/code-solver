const { app, globalShortcut } = require('electron');
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    const mainWindow = require('./windows/mainWindow').getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

require('electron-reload')(
  [__dirname, require('path').join(__dirname, '..', 'public')],
  {
    electron: require(require('path').join(__dirname, '..', 'node_modules', 'electron'))
  }
);

const { createMainWindow } = require('./windows/mainWindow');
const { registerShortcuts, unregisterShortcuts } = require('./utils/shortcuts');
const { initializeGemini } = require('./services/geminiService');
const { setupIpcHandlers } = require('./utils/ipcHandlers');
const { loadApiKey } = require('./services/apiKeyService');

let mainWindow;

async function initialize() {
  const apiKey = await loadApiKey();
  if (apiKey) {
    await initializeGemini(apiKey);
  }
  
  mainWindow = createMainWindow();
  setupIpcHandlers();
  registerShortcuts();
}

app.whenReady().then(initialize);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    initialize();
  }
});

app.on('will-quit', () => {
  unregisterShortcuts();
  globalShortcut.unregisterAll();
}); 