/// <reference lib="dom" />

import { ipcRenderer } from 'electron';

const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
const errorMessage = document.getElementById('error-message') as HTMLDivElement;

function validateApiKey(key: string): boolean {
    return key.trim().length > 0;
}

function showError(message: string): void {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    apiKeyInput.classList.add('invalid');
}

function hideError(): void {
    errorMessage.style.display = 'none';
    apiKeyInput.classList.remove('invalid');
}

function handleSubmit(): void {
    const apiKey = apiKeyInput.value.trim();
    if (validateApiKey(apiKey)) {
        ipcRenderer.send('submit-api-key', apiKey);
    } else {
        showError('Please enter a valid API Key');
    }
}

submitButton.addEventListener('click', handleSubmit);

apiKeyInput.addEventListener('input', () => {
    hideError();
});

apiKeyInput.addEventListener('keypress', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        handleSubmit();
    }
});

ipcRenderer.on('api-key-error', (_, message: string) => {
    showError(message);
});

ipcRenderer.on('load-saved-key', (_, savedKey: string) => {
    apiKeyInput.value = savedKey;
});

(window as any).handleSubmit = handleSubmit; 