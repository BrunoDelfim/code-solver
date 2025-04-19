import { BrowserWindow } from 'electron';
import path from 'path';
import { PATHS } from '../config/paths';
import { saveWindowPosition, getWindowPosition } from '../services/windowPositionService';

interface StatusUpdate {
  total: number;
  processing?: string;
  hint?: string;
}

interface WindowPosition {
  x: number;
  y: number;
}

let captureStatusWindow: BrowserWindow | null = null;

function createCaptureStatusWindow(): BrowserWindow | null {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    return captureStatusWindow;
  }

  const savedPosition = getWindowPosition('status');
  const defaultPosition: WindowPosition = { x: 10, y: 10 };

  captureStatusWindow = new BrowserWindow({
    width: 300,
    height: 150,
    x: savedPosition?.x || defaultPosition.x,
    y: savedPosition?.y || defaultPosition.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  captureStatusWindow.setContentProtection(true);
  captureStatusWindow.setVisibleOnAllWorkspaces(true);
  captureStatusWindow.setAlwaysOnTop(true, 'screen-saver');
  captureStatusWindow.setFocusable(false);
  captureStatusWindow.loadFile(path.join(PATHS.PUBLIC, 'capture-status.html'));

  captureStatusWindow.on('moved', () => {
    if (captureStatusWindow) {
      const position = captureStatusWindow.getPosition();
      saveWindowPosition('status', { x: position[0], y: position[1] });
    }
  });

  captureStatusWindow.on('closed', () => {
    captureStatusWindow = null;
  });

  return captureStatusWindow;
}

function updateCaptureStatus(status: StatusUpdate): void {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    captureStatusWindow.webContents.send('capture-update', status);
  }
}

function showCaptureStatus(): void {
  const window = createCaptureStatusWindow();
  if (window) {
    window.show();
  }
}

function hideCaptureStatus(): void {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    captureStatusWindow.hide();
  }
}

function destroyCaptureStatus(): void {
  if (captureStatusWindow && !captureStatusWindow.isDestroyed()) {
    captureStatusWindow.destroy();
    captureStatusWindow = null;
  }
}

function isStatusWindowVisible(): boolean {
  return captureStatusWindow !== null && 
         !captureStatusWindow.isDestroyed() && 
         captureStatusWindow.isVisible();
}

export {
  createCaptureStatusWindow,
  updateCaptureStatus,
  showCaptureStatus,
  hideCaptureStatus,
  destroyCaptureStatus,
  isStatusWindowVisible
}; 