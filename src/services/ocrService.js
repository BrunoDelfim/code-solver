const { createWorker } = require('tesseract.js');
const { desktopCapturer } = require('electron');
const { showCaptureStatus, updateCaptureStatus, hideCaptureStatus } = require('../windows/captureStatusWindow');

let isProcessing = false;
let capturedTexts = [];

async function captureAndProcess() {
  if (isProcessing) return null;
  
  try {
    isProcessing = true;
    showCaptureStatus();
    updateCaptureStatus({
      total: capturedTexts.length,
      processing: 'Capturing...',
      hint: 'Please wait'
    });
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (!sources || sources.length === 0) {
      throw new Error('No capture sources found');
    }

    updateCaptureStatus({
      total: capturedTexts.length,
      processing: 'Extracting text...',
      hint: 'Please wait'
    });

    const screenshot = sources[0].thumbnail.toDataURL();
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const worker = await createWorker('eng+por');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    capturedTexts.push(text);
    
    updateCaptureStatus({
      total: capturedTexts.length,
      processing: 'Ready to process',
      hint: 'Ctrl+Enter to process'
    });

    return text;

  } catch (error) {
    console.error('Error in OCR process:', error);
    updateCaptureStatus({
      total: capturedTexts.length,
      processing: 'Capture error!',
      hint: 'Please try again'
    });
    return null;
  } finally {
    isProcessing = false;
  }
}

function getCapturedTexts() {
  return capturedTexts;
}

function clearCapturedTexts() {
  capturedTexts = [];
  updateCaptureStatus({
    total: 0,
    processing: 'Ready to capture',
    hint: 'Press Alt+S to capture'
  });
}

function getIsProcessing() {
  return isProcessing;
}

function resetCaptures() {
  capturedTexts = [];
}

module.exports = {
  captureAndProcess,
  getCapturedTexts,
  clearCapturedTexts,
  getIsProcessing,
  resetCaptures
};
