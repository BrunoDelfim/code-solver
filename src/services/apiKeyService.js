const { readApiKeyFromFile } = require('./storageService');
const { initializeGemini } = require('./geminiService');

async function loadApiKey() {
    try {
        const apiKey = readApiKeyFromFile();
        if (apiKey) {
            const isValid = await initializeGemini(apiKey);
            if (isValid) {
                return apiKey;
            }
        }
        return null;
    } catch (error) {
        console.error('Error loading API key:', error);
        return null;
    }
}

module.exports = {
    loadApiKey
}; 