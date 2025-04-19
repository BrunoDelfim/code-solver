import fs from 'fs';
import path from 'path';
import { PATHS } from '../config/paths';

export function readApiKeyFromFile(): string | null {
  try {
    if (fs.existsSync(PATHS.API_KEY_FILE)) {
      const apiKey = fs.readFileSync(PATHS.API_KEY_FILE, 'utf8').trim();
      if (apiKey) {
        console.log('API key found in file');
        return apiKey;
      }
    }
  } catch (error) {
    console.error('Error reading API key from file:', error);
  }
  return null;
}

export function saveApiKeyToFile(apiKey: string): boolean {
  try {
    const dir = path.dirname(PATHS.API_KEY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PATHS.API_KEY_FILE, apiKey.trim());
    console.log('API key saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
} 