
import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export async function applyNailArt(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string | null> {
  try {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Apply this nail art design to the nails in the image: ${prompt}. Only change the nails.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the image part in the response
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data || null;
        }
      }
    }

    console.warn("No image part found in the Gemini response.");
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Rethrow the error to be handled by the calling component
    throw error;
  }
}
