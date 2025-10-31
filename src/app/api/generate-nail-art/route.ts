import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimiter';
import { validateAIGeneration } from '@/lib/inputValidation';

export async function POST(request: NextRequest) {
  try {
    // Check for API key at runtime, not build time
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not set.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Note: Removed admin authentication requirement for public virtual try-on
    // The rate limiting will handle abuse prevention

    // Apply strict rate limiting for AI generation (expensive operations)
    const rateLimit = checkRateLimit(request, rateLimiters.aiGeneration);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: rateLimit.error },
        { status: 429 }
      );
      Object.entries(rateLimit.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const body = await request.json();
    
    // Validate AI generation request
    const validation = validateAIGeneration(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.errors },
        { status: 400 }
      );
    }

    const { base64ImageData, mimeType, prompt } = validation.sanitizedData!;

    // Extract base64 data from data URL if needed
    const cleanBase64Data = base64ImageData.includes(',') 
      ? base64ImageData.split(',')[1] 
      : base64ImageData;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64Data,
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
          return NextResponse.json({
            success: true,
            imageData: part.inlineData.data
          });
        }
      }
    }

    return NextResponse.json(
      { error: 'No image generated' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}


