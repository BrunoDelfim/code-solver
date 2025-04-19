import { readApiKeyFromFile } from './storageService';
import { initializeGemini } from './geminiService';

export async function loadApiKey(): Promise<string | null> {
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