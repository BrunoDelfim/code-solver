import { ipcRenderer } from 'electron';

interface SolutionDetails {
    title: string;
    language: string;
    problem: string;
    code: string;
    explanation: string;
    testing: string;
}

interface SolutionData {
    details: SolutionDetails;
}

function hideSolution(): void {
    ipcRenderer.send('hide-solution');
}

ipcRenderer.on('update-solution', (_event: Electron.IpcRendererEvent, data: SolutionData) => {
    console.log('Receiving solution data:', data);
    
    const { details } = data;
    
    const titleElement = document.getElementById('solution-title');
    const languageElement = document.getElementById('solution-language');
    const problemElement = document.getElementById('solution-problem');
    const codeElement = document.getElementById('solution-code');
    const explanationElement = document.getElementById('solution-explanation');
    const testingElement = document.getElementById('solution-testing');
    
    if (titleElement) titleElement.textContent = details.title || 'No title available';
    if (languageElement) languageElement.textContent = details.language || 'No language specified';
    if (problemElement) problemElement.textContent = details.problem || 'No problem description available';
    if (codeElement) codeElement.textContent = details.code || 'No code available';
    if (explanationElement) explanationElement.textContent = details.explanation || 'No explanation available';
    if (testingElement) testingElement.textContent = details.testing || 'No testing instructions available';
});

(window as any).hideSolution = hideSolution; 