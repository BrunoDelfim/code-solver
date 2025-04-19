import { createWorker } from 'tesseract.js';
import { desktopCapturer } from 'electron';
import { showCaptureStatus, updateCaptureStatus, hideCaptureStatus } from '../windows/captureStatusWindow';

interface CaptureStatus {
  total: number;
  processing: string;
  hint: string;
}

let isProcessing = false;
let capturedTexts: string[] = [];

export async function captureAndProcess(): Promise<string | null> {
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

export function getCapturedTexts(): string[] {
  return capturedTexts;
}

export function clearCapturedTexts(): void {
  capturedTexts = [];
  updateCaptureStatus({
    total: 0,
    processing: 'Ready to capture',
    hint: 'Press Ctrl+Shift+P or Ctrl+Alt+P to capture'
  });
}

export function getIsProcessing(): boolean {
  return isProcessing;
}

export function resetCaptures(): void {
  capturedTexts = [];
}

export async function processTexts(): Promise<string | null> {
  if (capturedTexts.length === 0) return null;
  
  try {
    isProcessing = true;
    updateCaptureStatus({
      total: capturedTexts.length,
      processing: 'Processing...',
      hint: 'Please wait'
    });

    const combinedText = capturedTexts.join('\n\n');
    clearCapturedTexts();
    hideCaptureStatus();
    
    return combinedText;
  } catch (error) {
    console.error('Error in processTexts:', error);
    hideCaptureStatus();
    return null;
  } finally {
    isProcessing = false;
  }
} 