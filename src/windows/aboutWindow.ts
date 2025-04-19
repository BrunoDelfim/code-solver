import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { PATHS } from '../config/paths';
import { CONSTANTS } from '../config/constants';

let aboutWindow: BrowserWindow | null = null;

export function createAboutWindow(): BrowserWindow | null {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return aboutWindow;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = CONSTANTS.WINDOW.ABOUT.WIDTH;
  const windowHeight = CONSTANTS.WINDOW.ABOUT.HEIGHT;
  
  const x = Math.floor((width - windowWidth) / 2);
  const y = Math.floor((height - windowHeight) / 2);

  aboutWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(PATHS.ASSETS, 'icon.ico')
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.loadFile(path.join(PATHS.PUBLIC, 'about.html'));
  return aboutWindow;
} 