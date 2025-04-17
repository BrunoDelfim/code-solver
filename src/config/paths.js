const path = require('path');

const PATHS = {
  PUBLIC: path.join(process.resourcesPath, 'public'),
  ASSETS: path.join(process.resourcesPath, 'assets'),
  USER_DATA: path.join(process.env.APPDATA, 'Code Solver'),
  API_KEY_FILE: path.join(process.env.APPDATA, 'Code Solver', 'gemini_api_key.txt')
};

module.exports = { PATHS }; 