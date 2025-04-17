const fs = require('fs');
const path = require('path');

const appDataPath = path.join(process.env.APPDATA, 'Code Solver');

if (fs.existsSync(appDataPath)) {
    // Lista todos os arquivos no diretório
    const files = fs.readdirSync(appDataPath);
    
    // Remove cada arquivo
    files.forEach(file => {
        const filePath = path.join(appDataPath, file);
        try {
            fs.unlinkSync(filePath);
            console.log(`Removed file: ${filePath}`);
        } catch (error) {
            console.error(`Error removing file ${filePath}:`, error);
        }
    });

    // Remove o diretório
    try {
        fs.rmdirSync(appDataPath);
        console.log(`Removed directory: ${appDataPath}`);
    } catch (error) {
        console.error(`Error removing directory ${appDataPath}:`, error);
    }
}

console.log('Pre-uninstallation completed successfully!'); 