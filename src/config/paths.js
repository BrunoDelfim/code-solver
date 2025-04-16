const path = require('path');

const PATHS = {
  PUBLIC: path.join(__dirname, '..', '..', 'public'),
  ASSETS: path.join(__dirname, '..', '..', 'assets'),
  API_KEY_FILE: path.join(process.env.APPDATA, 'Code Solver', 'gemini_api_key.txt')
};

module.exports = { PATHS }; 