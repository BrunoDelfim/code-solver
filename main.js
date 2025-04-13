const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const { GoogleGenAI } = require('@google/genai');

// Definir caminho do arquivo da chave API
const API_KEY_FILE = path.join(process.env.APPDATA, 'LeetCode Solver', 'gemini_api_key.txt');

let mainWindow;
let tray;
let solutionWindow;
let isRunning = true;
let isProcessing = false;
let lastResult = null;
let geminiAI = null;
let configWindow;

// Função para ler a chave API do arquivo
function readApiKeyFromFile() {
  try {
    if (fs.existsSync()) {
      const apiKey = fs.readFileSync(API_KEY_FILE, 'utf8').trim();
      return apiKey || null;
    }
  } catch (error) {
    console.error('Erro ao ler chave API do arquivo:', error);
  }
  return null;
}

// Função para salvar a chave API no arquivo
function saveApiKeyToFile(apiKey) {
  try {
    // Criar diretório se não existir
    const dir = path.dirname(API_KEY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(API_KEY_FILE, apiKey.trim());
    return true;
  } catch (error) {
    console.error('Erro ao salvar chave API:', error);
    return false;
  }
}

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(__dirname, 'assets/icon.ico')
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Erro ao carregar página:', errorDescription);
    });

    mainWindow.on('minimize', (event) => {
      event.preventDefault();
      mainWindow.hide();
    });

    mainWindow.on('close', (event) => {
      if (isRunning) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  } catch (error) {
    console.error('Erro ao criar janela principal:', error);
  }
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'assets/icon.ico');
    tray = new Tray(iconPath);
    tray.setToolTip('LeetCode Solver');

    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Mostrar Janela Principal', 
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      { type: 'separator' },
      {
        label: 'Capturar Tela (Ctrl+Shift+P)',
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
        label: 'Mostrar/Ocultar Solução (Alt+S)',
        click: () => {
          // Simular o pressionamento do atalho Alt+S
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
        label: 'Sair', 
        click: () => {
          isRunning = false;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    // Adicionar evento de clique no ícone
    tray.on('click', () => {
      mainWindow.show();
      mainWindow.focus();
    });

    // Adicionar evento de clique com botão direito
    tray.on('right-click', () => {
      tray.popUpContextMenu();
    });

    // Atualizar o menu quando o estado de processamento mudar
    updateTrayMenu();
  } catch (error) {
    console.error('Erro ao criar ícone na bandeja:', error);
  }
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Mostrar Janela Principal', 
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Capturar Tela (Ctrl+Shift+P)',
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
      label: 'Mostrar/Ocultar Solução (Alt+S)',
      click: () => {
        // Simular o pressionamento do atalho Alt+S
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
      label: 'Sair', 
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
    
    // Se a janela não existe, criar uma nova
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

    // Se a janela existe, verificar se foi destruída
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

    // Alternar visibilidade
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
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(__dirname, 'assets/icon.ico')
    });

    solutionWindow.loadFile('solution.html');

    solutionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Erro ao carregar janela de solução:', errorDescription);
    });

    solutionWindow.on('closed', () => {
      console.log('Solution window closed');
      solutionWindow = null;
    });
  } catch (error) {
    console.error('Erro ao criar janela de solução:', error);
    solutionWindow = null;
  }
}

function createConfigWindow() {
    configWindow = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        parent: mainWindow,
        modal: false,
        alwaysOnTop: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        skipTaskbar: false
    });

    configWindow.loadFile('config.html');
    configWindow.setMenu(null);
    configWindow.on('closed', () => {
        configWindow = null;
    });
}

async function captureAndProcess() {
  if (isProcessing) return null;
  
  try {
    isProcessing = true;
    updateTrayMenu();
    
    // Notificar início do processo apenas na janela principal
    mainWindow.webContents.send('status-update', { status: 'Iniciando captura de tela...' });
    
    // Capturar a tela usando a API nativa do Electron
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (!sources || sources.length === 0) {
      throw new Error('Nenhuma fonte de captura encontrada');
    }

    mainWindow.webContents.send('status-update', { status: 'Processando imagem...' });

    // Pegar a primeira tela
    const screenshot = sources[0].thumbnail.toDataURL();

    // Converter base64 para buffer
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    mainWindow.webContents.send('status-update', { status: 'Reconhecendo texto...' });

    // Processar com Tesseract
    const worker = await createWorker('eng+por');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    console.log('Texto capturado:', text);

    mainWindow.webContents.send('status-update', { status: 'Analisando problema...' });

    // Processar o texto e extrair informações relevantes
    const problemInfo = extractProblemInfo(text);
    
    mainWindow.webContents.send('status-update', { status: 'Gerando solução...' });

    // Gerar solução baseada no problema
    const result = await generateSolution(problemInfo);
    lastResult = result; // Salvar última solução

    mainWindow.webContents.send('status-update', { status: 'Solução pronta!' });
    
    // Atualizar o conteúdo da janela de solução e mostrar
    if (solutionWindow && !solutionWindow.isDestroyed()) {
      solutionWindow.webContents.send('solution-update', result);
      solutionWindow.show();
      solutionWindow.focus();
    }

    return result;
  } catch (error) {
    console.error('Erro ao processar captura:', error);
    mainWindow.webContents.send('status-update', { 
      status: 'Erro: ' + error.message,
      error: true
    });
    return null;
  } finally {
    isProcessing = false;
    updateTrayMenu();
  }
}

