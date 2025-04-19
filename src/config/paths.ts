import * as path from 'path';
import { app } from 'electron';

const isDev = process.env.NODE_ENV === 'development';

export const PATHS = {
  PUBLIC: isDev ? path.join(__dirname, '..', '..', 'public') : path.join(app.getAppPath(), 'public'),
  ASSETS: isDev ? path.join(__dirname, '..', '..', 'assets') : path.join(app.getAppPath(), 'assets'),
  USER_DATA: path.join(process.env.APPDATA || '', 'Code Solver'),
  API_KEY_FILE: path.join(process.env.APPDATA || '', 'Code Solver', 'gemini_api_key.txt')
}; 