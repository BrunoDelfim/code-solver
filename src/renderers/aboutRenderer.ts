import { ipcRenderer } from 'electron';

interface AppInfo {
    version: string;
    electronVersion: string;
    nodeVersion: string;
    chromeVersion: string;
}

ipcRenderer.on('update-app-info', (_event: Electron.IpcRendererEvent, info: AppInfo) => {
    console.log('Updating application information:', info);
    
    const versionElement = document.getElementById('app-version');
    const electronVersionElement = document.getElementById('electron-version');
    const nodeVersionElement = document.getElementById('node-version');
    const chromeVersionElement = document.getElementById('chrome-version');
    
    if (versionElement) versionElement.textContent = info.version;
    if (electronVersionElement) electronVersionElement.textContent = info.electronVersion;
    if (nodeVersionElement) nodeVersionElement.textContent = info.nodeVersion;
    if (chromeVersionElement) chromeVersionElement.textContent = info.chromeVersion;
}); 