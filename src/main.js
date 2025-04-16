const { app } = require('electron');
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
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

const { BrowserWindow, Tray, Menu, globalShortcut, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const { GoogleGenAI } = require('@google/genai');

const API_KEY_FILE = path.join(process.env.APPDATA, 'Code Solver', 'gemini_api_key.txt');
const PUBLIC_PATH = path.join(__dirname, '..', 'public');
const ASSETS_PATH = path.join(__dirname, '..', 'assets');

let mainWindow;
let tray;
let solutionWindow;
let captureStatusWindow;
let isRunning = true;
let isProcessing = false;
let lastResult = null;
let geminiAI = null;
let capturedTexts = [];

function readApiKeyFromFile() {
  try {
    if (fs.existsSync(API_KEY_FILE)) {
      const apiKey = fs.readFileSync(API_KEY_FILE, 'utf8').trim();
      if (apiKey) {
        console.log('API key found in file');
        return apiKey;
      }
    }
  } catch (error) {
    console.error('Error reading API key from file:', error);
  }
  return null;
}

function saveApiKeyToFile(apiKey) {
  try {
    const dir = path.dirname(API_KEY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(API_KEY_FILE, apiKey.trim());
    console.log('API key saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
}

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      autoHideMenuBar: true,
      menuBarVisible: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(ASSETS_PATH, 'icon.ico')
    });

    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Manage API Key',
            click: async () => {
              const newApiKey = await requestApiKey();
              if (newApiKey) {
                initializeGemini(newApiKey);
              }
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
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              const aboutWindow = new BrowserWindow({
                width: 300,
                height: 200,
                resizable: false,
                autoHideMenuBar: true,
                menuBarVisible: false,
                webPreferences: {
                  nodeIntegration: true,
                  contextIsolation: false
                }
              });
              aboutWindow.loadFile(path.join(PUBLIC_PATH, 'about.html'));
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile(path.join(PUBLIC_PATH, 'index.html'));
    mainWindow.setMenu(null);

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Error loading page:', errorDescription);
    });

    mainWindow.on('minimize', (event) => {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
    });

    mainWindow.on('close', (event) => {
      if (isRunning) {
        event.preventDefault();
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    });

    mainWindow.once('ready-to-show', () => {
      console.log('Main window ready to show');
      mainWindow.show();
      mainWindow.focus();
    });

  } catch (error) {
    console.error('Error creating main window:', error);
  }
}

function createTray() {
  try {
    const iconPath = path.join(ASSETS_PATH, 'icon.ico');
    tray = new Tray(iconPath);
    tray.setToolTip('Code Solver');

    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show Main Window', 
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      { type: 'separator' },
      {
        label: 'Capture Screen (Ctrl+Shift+P)',
        click: async () => {
          if (!isProcessing) {
            const result = await captureAndProcess();
            if (result) {
              mainWindow.webContents.send('solution-update', result);
            }
          }
        }
      },
      {
        label: 'Show/Hide Solution (Alt+S)',
        click: () => {
          if (!solutionWindow) {
            if (lastResult) {
              createSolutionWindow();
              solutionWindow.webContents.once('did-finish-load', () => {
                solutionWindow.webContents.send('solution-update', lastResult);
                solutionWindow.show();
              });
            }
          } else if (solutionWindow.isDestroyed()) {
            if (lastResult) {
              createSolutionWindow();
              solutionWindow.webContents.once('did-finish-load', () => {
                solutionWindow.webContents.send('solution-update', lastResult);
                solutionWindow.show();
              });
            }
          } else {
            if (solutionWindow.isVisible()) {
              solutionWindow.hide();
            } else {
              solutionWindow.show();
              solutionWindow.webContents.send('solution-update', lastResult);
            }
          }
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
      mainWindow.show();
      mainWindow.focus();
    });

    tray.on('right-click', () => {
      tray.popUpContextMenu();
    });

    updateTrayMenu();
  } catch (error) {
    console.error('Error creating tray icon:', error);
  }
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show Main Window', 
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Capture Screen (Ctrl+Shift+P)',
      click: async () => {
        if (!isProcessing) {
          const result = await captureAndProcess();
          if (result) {
            mainWindow.webContents.send('solution-update', result);
          }
        }
      },
      enabled: !isProcessing
    },
    {
      label: 'Show/Hide Solution (Alt+S)',
      click: () => {
        if (!solutionWindow) {
          if (lastResult) {
            createSolutionWindow();
            solutionWindow.webContents.once('did-finish-load', () => {
              solutionWindow.webContents.send('solution-update', lastResult);
              solutionWindow.show();
            });
          }
        } else if (solutionWindow.isDestroyed()) {
          if (lastResult) {
            createSolutionWindow();
            solutionWindow.webContents.once('did-finish-load', () => {
              solutionWindow.webContents.send('solution-update', lastResult);
              solutionWindow.show();
            });
          }
        } else {
          if (solutionWindow.isVisible()) {
            solutionWindow.hide();
          } else {
            solutionWindow.show();
            solutionWindow.webContents.send('solution-update', lastResult);
          }
        }
      },
      enabled: lastResult !== null
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
}

