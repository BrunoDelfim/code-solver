import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { PATHS } from '../config/paths';
import { CONSTANTS } from '../config/constants';
import { saveWindowPosition, getWindowPosition } from '../services/windowPositionService';

interface WindowPosition {
  x: number;
  y: number;
}

let solutionWindow: BrowserWindow | null = null;

function createSolutionWindow(): BrowserWindow | null {
  if (solutionWindow && !solutionWindow.isDestroyed()) {
    return solutionWindow;
  }

  const savedPosition = getWindowPosition('solution');
  const defaultPosition: WindowPosition = { x: 10, y: 10 };

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
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(PATHS.ASSETS, 'icon.ico')
  });

  if (solutionWindow) {
    solutionWindow.setContentProtection(true);
    solutionWindow.setVisibleOnAllWorkspaces(true);
    solutionWindow.setAlwaysOnTop(true, 'screen-saver');
    solutionWindow.setFocusable(false);
    solutionWindow.loadFile(path.join(PATHS.PUBLIC, 'solution.html'));

    solutionWindow.on('moved', () => {
      if (solutionWindow) {
        const position = solutionWindow.getPosition();
        saveWindowPosition('solution', { x: position[0], y: position[1] });
      }
    });

    solutionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Error loading window:', errorDescription);
      if (solutionWindow) {
        solutionWindow.loadFile(path.join(PATHS.PUBLIC, 'solution.html')).catch(err => {
          console.error('Error reloading window:', err);
        });
      }
    });

    solutionWindow.on('closed', () => {
      solutionWindow = null;
    });

    ipcMain.on('hide-solution', () => {
      if (solutionWindow && !solutionWindow.isDestroyed()) {
        solutionWindow.hide();
      }
    });
  }

  return solutionWindow;
}

function showSolutionWindow(result?: any): void {
  console.log('Showing solution window with result:', result);
  
  if (!solutionWindow || solutionWindow.isDestroyed()) {
    console.log('Creating new solution window');
    solutionWindow = createSolutionWindow();
    
    if (solutionWindow) {
      solutionWindow.webContents.once('did-finish-load', () => {
        console.log('Window loaded, sending result');
        if (solutionWindow && result) {
          solutionWindow.webContents.send('update-solution', result);
        }
        if (solutionWindow && !solutionWindow.isDestroyed()) {
          console.log('Showing window');
          solutionWindow.show();
        }
      });

      solutionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Error loading window:', errorDescription);
        if (solutionWindow) {
          solutionWindow.loadFile(path.join(PATHS.PUBLIC, 'solution.html')).catch(err => {
            console.error('Error reloading window:', err);
          });
        }
      });
    }
  } else {
    console.log('Updating existing window');
    if (result) {
      solutionWindow.webContents.send('update-solution', result);
    }
    if (!solutionWindow.isVisible()) {
      console.log('Showing existing window');
      solutionWindow.show();
    }
  }
}

function hideSolutionWindow(): void {
  if (solutionWindow && !solutionWindow.isDestroyed()) {
    solutionWindow.hide();
  }
}

function toggleSolutionWindow(result?: any): void {
  if (!solutionWindow || solutionWindow.isDestroyed()) {
    showSolutionWindow(result);
  } else if (solutionWindow.isVisible()) {
    hideSolutionWindow();
  } else {
    showSolutionWindow(result);
  }
}

export {
  createSolutionWindow,
  showSolutionWindow,
  hideSolutionWindow,
  toggleSolutionWindow
}; 