import { estimatesAPI } from './api';

export const generateMaterialEstimate = async (materialInput) => {
  try {
    // This will be integrated with the Gemini AI endpoint
    const response = await estimatesAPI.post('/ai/material-estimate', {
      ...materialInput,
      timestamp: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error('Error generating material estimate:', error);
    throw error;
  }
};