function toggleSolutionWindow() {
  try {
    console.log('Toggle solution window called');
    console.log('Current window state:', solutionWindow ? 'exists' : 'null');
    
    if (!solutionWindow) {
      console.log('Creating new solution window');
      createSolutionWindow();
      solutionWindow.webContents.once('did-finish-load', () => {
        console.log('Window loaded, showing');
        solutionWindow.show();
        if (lastResult) {
          solutionWindow.webContents.send('solution-update', lastResult);
        }
      });
      return;
    }

    if (solutionWindow.isDestroyed()) {
      console.log('Window was destroyed, creating new');
      solutionWindow = null;
      createSolutionWindow();
      solutionWindow.webContents.once('did-finish-load', () => {
        console.log('Window loaded, showing');
        solutionWindow.show();
        if (lastResult) {
          solutionWindow.webContents.send('solution-update', lastResult);
        }
      });
      return;
    }

    console.log('Window exists, toggling visibility');
    console.log('Current visibility:', solutionWindow.isVisible());
    
    if (solutionWindow.isVisible()) {
      console.log('Hiding window');
      solutionWindow.hide();
    } else {
      console.log('Showing window');
      solutionWindow.show();
      if (lastResult) {
        solutionWindow.webContents.send('solution-update', lastResult);
      }
    }
  } catch (error) {
    console.error('Error in toggleSolutionWindow:', error);
  }
}

function createSolutionWindow() {
  try {
    if (solutionWindow && !solutionWindow.isDestroyed()) {
      return;
    }

    solutionWindow = new BrowserWindow({
      width: 400,
      height: 300,
      x: 0,
      y: 0,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      autoHideMenuBar: true,
      menuBarVisible: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(ASSETS_PATH, 'icon.ico')
    });

    solutionWindow.setContentProtection(true);
    solutionWindow.setVisibleOnAllWorkspaces(true);
    solutionWindow.loadFile(path.join(PUBLIC_PATH, 'solution.html'));

    solutionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Error loading solution window:', errorDescription);
    });

    solutionWindow.on('closed', () => {
      console.log('Solution window closed');
      solutionWindow = null;
    });
  } catch (error) {
    console.error('Error creating solution window:', error);
    solutionWindow = null;
  }
}

