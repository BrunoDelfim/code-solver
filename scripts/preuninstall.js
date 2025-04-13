const fs = require('fs');
const path = require('path');

// Remover arquivo de configuração
const configPath = path.join(process.env.APPDATA, 'LeetCode Solver', 'config.json');
if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
}

console.log('Pré-desinstalação concluída com sucesso!'); 