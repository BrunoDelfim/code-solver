const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.APPDATA, 'Code Solver', 'config.json');
if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
}

console.log('Pre-uninstallation completed successfully!'); 