function createCaptureStatusWindow() {
  captureStatusWindow = new BrowserWindow({
    width: 300,
    height: 150,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  captureStatusWindow.setContentProtection(true);
  captureStatusWindow.loadFile(path.join(PUBLIC_PATH, 'capture-status.html'));
  captureStatusWindow.setPosition(50, 50);
  captureStatusWindow.setVisibleOnAllWorkspaces(true);
}

async function captureAndProcess() {
  if (isProcessing) return null;
  
  try {
    isProcessing = true;
    updateTrayMenu();

    if (!captureStatusWindow || captureStatusWindow.isDestroyed()) {
      createCaptureStatusWindow();
    }
    
    captureStatusWindow.show();
    captureStatusWindow.webContents.send('capture-update', {
      total: capturedTexts.length,
      processing: 'Starting capture...'
    });
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (!sources || sources.length === 0) {
      throw new Error('No capture sources found');
    }

    captureStatusWindow.webContents.send('capture-update', {
      total: capturedTexts.length,
      processing: 'Processing image...'
    });

    const screenshot = sources[0].thumbnail.toDataURL();
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    captureStatusWindow.webContents.send('capture-update', {
      total: capturedTexts.length,
      processing: 'Recognizing text...'
    });

    const worker = await createWorker('eng+por');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    capturedTexts.push(text);
    
    captureStatusWindow.webContents.send('capture-update', {
      total: capturedTexts.length,
      processing: false
    });

  } catch (error) {
    console.error('Error capturing screen:', error);
    if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
      captureStatusWindow.webContents.send('capture-update', {
        total: capturedTexts.length,
        processing: 'Erro na captura!'
      });
    }
    return null;
  } finally {
    isProcessing = false;
    updateTrayMenu();
  }
}

async function processCaptures() {
  if (isProcessing) return;
  if (capturedTexts.length === 0) {
    if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
      captureStatusWindow.webContents.send('capture-update', {
        total: 0,
        processing: 'No captures to process'
      });
    }
    return;
  }

  try {
    isProcessing = true;
    updateTrayMenu();
    
    if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
      captureStatusWindow.webContents.send('capture-update', {
        total: capturedTexts.length,
        processing: 'Processing captures...'
      });
    }
    
    const combinedText = capturedTexts.join('\n\n');
    capturedTexts = [];
    
    const result = await generateSolution(combinedText);
    lastResult = result;

    if (!solutionWindow || solutionWindow.isDestroyed()) {
      createSolutionWindow();
      solutionWindow.webContents.once('did-finish-load', () => {
        solutionWindow.webContents.send('solution-update', result);
        solutionWindow.show();
        solutionWindow.focus();
      });
    } else {
      solutionWindow.webContents.send('solution-update', result);
      solutionWindow.show();
      solutionWindow.focus();
    }

    if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
      captureStatusWindow.hide();
    }

  } catch (error) {
    console.error('Error processing captures:', error);
    if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
      captureStatusWindow.webContents.send('capture-update', {
        total: capturedTexts.length,
        processing: 'Error processing!'
      });
    }
  } finally {
    isProcessing = false;
    updateTrayMenu();
  }
}

function initializeGemini(apiKey) {
  try {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      throw new Error('API key is empty');
    }
    
    if (!saveApiKeyToFile(cleanApiKey)) {
      throw new Error('Erro ao salvar c have API');
    }

    console.log('Initializing Gemini with key:', cleanApiKey);
    geminiAI = new GoogleGenAI({ apiKey: cleanApiKey });
    return true;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
}

