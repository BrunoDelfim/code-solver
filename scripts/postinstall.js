const fs = require('fs');
const path = require('path');

// Criar arquivo de configuração inicial
const configPath = path.join(process.env.APPDATA, 'LeetCode Solver', 'config.json');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        language: 'pt-BR',
        theme: 'light',
        shortcuts: {
            capture: 'Ctrl+Shift+P',
            toggle: 'Ctrl+Shift+M',
            quit: 'Ctrl+Shift+Q'
        }
    }, null, 2));
}

console.log('Pós-instalação concluída com sucesso!'); 