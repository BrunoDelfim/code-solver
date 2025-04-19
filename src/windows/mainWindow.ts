import { BrowserWindow, app, Event, screen } from 'electron';
import * as path from 'path';
import { PATHS } from '../config/paths';
import { CONSTANTS } from '../config/constants';

interface WindowPosition {
  x: number;
  y: number;
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

export function setIsQuitting(value: boolean): void {
    isQuitting = value;
}

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return mainWindow;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = CONSTANTS.WINDOW.MAIN.WIDTH;
  const windowHeight = CONSTANTS.WINDOW.MAIN.HEIGHT;
  
  const x = Math.floor((width - windowWidth) / 2);
  const y = Math.floor((height - windowHeight) / 2);

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    minWidth: CONSTANTS.WINDOW.MAIN.WIDTH,
    minHeight: CONSTANTS.WINDOW.MAIN.HEIGHT,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(PATHS.ASSETS, 'icon.ico')
  });

  mainWindow.loadFile(path.join(PATHS.PUBLIC, 'index.html')).catch(error => {
    console.error('Error loading index.html:', error);
  });
  mainWindow.setMenu(null);

  mainWindow.on('minimize', (event: Event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('close', (event: Event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
  }
  mainWindow?.show();
}

export function hideMainWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
}

export function quitApp(): void {
  setIsQuitting(true);
  if (mainWindow) {
    mainWindow.destroy();
  }
  app.quit();
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function destroyMainWindow(): void {
  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }
} 