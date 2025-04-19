const fs = require('fs');
const path = require('path');

const appDataPath = path.join(process.env.APPDATA, 'Code Solver');

if (fs.existsSync(appDataPath)) {
    const files = fs.readdirSync(appDataPath);
    
    files.forEach(file => {
        const filePath = path.join(appDataPath, file);
        try {
            fs.unlinkSync(filePath);
            console.log(`File removed: ${filePath}`);
        } catch (error) {
            console.error(`Error removing file ${filePath}:`, error);
        }
    });

    try {
        fs.rmdirSync(appDataPath);
        console.log(`Directory removed: ${appDataPath}`);
    } catch (error) {
        console.error(`Error removing directory ${appDataPath}:`, error);
    }
}

console.log('Pre-uninstallation completed successfully'); 