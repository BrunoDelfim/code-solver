import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { PATHS } from '../config/paths';

interface WindowPosition {
    x: number;
    y: number;
}

interface WindowPositions {
    [key: string]: WindowPosition;
}

let windowPositions: WindowPositions = {};

function cleanMainWindowPosition(): void {
    if (windowPositions.main) {
        delete windowPositions.main;
        saveWindowPositions();
    }
}

export function loadWindowPositions(): void {
    try {
        const filePath = path.join(PATHS.USER_DATA, 'window_positions.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            windowPositions = JSON.parse(data);
            cleanMainWindowPosition();
            console.log('Window positions loaded:', windowPositions);
        }
    } catch (error) {
        console.error('Error loading window positions:', error);
    }
}

export function saveWindowPositions(): void {
    try {
        const filePath = path.join(PATHS.USER_DATA, 'window_positions.json');
        fs.writeFileSync(filePath, JSON.stringify(windowPositions, null, 2));
        console.log('Window positions saved:', windowPositions);
    } catch (error) {
        console.error('Error saving window positions:', error);
    }
}

export function saveWindowPosition(windowName: string, position: WindowPosition): void {
    if (windowName !== 'main') {
        windowPositions[windowName] = position;
        saveWindowPositions();
    }
}

export function getWindowPosition(windowName: string): WindowPosition | null {
    return windowName !== 'main' ? windowPositions[windowName] || null : null;
}

if (!fs.existsSync(PATHS.USER_DATA)) {
    fs.mkdirSync(PATHS.USER_DATA, { recursive: true });
}

app.whenReady().then(() => {
    loadWindowPositions();
}); 