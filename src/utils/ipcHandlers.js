const { ipcMain } = require('electron');
const { createApiKeyWindow } = require('../windows/apiKeyWindow');
const { createAboutWindow } = require('../windows/aboutWindow');
const { createSolutionWindow } = require('../windows/solutionWindow');
const { initializeGemini } = require('../services/geminiService');
const { captureAndProcess, processTexts } = require('../services/ocrService');
const { hideCaptureStatus } = require('../windows/captureStatusWindow');

let solutionWindow = null;
let creatingSolutionWindow = false;

function setupIpcHandlers() {
  ipcMain.on('open-api-window', async () => {
    const apiKeyWindow = createApiKeyWindow();
    
    ipcMain.once('api-key-submitted', async (event, apiKey) => {
      const success = await initializeGemini(apiKey);
      if (success) {
        apiKeyWindow.close();
      } else {
        event.reply('api-key-error', 'Invalid API Key');
      }
    });
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
        
        solutionWindow.on('closed', () => {
          solutionWindow = null;
          creatingSolutionWindow = false;
        });

        solutionWindow.webContents.on('did-finish-load', () => {
          solutionWindow.webContents.send('update-solution', text);
          solutionWindow.show();
          creatingSolutionWindow = false;
        });
      } else {
        solutionWindow.webContents.send('update-solution', text);
        solutionWindow.show();
        creatingSolutionWindow = false;
      }
    }
  });

  ipcMain.on('show-solution', (event, solution) => {
    if (creatingSolutionWindow) return;
    
    creatingSolutionWindow = true;
    hideCaptureStatus();
    
    if (!solutionWindow) {
      solutionWindow = createSolutionWindow();
      
      solutionWindow.on('closed', () => {
        solutionWindow = null;
        creatingSolutionWindow = false;
      });

      solutionWindow.webContents.on('did-finish-load', () => {
        solutionWindow.webContents.send('update-solution', solution);
        solutionWindow.show();
        creatingSolutionWindow = false;
      });
    } else {
      solutionWindow.webContents.send('update-solution', solution);
      solutionWindow.show();
      creatingSolutionWindow = false;
    }
  });
}

module.exports = { setupIpcHandlers }; 