import { ipcRenderer } from 'electron';

interface MainWindowState {
    isVisible: boolean;
    hasApiKey: boolean;
}

ipcRenderer.on('update-main-window-state', (_event: Electron.IpcRendererEvent, state: MainWindowState) => {
    console.log('Updating main window state:', state);
    
    const apiKeyStatus = document.getElementById('api-key-status');
    if (apiKeyStatus) {
        apiKeyStatus.textContent = state.hasApiKey ? 'API Key: Configured' : 'API Key: Not Configured';
        apiKeyStatus.style.color = state.hasApiKey ? '#00ff00' : '#ff0000';
    }
});

function toggleMainWindow(): void {
    ipcRenderer.send('toggle-main-window');
}

function captureScreen(): void {
    ipcRenderer.send('capture-screen');
}

(window as any).toggleMainWindow = toggleMainWindow;
(window as any).captureScreen = captureScreen; 