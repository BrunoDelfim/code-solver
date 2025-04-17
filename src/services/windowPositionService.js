const fs = require('fs');
const path = require('path');
const { PATHS } = require('../config/paths');

const WINDOW_POSITIONS_FILE = path.join(PATHS.USER_DATA, 'window_positions.json');

if (!fs.existsSync(PATHS.USER_DATA)) {
    console.log('Creating user data directory:', PATHS.USER_DATA);
    fs.mkdirSync(PATHS.USER_DATA, { recursive: true });
}

function loadWindowPositions() {
  try {
    if (fs.existsSync(WINDOW_POSITIONS_FILE)) {
      const data = fs.readFileSync(WINDOW_POSITIONS_FILE, 'utf8');
      const positions = JSON.parse(data);
      console.log('Loaded positions from file:', positions);
      return positions;
    }
    console.log('Positions file not found, returning empty object');
    return {};
  } catch (error) {
    console.error('Error loading positions:', error);
    return {};
  }
}

function saveWindowPositions(positions) {
  try {
    const data = JSON.stringify(positions, null, 2);
    fs.writeFileSync(WINDOW_POSITIONS_FILE, data);
    console.log('Saved positions to file:', positions);
  } catch (error) {
    console.error('Error saving positions:', error);
  }
}

function saveWindowPosition(windowName, position) {
  console.log(`Saving position for window ${windowName}:`, position);
  const positions = loadWindowPositions();
  positions[windowName] = position;
  saveWindowPositions(positions);
}

function getWindowPosition(windowName) {
  const positions = loadWindowPositions();
  const position = positions[windowName];
  console.log(`Loaded position for window ${windowName}:`, position);
  return position || null;
}

const initialPositions = loadWindowPositions();
console.log('Initial positions loaded:', initialPositions);

module.exports = {
  saveWindowPosition,
  getWindowPosition
}; 