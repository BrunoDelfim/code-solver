import { ipcMain, BrowserWindow } from 'electron';
import { createApiKeyWindow } from '../windows/apiKeyWindow';
import { createAboutWindow } from '../windows/aboutWindow';
import { createSolutionWindow } from '../windows/solutionWindow';
import { captureAndProcess, processTexts } from '../services/ocrService';
import { hideCaptureStatus } from '../windows/captureStatusWindow';

let solutionWindow: BrowserWindow | null = null;
let creatingSolutionWindow = false;
let apiKeyWindow: BrowserWindow | null = null;

export function setupIpcHandlers(): void {
  ipcMain.on('open-api-key-window', () => {
    const window = createApiKeyWindow();
    if (window) {
      apiKeyWindow = window;
    }
  });

  ipcMain.on('close-api-key-window', () => {
    if (apiKeyWindow) {
      apiKeyWindow.close();
      apiKeyWindow = null;
    }
  });

  ipcMain.on('open-about-window', () => {
    createAboutWindow();
  });

  ipcMain.on('capture-screen', async () => {
    await captureAndProcess();
  });

  ipcMain.on('process-captures', async (event) => {
    const text = await processTexts();
    if (text) {
      if (creatingSolutionWindow) return;
      
      creatingSolutionWindow = true;
      
      if (!solutionWindow) {
        solutionWindow = createSolutionWindow();
        
        solutionWindow?.on('closed', () => {
          solutionWindow = null;
          creatingSolutionWindow = false;
        });

        solutionWindow?.webContents.on('did-finish-load', () => {
          solutionWindow?.webContents.send('update-solution', text);
        });
      } else {
        solutionWindow.webContents.send('update-solution', text);
      }
    }
  });

  ipcMain.on('hide-solution', () => {
    if (solutionWindow) {
      solutionWindow.hide();
    }
  });

  ipcMain.on('hide-capture-status', () => {
    hideCaptureStatus();
  });
} 