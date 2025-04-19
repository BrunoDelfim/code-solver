import fs from 'fs';
import path from 'path';

interface Config {
    language: string;
    theme: string;
    shortcuts: {
        capture: string;
        captureAlt: string;
        toggleSolution: string;
        toggleMain: string;
        process: string;
        quit: string;
    };
}

const configPath = path.join(process.env.APPDATA || '', 'Code Solver', 'config.json');
if (!fs.existsSync(configPath)) {
    const defaultConfig: Config = {
        language: 'en-US',
        theme: 'light',
        shortcuts: {
            capture: 'CommandOrControl+Shift+P',
            captureAlt: 'CommandOrControl+Alt+P',
            toggleSolution: 'Alt+S',
            toggleMain: 'Alt+P',
            process: 'CommandOrControl+Enter',
            quit: 'CommandOrControl+Shift+Q'
        }
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
}

console.log('Post-installation completed successfully'); 