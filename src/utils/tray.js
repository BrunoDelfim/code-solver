const { Tray, Menu, app } = require('electron');
const path = require('path');
const { PATHS } = require('../config/paths');
const { getMainWindow } = require('../windows/mainWindow');
const { toggleSolutionWindow } = require('../windows/solutionWindow');
const { captureAndProcess } = require('../services/ocrService');

let tray;
let isProcessing = false;
let lastResult = null;

function createTray() {
  try {
    const iconPath = path.join(PATHS.ASSETS, 'icon.ico');
    tray = new Tray(iconPath);
    tray.setToolTip('Code Solver');

    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show Main Window', 
        click: () => {
          const mainWindow = getMainWindow();
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Capture Screen (Ctrl+Shift+P)',
        click: async () => {
          if (!isProcessing) {
            const result = await captureAndProcess();
            if (result) {
              const mainWindow = getMainWindow();
              if (mainWindow) {
                mainWindow.webContents.send('solution-update', result);
              }
            }
          }
        }
      },
      {
        label: 'Show/Hide Solution (Alt+S)',
        click: () => {
          toggleSolutionWindow(lastResult);
        }
      },
      { type: 'separator' },
      { 
        label: 'Exit', 
        click: () => {
          isRunning = false;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    tray.on('right-click', () => {
      tray.popUpContextMenu();
    });

    return tray;
  } catch (error) {
    console.error('Error creating tray icon:', error);
    return null;
  }
}

module.exports = {
  createTray,
  getTray: () => tray
};
