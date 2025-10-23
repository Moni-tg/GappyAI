// To run this code you need to install the following dependencies:
// npm install @google/generative-ai mime
// npm install -D @types/node

import {
  GoogleGenerativeAI,
} from '@google/generative-ai';
import Constants from 'expo-constants';
import { detectLanguage, formatContentForAI, searchContentLibrary } from '../services/contentLibrary';

export async function generateAIResponse(userInput: string): Promise<string> {
  try {
    const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_GEMINI_API_KEY not found in environment variables');
    }

    if (!userInput || userInput.trim().length === 0) {
      throw new Error('User input cannot be empty');
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash', // Using the latest Gemini model version
    });

    // Detect user's language preference
    const detectedLanguage = detectLanguage(userInput);
    console.log('Detected language:', detectedLanguage);

    // Search for relevant content from the custom library
    const relevantContent = searchContentLibrary(userInput, 3);
    const contextContent = formatContentForAI(relevantContent, detectedLanguage);

    // Create system instructions with language support
    let systemInstructions = `You are a helpful AI assistant for Gappy AI named Gappy, a smart aquarium automation system.

IMPORTANT: Respond in the same language as the user's question.

RESPONSE STYLE REQUIREMENTS:
1. Keep responses SIMPLE and PRECISE
2. Be STRAIGHT TO THE POINT - no unnecessary words
3. Use SHORT sentences
4. Focus on KEY information only
5. Avoid fluff and filler words
6. Be direct and concise

Your responses should be:
1. Helpful and accurate about Gappy AI products and services
2. Use relevant context information when available
3. Be conversational but BRIEF
4. Admit when you don't know something
5. Keep responses concise but informative

KNOWLEDGE SCOPE:
- PRIORITIZE Gappy AI products, features, setup, and troubleshooting
- For fish/aquarium questions: Use both Gappy AI knowledge AND general aquarium knowledge
- Answer fish-related questions even if not in knowledge base (water quality, fish care, aquarium maintenance, etc.)
- Stay focused on aquarium and fish farming topics
- If question is unrelated to fish/aquarium/aquaculture, politely redirect to Gappy AI topics

If you use information from the provided context, make it feel natural and not forced.

Available languages: English, Sinhala (සිංහල), Tamil (தமிழ்)`;

    if (detectedLanguage === 'sinhala') {
      systemInstructions += `

Respond in SINHALA (සිංහල) using proper Sinhala script and grammar.
Keep responses SIMPLE and DIRECT in Sinhala.
You can answer general fish and aquarium questions in Sinhala.`;
    } else if (detectedLanguage === 'tamil') {
      systemInstructions += `

Respond in TAMIL (தமிழ்) using proper Tamil script and grammar.
Keep responses SIMPLE and DIRECT in Tamil.
You can answer general fish and aquarium questions in Tamil.`;
    } else {
      systemInstructions += `

Respond in ENGLISH using clear and professional language.
Keep responses SIMPLE and DIRECT in English.
You can answer general fish and aquarium questions in English.`;
    }

    // Enhanced prompt with custom content
    const enhancedUserInput = `${systemInstructions}${contextContent}\n\nUser Question: ${userInput}\n\nPlease provide a helpful response in the appropriate language:`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: enhancedUserInput,
          },
        ],
      },
    ];

    console.log('Sending request to Gemini API...');
    console.log('Relevant content found:', relevantContent.length, 'items');
    console.log('Detected language:', detectedLanguage);

    const response = await model.generateContent({
      contents,
    });

    console.log('Received response from Gemini API:', response);

    let fullResponse = '';
    if (response.response && response.response.text) {
      fullResponse = response.response.text();
    } else if ((response as any).candidates && (response as any).candidates[0]) {
      // Fallback for different response format
      const candidate = (response as any).candidates[0];
      if (candidate.content && candidate.content.parts) {
        fullResponse = candidate.content.parts
          .map((part: any) => part.text || '')
          .join('');
      } else if (candidate.text) {
        fullResponse = candidate.text;
      }
    } else {
      console.error('Gemini API response:', response);
      throw new Error('Unable to parse Gemini API response');
    }

    if (!fullResponse || fullResponse.trim().length === 0) {
      throw new Error('Received empty response from Gemini API');
    }

    return fullResponse;
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling Gemini API');
  }
}
