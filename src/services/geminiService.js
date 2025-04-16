const { GoogleGenAI } = require('@google/genai');
const { readApiKeyFromFile, saveApiKeyToFile } = require('./storageService');

let geminiAI = null;

function initializeGemini(apiKey) {
  try {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      throw new Error('API key is empty');
    }
    
    if (!saveApiKeyToFile(cleanApiKey)) {
      throw new Error('Erro ao salvar chave API');
    }

    console.log('Initializing Gemini with key:', cleanApiKey);
    geminiAI = new GoogleGenAI({ apiKey: cleanApiKey });
    return true;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
}

async function generateSolution(text) {
  try {
    if (!geminiAI) {
      const apiKey = readApiKeyFromFile();
      if (!apiKey || !initializeGemini(apiKey)) {
        return {
          solution: "Error: Gemini API key not configured",
          explanation: "Please configure a valid API key to generate solutions."
        };
      }
    }

    const prompt = `You are a programming expert and problem solver of the type Code.
    Analyze the following text and determine if it is a programming problem:

    ${text}

    If it is a programming problem:
    1. Analyze the text and identify which programming language should be used. If there is no clear indication in the text, use PHP.
    2. Provide an efficient solution in the identified language
    3. Explain the solution in detail in English
    4. Include the time and space complexity
    5. Put a comment in English at the beginning of the code explaining the problem and the solution
    6. Use comments in English to explain important parts of the code
    7. Separate the solution from the explanation using the word 'Explanation:' on a new line
    8. The only English texts should be the problem name, function name, and code keywords
    9. At the beginning of the solution, indicate "Language chosen: [language name]"

    If it is NOT a programming problem:
    1. Respond "It is not a programming problem"
    2. Explain briefly why in English`;

    try {
      console.log('Starting Gemini API call...');
      
      const response = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      console.log('Response received from API');
      const text = response.text;
      console.log('Text extracted successfully');
      
      const parts = text.split('Explanation:');
      const solution = parts[0].trim();
      const explanation = parts.length > 1 ? parts[1].trim() : 'Explanation not available.';

      return {
        solution,
        explanation
      };
    } catch (apiError) {
      console.error('Detailed API error:', apiError);
      
      if (apiError.message.includes('401') || apiError.message.includes('403')) {
        return {
          solution: "Authentication error with Gemini API",
          explanation: `Specific error: ${apiError.message}\n\nPlease:\n1. Check if the API key is correct\n2. Wait a few seconds and try again\n3. If the error persists, create a new key at:\nhttps://makersuite.google.com/app/apikey`
        };
      }
      
      return {
        solution: "Error generating solution",
        explanation: `Specific API error: ${apiError.message}\n\nPlease:\n1. Wait a few seconds and try again\n2. If the error persists, create a new key`
      };
    }
  } catch (error) {
    console.error('General error:', error);
    return {
      solution: "Error generating solution",
      explanation: `An error occurred: ${error.message}\n\nPlease check your internet connection and try again.`
    };
  }
}

module.exports = {
  initializeGemini,
  generateSolution
};
