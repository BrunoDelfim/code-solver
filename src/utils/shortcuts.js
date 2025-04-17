const { globalShortcut, app } = require('electron');
const { getMainWindow } = require('../windows/mainWindow');
const { captureAndProcess, clearCapturedTexts } = require('../services/ocrService');
const { destroyCaptureStatus } = require('../windows/captureStatusWindow');
const { createSolutionWindow } = require('../windows/solutionWindow');
const { generateSolution } = require('../services/geminiService');

let isRunning = true;
let isProcessing = false;
let hasStartedProcessing = false;
let capturedText = null;
let processedResult = null;
let solutionWindow = null;

async function handleCapture() {
  if (!isProcessing) {
    isProcessing = true;
    
    try {
      if (solutionWindow) {
        solutionWindow.hide();
      }
      processedResult = null;
      hasStartedProcessing = false;
      capturedText = null;
      
      const result = await captureAndProcess();
      if (result) {
        capturedText = result;
      }
    } catch (error) {
      console.error('Error in capture process:', error);
    } finally {
      isProcessing = false;
    }
  }
}

function registerShortcuts() {
  globalShortcut.unregisterAll();

  globalShortcut.register('CommandOrControl+Shift+P', handleCapture);
  globalShortcut.register('CommandOrControl+Alt+P', handleCapture);

  globalShortcut.register('Alt+S', () => {
    if (!hasStartedProcessing) {
      return;
    }

    if (!solutionWindow) {
      solutionWindow = createSolutionWindow();
      solutionWindow.on('closed', () => {
        solutionWindow = null;
      });
      
      solutionWindow.webContents.once('did-finish-load', () => {
        if (processedResult) {
          solutionWindow.webContents.send('update-solution', processedResult);
        }
        solutionWindow.show();
      });
      
      solutionWindow.loadFile('public/solution.html');
    } else {
      if (solutionWindow.isVisible()) {
        solutionWindow.hide();
      } else {
        solutionWindow.show();
        if (processedResult) {
          solutionWindow.webContents.send('update-solution', processedResult);
        }
      }
    }
  });

  globalShortcut.register('Alt+P', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  globalShortcut.register('CommandOrControl+Enter', async () => {
    if (capturedText && !isProcessing) {
      try {
        destroyCaptureStatus();
        clearCapturedTexts();
        
        hasStartedProcessing = true;
        isProcessing = true;

        if (!solutionWindow) {
          solutionWindow = createSolutionWindow();
          solutionWindow.on('closed', () => {
            solutionWindow = null;
          });
          
          solutionWindow.webContents.once('did-finish-load', () => {
            solutionWindow.webContents.send('update-solution', {
              solution: 'Processing...',
              explanation: 'Please wait while we generate the solution.'
            });
            solutionWindow.show();
          });
          
          solutionWindow.loadFile('public/solution.html');
        } else {
          solutionWindow.webContents.send('update-solution', {
            solution: 'Processing...',
            explanation: 'Please wait while we generate the solution.'
          });
          solutionWindow.show();
        }

        const aiResult = await generateSolution(capturedText);
        if (aiResult) {
          processedResult = {
            solution: aiResult.solution || 'No solution available',
            explanation: aiResult.explanation || 'No explanation available'
          };
          
          if (!solutionWindow) {
            solutionWindow = createSolutionWindow();
            solutionWindow.on('closed', () => {
              solutionWindow = null;
            });
            
            solutionWindow.webContents.once('did-finish-load', () => {
              solutionWindow.webContents.send('update-solution', processedResult);
              solutionWindow.show();
            });
            
            solutionWindow.loadFile('public/solution.html');
          } else {
            solutionWindow.webContents.send('update-solution', processedResult);
            solutionWindow.show();
          }
        }
      } catch (error) {
        console.error('Error processing with AI:', error);
        if (solutionWindow) {
          solutionWindow.webContents.send('update-solution', {
            solution: 'Error processing with AI',
            explanation: error.message
          });
          solutionWindow.show();
        }
      } finally {
        isProcessing = false;
        registerShortcuts();
      }
    }
  });

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.exit(0);
  });
}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = {
  registerShortcuts,
  unregisterShortcuts,
  setIsProcessing: (value) => { isProcessing = value; },
  setLastResult: (value) => { capturedText = value; },
  getIsRunning: () => isRunning
};
