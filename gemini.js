const { GoogleGenerativeAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

let apiKey = '';
const API_KEY_FILE = path.join(process.env.APPDATA, 'LeetCode Solver', 'gemini_api_key.txt');

// Função para carregar a chave da API do arquivo
function loadApiKey() {
    try {
        if (fs.existsSync(API_KEY_FILE)) {
            apiKey = fs.readFileSync(API_KEY_FILE, 'utf8').trim();
            return true;
        }
    } catch (error) {
        console.error('Erro ao carregar a chave da API:', error);
    }
    return false;
}

// Função para salvar a chave da API em um arquivo
function saveApiKey(key) {
    try {
        const dir = path.dirname(API_KEY_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(API_KEY_FILE, key);
        apiKey = key;
        return true;
    } catch (error) {
        console.error('Erro ao salvar a chave da API:', error);
        return false;
    }
}

// Função para analisar o código e gerar uma solução
async function analyzeProblem(problemText) {
    if (!apiKey) {
        if (!loadApiKey()) {
            throw new Error('Chave da API do Gemini não configurada');
        }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analise o seguinte problema do LeetCode e forneça uma solução detalhada:

${problemText}

Por favor, forneça:
1. Uma explicação da solução
2. A complexidade de tempo e espaço
3. O código da solução em JavaScript
4. Exemplos de casos de teste`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Erro ao gerar solução:', error);
        throw new Error('Não foi possível gerar uma solução. Verifique sua chave da API e conexão com a internet.');
    }
}

module.exports = {
    saveApiKey,
    loadApiKey,
    analyzeProblem
}; 