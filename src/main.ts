import { app, globalShortcut, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { createMainWindow, getMainWindow } from './windows/mainWindow';
import { registerShortcuts, unregisterShortcuts } from './utils/shortcuts';
import { initializeGemini } from './services/geminiService';
import { setupIpcHandlers } from './utils/ipcHandlers';
import { loadApiKey } from './services/apiKeyService';
import { createTray, destroyTray } from './utils/tray';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

const userDataPath = path.join(process.env.APPDATA || '', 'Code Solver');
if (!fs.existsSync(userDataPath)) {
  console.log('Creating user data directory:', userDataPath);
  fs.mkdirSync(userDataPath, { recursive: true });
}

let mainWindow: BrowserWindow | null = null;

async function initialize() {
  const apiKey = await loadApiKey();
  if (apiKey) {
    await initializeGemini(apiKey);
  }

  mainWindow = createMainWindow();
  setupIpcHandlers();
  registerShortcuts();
  createTray();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      mainWindow = createMainWindow();
    }
  });

  app.on('will-quit', () => {
    unregisterShortcuts();
    destroyTray();
  });
}

app.whenReady().then(initialize); 