function extractProblemInfo(text) {
  // Remover espaços extras e quebras de linha
  text = text.replace(/\s+/g, ' ').trim();
  
  // Tentar encontrar o título e descrição do problema
  const titleMatch = text.match(/\d+\.\s+([^.]+)/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Tentar encontrar exemplos
  const examples = text.match(/Example \d+:[\s\S]+?(?=Example \d+:|$)/g) || [];
  
  // Tentar identificar a linguagem de programação
  let language = 'PHP'; // Linguagem padrão
  const languagePatterns = {
    'JavaScript': /JavaScript|JS|Node\.js/i,
    'Python': /Python|\.py/i,
    'Java': /Java\s|\.java/i,
    'C++': /C\+\+|CPP|\.cpp/i,
    'C#': /C#|\.cs/i,
    'Ruby': /Ruby|\.rb/i,
    'Go': /Go\s|Golang|\.go/i,
    'PHP': /PHP|\.php/i
  };

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      language = lang;
      break;
    }
  }
  
  return {
    title,
    description: text,
    examples,
    language
  };
}

// Função para inicializar o Gemini com a chave da API
function initializeGemini() {
  try {
    const apiKey = readApiKeyFromFile();
    if (!apiKey) {
      if (!configWindow) {
        createConfigWindow();
      }
      return null;
    }

    const genAI = new GoogleGenAI({
      apiKey: apiKey
    });

    return genAI.getGenerativeModel({ model: "gemini-pro" });
  } catch (error) {
    console.error('Erro ao inicializar Gemini:', error);
    if (!configWindow) {
      createConfigWindow();
    }
    return null;
  }
}

// Função para solicitar a chave da API
async function requestApiKey() {
  // Primeiro, tentar ler do arquivo
  const savedKey = readApiKeyFromFile();
  if (savedKey) {
    console.log('Usando chave API salva');
    return savedKey;
  }

  // Se não encontrar no arquivo, solicitar ao usuário
  return new Promise((resolve) => {
    const apiKeyWindow = new BrowserWindow({
      width: 400,
      height: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      parent: mainWindow,
      modal: true,
      minimizable: false,
      maximizable: false
    });

    apiKeyWindow.loadFile('apikey.html');

    ipcMain.once('submit-api-key', (event, apiKey) => {
      apiKeyWindow.close();
      resolve(apiKey);
    });

    apiKeyWindow.on('closed', () => {
      resolve(null);
    });
  });
}

async function generateSolution(problemInfo) {
  try {
    if (!geminiAI) {
      const apiKey = await requestApiKey();
      if (!apiKey || !initializeGemini(apiKey)) {
        return {
          solution: "Erro: Chave da API Gemini não configurada",
          explanation: "Por favor, configure uma chave de API válida para gerar soluções."
        };
      }
    }

    const prompt = `Você é um especialista em programação e resolução de problemas do tipo LeetCode.
Por favor, resolva o seguinte problema:

Título: ${problemInfo.title}
Descrição: ${problemInfo.description}

${problemInfo.examples ? 'Exemplos:\n' + problemInfo.examples.join('\n') : ''}

Por favor, forneça:
1. Uma solução eficiente em ${problemInfo.language}
2. Uma explicação detalhada da solução
3. A complexidade de tempo e espaço
4. Coloque um comentário no inicio do código para explicar o problema e a solução e coloque o nome do problema.
Use comentários para explicar partes importantes do código.
Separe a solução da explicação usando a palavra 'Explicação:' em uma nova linha.`;

    try {
      console.log('Iniciando chamada à API Gemini...');
      
      // Usar a nova API do Gemini
      const response = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      console.log('Resposta recebida da API');
      const text = response.text;
      console.log('Texto extraído com sucesso');
      
      // Separar a solução da explicação
      const parts = text.split('Explicação:');
      const solution = parts[0].trim();
      const explanation = parts.length > 1 ? parts[1].trim() : 'Explicação não disponível.';

      return {
        solution,
        explanation
      };
    } catch (apiError) {
      console.error('Erro detalhado da API:', apiError);
      
      // Verificar se é um erro de autenticação ou API inválida
      if (apiError.message.includes('401') || apiError.message.includes('403')) {
        return {
          solution: "Erro de autenticação com a API Gemini",
          explanation: `Erro específico: ${apiError.message}\n\nPor favor:\n1. Verifique se a chave API está correta\n2. Aguarde alguns segundos e tente novamente\n3. Se o erro persistir, crie uma nova chave em:\nhttps://makersuite.google.com/app/apikey`
        };
      }
      
      return {
        solution: "Erro ao gerar solução",
        explanation: `Ocorreu um erro: ${apiError.message}\n\nPor favor, verifique sua conexão com a internet e tente novamente.`
      };
    }
  } catch (error) {
    console.error('Erro geral:', error);
    return {
      solution: "Erro ao gerar solução",
      explanation: `Ocorreu um erro: ${error.message}\n\nPor favor, verifique sua conexão com a internet e tente novamente.`
    };
  }
}

// Adicionar handler para esconder a janela de solução
ipcMain.on('hide-solution', () => {
    console.log('Hide solution requested via IPC');
    if (solutionWindow && !solutionWindow.isDestroyed()) {
        solutionWindow.hide();
    }
});

app.whenReady().then(() => {
    try {
        createWindow();
        createTray();

        // Atalho para capturar tela
        globalShortcut.register('CommandOrControl+Shift+P', async () => {
            if (!isProcessing) {
                const result = await captureAndProcess();
                if (result) {
                    mainWindow.webContents.send('solution-update', result);
                }
            }
        });

        // Atalho para mostrar/ocultar solução
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

        // Novo atalho para mostrar/ocultar janela principal
        globalShortcut.register('Alt+P', () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        });

        // Atalho para sair
        globalShortcut.register('CommandOrControl+Shift+Q', () => {
            isRunning = false;
            app.quit();
        });

        mainWindow.show();
        mainWindow.focus();
    } catch (error) {
        console.error('Erro na inicialização:', error);
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