import { ipcRenderer } from 'electron';

interface CaptureStatus {
    count: number;
    processing: boolean;
}

ipcRenderer.on('update-capture-status', (_event: Electron.IpcRendererEvent, status: CaptureStatus) => {
    console.log('Updating capture status:', status);
    
    const countElement = document.getElementById('capture-count');
    const processingElement = document.getElementById('processing-status');
    
    if (countElement) {
        countElement.textContent = `Captures: ${status.count}`;
    }
    
    if (processingElement) {
        processingElement.textContent = status.processing ? 'Processing...' : 'Ready';
        processingElement.style.color = status.processing ? '#ffa500' : '#00ff00';
    }
}); 