async function requestApiKey() {
  const savedKey = readApiKeyFromFile();
  
  return new Promise((resolve) => {
    const apiKeyWindow = new BrowserWindow({
      width: 500,
      height: 300,
      resizable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    apiKeyWindow.loadFile(path.join(PUBLIC_PATH, 'api-key.html'));
    apiKeyWindow.setMenu(null);

    if (savedKey) {
      apiKeyWindow.webContents.once('did-finish-load', () => {
        apiKeyWindow.webContents.send('load-saved-key', savedKey);
      });
    }

    apiKeyWindow.setVisibleOnAllWorkspaces(true);
    apiKeyWindow.focus();

    ipcMain.once('submit-api-key', (event, apiKey) => {
      if (apiKey) {
        saveApiKeyToFile(apiKey);
      }
      apiKeyWindow.close();
      resolve(apiKey);
    });

    apiKeyWindow.on('closed', () => {
      resolve(null);
    });
  });
}

async function generateSolution(text) {
  try {
    if (!geminiAI) {
      const apiKey = await requestApiKey();
      if (!apiKey || !initializeGemini(apiKey)) {
        return {
          solution: "Error: Gemini API key not configured",
          explanation: "Please configure a valid API key to generate solutions."
        };
      }
    }

    const prompt = `You are a programming expert and problem solver of the type Code.
    Analyze the following text and determine if it is a programming problem:

    ${text}

    If it is a programming problem:
    1. Analyze the text and identify which programming language should be used. If there is no clear indication in the text, use PHP.
    2. Provide an efficient solution in the identified language
    3. Explain the solution in detail in English
    4. Include the time and space complexity
    5. Put a comment in English at the beginning of the code explaining the problem and the solution
    6. Use comments in English to explain important parts of the code
    7. Separate the solution from the explanation using the word 'Explanation:' on a new line
    8. The only English texts should be the problem name, function name, and code keywords
    9. At the beginning of the solution, indicate "Language chosen: [language name]"

    If it is NOT a programming problem:
    1. Respond "It is not a programming problem"
    2. Explain briefly why in English`;

    try {
      console.log('Starting Gemini API call...');
      
      const response = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      console.log('Response received from API');
      const text = response.text;
      console.log('Text extracted successfully');
      
      const parts = text.split('Explanation:');
      const solution = parts[0].trim();
      const explanation = parts.length > 1 ? parts[1].trim() : 'Explanation not available.';

      return {
        solution,
        explanation
      };
    } catch (apiError) {
      console.error('Detailed API error:', apiError);
      
      if (apiError.message.includes('401') || apiError.message.includes('403')) {
        return {
          solution: "Authentication error with Gemini API",
          explanation: `Specific error: ${apiError.message}\n\nPlease:\n1. Check if the API key is correct\n2. Wait a few seconds and try again\n3. If the error persists, create a new key at:\nhttps://makersuite.google.com/app/apikey`
        };
      }
      
      return {
        solution: "Error generating solution",
        explanation: `Specific API error: ${apiError.message}\n\nPlease:\n1. Wait a few seconds and try again\n2. If the error persists, create a new key`
      };
    }
  } catch (error) {
    console.error('General error:', error);
    return {
      solution: "Error generating solution",
      explanation: `An error occurred: ${error.message}\n\nPlease check your internet connection and try again.`
    };
  }
}

ipcMain.on('hide-solution', () => {
  console.log('Hide solution window requested via IPC');
  if (solutionWindow && !solutionWindow.isDestroyed()) {
    solutionWindow.hide();
  }
});

ipcMain.on('open-api-window', async () => {
  const newApiKey = await requestApiKey();
  if (newApiKey) {
    initializeGemini(newApiKey);
  }
});

ipcMain.on('open-about-window', () => {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 200,
    resizable: false,
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  aboutWindow.loadFile(path.join(PUBLIC_PATH, 'about.html'));
});

app.whenReady().then(async () => {
  try {
    const savedKey = readApiKeyFromFile();
    if (savedKey) {
      const success = initializeGemini(savedKey);
      if (!success) {
        const newKey = await requestApiKey();
        if (newKey) {
          initializeGemini(newKey);
        }
      }
    } else {
      const newKey = await requestApiKey();
      if (newKey) {
        initializeGemini(newKey);
      }
    }

    createWindow();
    createTray();

    globalShortcut.register('CommandOrControl+Shift+P', async () => {
      if (!isProcessing) {
        const result = await captureAndProcess();
        if (result) {
          mainWindow.webContents.send('solution-update', result);
        }
      }
    });

    globalShortcut.register('Alt+S', () => {
      if (!solutionWindow) {
        if (lastResult) {
          createSolutionWindow();
          solutionWindow.webContents.once('did-finish-load', () => {
            solutionWindow.webContents.send('solution-update', lastResult);
            solutionWindow.show();
          });
        }
      } else if (solutionWindow.isDestroyed()) {
        if (lastResult) {
          createSolutionWindow();
          solutionWindow.webContents.once('did-finish-load', () => {
            solutionWindow.webContents.send('solution-update', lastResult);
            solutionWindow.show();
          });
        }
      } else {
        if (solutionWindow.isVisible()) {
          solutionWindow.hide();
        } else {
          solutionWindow.show();
          solutionWindow.webContents.send('solution-update', lastResult);
        }
      }
    });

    globalShortcut.register('Alt+P', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    globalShortcut.register('CommandOrControl+Shift+Q', () => {
      isRunning = false;
      app.quit();
    });

    globalShortcut.register('Alt+CommandOrControl+P', () => {
      captureAndProcess();
    });

    globalShortcut.register('CommandOrControl+Enter', () => {
      processCaptures();
    });

    mainWindow.show();
    mainWindow.focus();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (captureStatusWindow) {
    captureStatusWindow.destroy();
  }
  globalShortcut.unregisterAll();
}); 