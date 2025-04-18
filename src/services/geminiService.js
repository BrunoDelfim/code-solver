const { GoogleGenAI } = require('@google/genai');
const { readApiKeyFromFile, saveApiKeyToFile } = require('./storageService');

let geminiAI = null;

async function initializeGemini(apiKey) {
  try {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      throw new Error('API key is empty');
    }

    console.log('Initializing Gemini with key:', cleanApiKey);
    geminiAI = new GoogleGenAI({ apiKey: cleanApiKey });

    try {
      await geminiAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Test"
      });
      
      if (!saveApiKeyToFile(cleanApiKey)) {
        throw new Error('Error saving API key');
      }
      
      return true;
    } catch (apiError) {
      console.error('API validation error:', apiError);
      if (apiError.message.includes('401') || apiError.message.includes('403')) {
        throw new Error('Invalid API key');
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
}

async function generateSolution(text) {
  try {
    if (!geminiAI) {
      const apiKey = readApiKeyFromFile();
      if (!apiKey) {
        return {
          details: {
            title: 'Error',
            language: 'Error',
            problem: 'Error',
            code: 'API key not configured',
            explanation: 'Please configure a valid API key to generate solutions.',
            testing: 'Try again'
          }
        };
      }
      if (!await initializeGemini(apiKey)) {
        return {
          details: {
            title: 'Error',
            language: 'Error',
            problem: 'Error',
            code: 'Invalid API key',
            explanation: 'Please configure a valid API key to generate solutions.',
            testing: 'Try again'
          }
        };
      }
    }

    // Array de prompts sequenciais
    const prompts = [
      {
        name: 'title',
        prompt: `Analyze the following text and extract or generate a title for the programming problem. If no title exists, generate a descriptive one based on the problem:

        ${text}

        Respond only with the title, nothing else.
        This text will be displayed in software, so do not use texts or terms as if you were talking to someone, but rather just descriptive terms of the software interface.
        Format the response so that it is easier for the user to understand, i.e., break lines, make lists, etc.`
      },
      {
        name: 'language',
        prompt: `Analyze the following text and identify the programming language. If no language is specified, respond with "PHP":

        ${text}

        Respond only with the language name, nothing else.
        This text will be displayed in software, so do not use texts or terms as if you were talking to someone, but rather just descriptive terms of the software interface.
        Format the response so that it is easier for the user to understand, i.e., break lines, make lists, etc.`
      },
      {
        name: 'problem',
        prompt: `Explain the programming problem in the following text:

        ${text}

        Respond with a clear explanation of the problem.
        This text will be displayed in software, so do not use texts or terms as if you were talking to someone, but rather just descriptive terms of the software interface.
        Format the response so that it is easier for the user to understand, i.e., break lines, make lists, etc.`
      },
      {
        name: 'code',
        prompt: `Provide a solution in the identified language for the following problem:

        ${text}

        Respond with the complete code solution.
        Only code and comments of the code, no other text and explanation.`
      },
      {
        name: 'explanation',
        prompt: `Explain how the code solves the problem and why it works:

        ${text}

        Respond with a detailed explanation of the solution.
        This text will be displayed in software, so do not use texts or terms as if you were talking to someone, but rather just descriptive terms of the software interface.
        Format the response so that it is easier for the user to understand, i.e., break lines, make lists, etc.
        Not repeat the code, only explain the solution.`
      },
      {
        name: 'testing',
        prompt: `Explain how to test and run the code solution:

        ${text}

        Respond with testing instructions.
        This text will be displayed in software, so do not use texts or terms as if you were talking to someone, but rather just descriptive terms of the software interface.
        Format the response so that it is easier for the user to understand, i.e., break lines, make lists, etc.
        Not repeat the code, only explain the solution.
        Not tiltles, only instructions.`
      }
    ];

    console.log('Starting sequential Gemini API calls...');
    
    const responses = {};
    
    for (const prompt of prompts) {
      try {
        console.log(`Calling API for ${prompt.name}...`);
        const response = await geminiAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt.prompt
        });
        
        console.log(`Response received for ${prompt.name}`);
        
        let responseText = response.candidates[0].content.parts[0].text;
        
        responseText = responseText.trim();
        
        if (prompt.name === 'code' || prompt.name === 'explanation') {
          responseText = responseText.replace(/```\w*\s*/g, '').replace(/```/g, '');
        }
        
        console.log(`${prompt.name} text:`, responseText);
        responses[prompt.name] = responseText;

        const partialResult = {
          details: {
            ...responses,
            [prompt.name]: responseText
          }
        };
        
        const { createSolutionWindow } = require('../windows/solutionWindow');
        const solutionWindow = createSolutionWindow();
        if (solutionWindow) {
          solutionWindow.webContents.send('update-solution', partialResult);
        }
      } catch (error) {
        console.error(`Error in ${prompt.name} API call:`, error);
        console.error('Error details:', error.stack);
        responses[prompt.name] = `Error generating ${prompt.name}`;
      }
    }

    console.log('All API calls completed');
    console.log('Final responses:', JSON.stringify(responses, null, 2));
    
    const result = {
      details: {
        title: responses.title || 'No title available',
        language: responses.language || 'No language specified',
        problem: responses.problem || 'No problem description available',
        code: responses.code || 'No code available',
        explanation: responses.explanation || 'No explanation available',
        testing: responses.testing || 'No testing instructions available'
      }
    };
    
    Object.keys(result.details).forEach(key => {
      if (result.details[key] === undefined) {
        result.details[key] = `No ${key} available`;
      }
    });
    
    console.log('Returning result:', JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('General error:', error);
    return {
      details: {
        title: 'Error',
        language: 'Error',
        problem: 'Error',
        code: 'Error generating solution',
        explanation: `An error occurred: ${error.message}\n\nPlease check your internet connection and try again.`,
        testing: 'Try again'
      }
    };
  }
}

module.exports = {
  initializeGemini,
  generateSolution
};
