# Try-On Feature API Flow

## 🔄 Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  /try-on Page (TryOnContent.tsx)                           │ │
│  │                                                             │ │
│  │  1. User selects nail art design                           │ │
│  │  2. User uploads hand photo                                │ │
│  │  3. User clicks "Generate"                                 │ │
│  │                                                             │ │
│  │  handleGenerate() {                                        │ │
│  │    fetch('/api/generate-nail-art', {                      │ │
│  │      method: 'POST',                                       │ │
│  │      body: JSON.stringify({                               │ │
│  │        base64ImageData: "data:image/jpeg;base64,/9j...",  │ │
│  │        mimeType: "image/jpeg",                            │ │
│  │        prompt: "French manicure with gold accents"        │ │
│  │      })                                                    │ │
│  │    })                                                      │ │
│  │  }                                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTE                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  /api/generate-nail-art/route.ts                           │ │
│  │                                                             │ │
│  │  export async function POST(request: NextRequest) {        │ │
│  │    let body: any = null; // ✅ Fixed: Accessible in catch  │ │
│  │                                                             │ │
│  │    try {                                                   │ │
│  │      // 1. Rate limiting check                            │ │
│  │      checkRateLimit(request, rateLimiters.aiGeneration)   │ │
│  │                                                             │ │
│  │      // 2. Parse request body                             │ │
│  │      body = await request.json()                          │ │
│  │                                                             │ │
│  │      // 3. Validate input                                 │ │
│  │      const validation = validateAIGeneration(body)        │ │
│  │                                                             │ │
│  │      // 4. Extract and clean base64 data                  │ │
│  │      const cleanBase64Data = base64ImageData.split(',')[1]│ │
│  │                                                             │ │
│  │      // 5. Call Gemini API ──────────────────────────────►│ │
│  │    }                                                        │ │
│  │    catch (error) {                                         │ │
│  │      // ✅ body is now accessible here                     │ │
│  │      return NextResponse.json({ error }, { status: 500 }) │ │
│  │    }                                                        │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Call
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE GEMINI API                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ai.models.generateContent({                               │ │
│  │    model: 'gemini-2.5-flash', // ✅ Stable version         │ │
│  │    contents: [ // ✅ Fixed: Array format                   │ │
│  │      {                                                      │ │
│  │        parts: [                                            │ │
│  │          {                                                  │ │
│  │            inlineData: {                                   │ │
│  │              data: cleanBase64Data,                        │ │
│  │              mimeType: "image/jpeg"                        │ │
│  │            }                                                │ │
│  │          },                                                 │ │
│  │          {                                                  │ │
│  │            text: "Apply this nail art design..."          │ │
│  │          }                                                  │ │
│  │        ]                                                    │ │
│  │      }                                                      │ │
│  │    ],                                                       │ │
│  │    config: {                                               │ │
│  │      responseModalities: [Modality.IMAGE]                 │ │
│  │    }                                                        │ │
│  │  })                                                         │ │
│  │                                                             │ │
│  │  ✅ Validates API key                                      │ │
│  │  ✅ Processes image with AI                                │ │
│  │  ✅ Applies nail art design                                │ │
│  │  ✅ Returns modified image                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE PROCESSING                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  // Find image in response                                 │ │
│  │  if (response.candidates[0].content.parts) {               │ │
│  │    for (const part of parts) {                             │ │
│  │      if (part.inlineData) {                                │ │
│  │        return NextResponse.json({                          │ │
│  │          success: true,                                    │ │
│  │          imageData: part.inlineData.data // base64        │ │
│  │        })                                                   │ │
│  │      }                                                      │ │
│  │    }                                                        │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JSON Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  const data = await response.json()                        │ │
│  │                                                             │ │
│  │  if (data.success && data.imageData) {                     │ │
│  │    const imageUrl = `data:image/png;base64,${data.imageData}`│
│  │    setGeneratedImage(imageUrl)                             │ │
│  │    setCurrentStep(4) // Show results                       │ │
│  │  }                                                          │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  DraggableComparisonSlider                           │ │ │
│  │  │  ┌─────────────┬─────────────┐                       │ │ │
│  │  │  │   BEFORE    │    AFTER    │                       │ │ │
│  │  │  │  (original) │ (with nails)│                       │ │ │
│  │  │  └─────────────┴─────────────┘                       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Fixes Applied

### 1. Variable Scope Fix
```typescript
// ❌ BEFORE - body not accessible in catch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ...
  } catch (error) {
    console.error('Error:', body); // ❌ ReferenceError!
  }
}

// ✅ AFTER - body accessible everywhere
export async function POST(request: NextRequest) {
  let body: any = null; // Declared outside try
  try {
    body = await request.json();
    // ...
  } catch (error) {
    console.error('Error:', body); // ✅ Works!
  }
}
```

### 2. API Format Fix
```typescript
// ❌ BEFORE - Wrong format
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp', // Experimental
  contents: { // ❌ Object instead of array
    parts: [...]
  }
});

// ✅ AFTER - Correct format per official docs
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash', // Stable
  contents: [ // ✅ Array format
    {
      parts: [...]
    }
  ]
});
```

### 3. Error Handling Fix
```typescript
// ❌ BEFORE - Could return non-JSON
catch (error) {
  console.error(error);
  // Sometimes no return statement
}

// ✅ AFTER - Always returns valid JSON
catch (error) {
  console.error('Error calling Gemini API:', error);
  return NextResponse.json(
    { 
      error: 'Failed to generate image',
      details: errorMessage
    },
    { status: 500 }
  );
}
```

---

## 🚨 Error Scenarios

### Scenario 1: Expired API Key
```
User clicks Generate
    ↓
API Route receives request
    ↓
Calls Gemini API
    ↓
❌ Error: "API key expired"
    ↓
Catch block handles error
    ↓
Returns JSON: { error: "Failed to generate image", details: "API key expired..." }
    ↓
Frontend shows error message
```

**Solution**: Get new API key from Google AI Studio

### Scenario 2: Rate Limit Exceeded
```
User clicks Generate (16th time in 1 minute)
    ↓
Rate limiter checks request
    ↓
❌ Rate limit exceeded
    ↓
Returns 429 status with headers
    ↓
Frontend shows: "Too many requests, please wait"
```

**Solution**: Wait 1 minute before trying again

### Scenario 3: Invalid Image Format
```
User uploads unsupported file
    ↓
API Route validates input
    ↓
❌ Validation fails
    ↓
Returns 400: { error: "Invalid input data" }
    ↓
Frontend shows error message
```

**Solution**: Upload JPEG, PNG, or WebP image

---

## ✅ Success Flow

```
1. User selects design: "French Manicure"
        ↓
2. User uploads hand photo (JPEG, 2MB)
        ↓
3. Frontend converts to base64
        ↓
4. POST /api/generate-nail-art
        ↓
5. Rate limit check: ✅ OK (5 requests/min)
        ↓
6. Input validation: ✅ Valid
        ↓
7. Gemini API call: ✅ Success
        ↓
8. AI processes image (10-30 seconds)
        ↓
9. Returns modified image as base64
        ↓
10. Frontend displays before/after slider
        ↓
11. User sees nail art on their hand! 🎉
```

---

## 📊 Performance Metrics

| Step | Time | Notes |
|------|------|-------|
| Frontend validation | <100ms | Instant |
| API route processing | <50ms | Very fast |
| Gemini API call | 10-30s | AI processing |
| Response parsing | <50ms | Fast |
| Image rendering | <200ms | Browser |
| **Total** | **~10-30s** | Mostly AI processing |

---

## 🔐 Security Flow

```
┌──────────────────────────────────────────────────────┐
│  Security Layers                                     │
├──────────────────────────────────────────────────────┤
│  1. Rate Limiting                                    │
│     ✅ 5 requests per minute per IP                  │
│     ✅ Prevents abuse                                │
├──────────────────────────────────────────────────────┤
│  2. Input Validation                                 │
│     ✅ Validates image format                        │
│     ✅ Checks file size                              │
│     ✅ Sanitizes prompts                             │
├──────────────────────────────────────────────────────┤
│  3. API Key Security                                 │
│     ✅ Stored in .env.local                          │
│     ✅ Never exposed to client                       │
│     ✅ Server-side only                              │
├──────────────────────────────────────────────────────┤
│  4. Error Handling                                   │
│     ✅ No sensitive data in errors                   │
│     ✅ Sanitized error messages                      │
│     ✅ Proper logging                                │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Testing Checklist

- [ ] Run `npm run test:gemini` - All tests pass
- [ ] Navigate to `/try-on` - Page loads
- [ ] Select a design - Design selected
- [ ] Upload hand photo - Photo uploaded
- [ ] Click Generate - Request sent
- [ ] Wait for processing - No errors
- [ ] View result - Image displayed
- [ ] Try comparison slider - Slider works
- [ ] Download result - File downloads
- [ ] Try another design - Reset works

---

## 📝 Notes

- **Processing Time**: 10-30 seconds is normal for AI image generation
- **Rate Limits**: Free tier allows 15 requests per minute
- **Image Quality**: Best results with clear, well-lit hand photos
- **Supported Formats**: JPEG, PNG, WebP (max 4MB recommended)
- **Model**: Using `gemini-2.5-flash` (stable, recommended for production)

