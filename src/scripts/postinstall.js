const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.APPDATA, 'Code Solver', 'config.json');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        language: 'en-US',
        theme: 'light',
        shortcuts: {
            capture: 'Ctrl+Shift+P',
            toggle: 'Ctrl+Shift+M',
            quit: 'Ctrl+Shift+Q'
        }
    }, null, 2));
}

console.log('Post-installation completed successfully'); 