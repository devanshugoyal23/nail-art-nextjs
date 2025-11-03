import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimiter';
import { validateAIGeneration } from '@/lib/inputValidation';

// Force-load .env.local to ensure we only use the key from the file,
// even if a system-level env var is present.
dotenv.config({ path: '.env.local', override: true });
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

type TryOnRequestBody = {
  base64ImageData?: string;
  mimeType?: string;
  prompt?: string;
};

export async function POST(request: NextRequest) {
  let body: TryOnRequestBody | null = null;
  
  try {
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

    body = await request.json();
    
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

    // Note: gemini-2.5-flash-image is being used for multimodal image generation
    // This is an experimental feature for image editing/generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: cleanBase64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Apply this nail art design to the nails in the image: ${prompt}. Only change the nails. Keep the hand and background exactly the same.`,
            },
          ],
        }
      ],
      config: {
        responseModalities: [Modality.IMAGE],
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
      { error: 'No image generated in response' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    // Log detailed error information
    console.error('Error details:', {
      message: errorMessage,
      details: errorDetails,
      body: body ? { ...body, base64ImageData: body.base64ImageData?.substring(0, 50) + '...' } : null
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}


