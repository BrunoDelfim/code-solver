import { Tray, Menu, app, MenuItemConstructorOptions } from 'electron';
import * as path from 'path';
import { PATHS } from '../config/paths';
import { getMainWindow, setIsQuitting } from '../windows/mainWindow';
import { createApiKeyWindow } from '../windows/apiKeyWindow';

let tray: Tray | null = null;

export function createTray(): Tray | null {
    try {
        console.log('Creating tray menu...');
        const iconPath = path.join(PATHS.ASSETS, 'icon.ico');
        tray = new Tray(iconPath);
        tray.setToolTip('Code Solver');

        const template: MenuItemConstructorOptions[] = [
            { 
                label: 'Show', 
                click: () => {
                    console.log('Show clicked');
                    const mainWindow = getMainWindow();
                    if (mainWindow) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            },
            {
                label: 'API Key',
                click: () => {
                    console.log('API Key clicked');
                    createApiKeyWindow();
                }
            },
            { 
                type: 'separator' 
            },
            { 
                label: 'Quit', 
                click: () => {
                    console.log('Quit clicked');
                    setIsQuitting(true);
                    app.quit();
                }
            }
        ];

        console.log('Menu template:', template);
        const contextMenu = Menu.buildFromTemplate(template);
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            const mainWindow = getMainWindow();
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        });

        tray.on('right-click', () => {
            tray?.popUpContextMenu();
        });

        return tray;
    } catch (error) {
        console.error('Error creating tray:', error);
        return null;
    }
}

export function destroyTray(): void {
    if (tray) {
        tray.destroy();
        tray = null;
    }
} 