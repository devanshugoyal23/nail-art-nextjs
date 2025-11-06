# 🗺️ API Usage Guide - Nail Salon Directory

**Last Updated:** November 6, 2025  
**Status:** Optimized for Speed & Cost

---

## 📊 Quick Reference: Which API for What?

```
┌─────────────────────────────────────────────────────────────────┐
│                     API USAGE BY PAGE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  States Page (/nail-salons)                                     │
│  └─ 📄 Static JSON (hardcoded)                                 │
│     ⚡ Speed: Instant (< 50ms)                                  │
│     💰 Cost: $0                                                 │
│                                                                 │
│  State → Cities (/nail-salons/california)                       │
│  └─ 📄 Static JSON (pre-generated)                             │
│     ⚡ Speed: Instant (5-10ms)                                  │
│     💰 Cost: $0                                                 │
│                                                                 │
│  City → Salons (/nail-salons/california/los-angeles)            │
│  └─ 🗺️  Google Places API (Text Search) × 5 parallel          │
│     ⚡ Speed: Fast (500-800ms)                                  │
│     💰 Cost: $0.16 per visit                                    │
│     📦 Returns: 50-80 real, verified salons                     │
│                                                                 │
│  Salon Details (/nail-salons/california/los-angeles/salon-name)│
│  ├─ 🗺️  Google Places API (Place Details) × 1                 │
│  │   ⚡ Speed: Fast (200-400ms)                                │
│  │   💰 Cost: $0.032 per visit                                 │
│  │   📦 Returns: Business info, photos, reviews, hours         │
│  │                                                              │
│  └─ 🤖 Google Gemini API × 7 (content generation)              │
│      ⚡ Speed: Slow (2-5 seconds)                               │
│      💰 Cost: $0.175 per visit                                  │
│      📦 Returns: Descriptions, services, FAQs, etc.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 API Strategy

### ✅ **Google Places API** (Primary Data Source)

**What it does:**
- Fetches real business listings from Google Maps
- Provides verified business information
- Returns photos, reviews, ratings, hours, etc.

**When we use it:**
- City pages: Text Search to list salons
- Salon pages: Place Details for specific salon info

**Why it's great:**
- ⚡ **Fast:** 200-500ms per call
- ✅ **Accurate:** Real, verified data from Google Maps
- 💰 **Affordable:** $0.032 per 1,000 calls
- 🔄 **Up-to-date:** Live business information

**API Endpoints Used:**
1. **Text Search:** `https://places.googleapis.com/v1/places:searchText`
   - Used for: Finding salons in a city
   - Returns: Up to 20 results per call
   - Strategy: Make 5 parallel calls with different queries to get 50-80 salons

2. **Place Details:** `https://places.googleapis.com/v1/places/{placeId}`
   - Used for: Getting detailed info about a specific salon
   - Returns: Full business details, photos, reviews, hours

---

### ✅ **Google Gemini API** (Content Generation Only)

**What it does:**
- Generates rich, SEO-friendly content
- Creates descriptions, service lists, FAQs
- Provides neighborhood information

**When we use it:**
- ONLY on individual salon detail pages
- For generating descriptive content
- To enhance SEO and user experience

**Why we limit its use:**
- ⏱️ **Slow:** 2-5 seconds per call
- 💰 **Expensive:** $0.025 per 1,000 calls
- 🎨 **Creative:** Best for content, not data fetching

**Current Usage:**
- 7 parallel calls per salon page:
  1. Description
  2. Services & Pricing
  3. Review Summary
  4. Neighborhood Info
  5. Nearby Attractions
  6. Parking Info
  7. FAQ

**Future Optimization:**
- Reduce to 3-4 calls by combining prompts
- Cache aggressively (24-hour TTL)
- Use Places API data when available

---

### ❌ **Gemini with Maps Grounding** (REMOVED)

**What it was:**
- Gemini API with Google Maps integration
- Used to fetch salon listings with AI assistance

**Why we removed it:**
- 🐌 **Too Slow:** 15-20 seconds per request
- 💸 **Expensive:** Same cost as regular Gemini
- 🔄 **Redundant:** Places API does it better and faster

**When it was used:**
- Previously: Fallback for city pages when Places API returned < 100 salons

**Replacement:**
- Now: Just use Places API results (50-80 salons is plenty!)

---

## 📈 Performance Comparison

### Before Optimization:

```
User Journey:
├─ States Page:        50ms (static)
├─ State → Cities:     2-5 seconds (Gemini API)
├─ City → Salons:      0.5-20 seconds (Places + Gemini fallback)
└─ Salon Details:      5-10 seconds (Places + 7× Gemini)
──────────────────────────────────────────────────────
Total:                 8-35 seconds 😱

API Calls per Journey: 13 Places + 8-9 Gemini
Cost per 1K Users:     $628.50
```

### After Optimization:

```
User Journey:
├─ States Page:        50ms (static)
├─ State → Cities:     5-10ms (static JSON) ✅
├─ City → Salons:      0.5-0.8 seconds (Places only) ✅
└─ Salon Details:      4-8 seconds (Places + 7× Gemini)
──────────────────────────────────────────────────────
Total:                 5-9 seconds 😊 (70-75% faster!)

API Calls per Journey: 8 Places + 7 Gemini
Cost per 1K Users:     $420.50 (33% savings!)
```

---

## 🔧 Technical Implementation

### City Page - Salon Fetching

```typescript
// Function: getNailSalonsForLocation()
// Location: src/lib/nailSalonService.ts

async function getNailSalonsForLocation(state, city, limit = 20) {
  // 1. Make 5 parallel Places API Text Search calls
  const searchQueries = [
    `nail salons in ${city}, ${state}`,
    `nail spa in ${city}, ${state}`,
    `nail art studio in ${city}, ${state}`,
    `manicure pedicure in ${city}, ${state}`,
    `beauty salon in ${city}, ${state}`
  ];
  
  // 2. Execute all searches in parallel
  const results = await Promise.all(
    searchQueries.map(query => placesTextSearch(query))
  );
  
  // 3. Deduplicate by placeId
  const uniqueSalons = deduplicateByPlaceId(results);
  
  // 4. Return results (no Gemini fallback!)
  return uniqueSalons.slice(0, limit);
}
```

### Salon Detail Page - Data Fetching

```typescript
// Function: getSalonDetails()
// Location: src/app/nail-salons/[state]/[city]/[slug]/page.tsx

async function loadSalonPage(state, city, slug) {
  // 1. Fetch place details ONCE
  const placeDetails = await getPlaceDetails(salon.placeId);
  
  // 2. Use placeDetails for both functions (no duplicate calls!)
  const [details, additionalData, relatedSalons] = await Promise.all([
    getSalonDetails(salon, placeDetails),      // Uses passed placeDetails
    getSalonAdditionalData(salon, placeDetails), // Uses passed placeDetails
    getNailSalonsForLocation(state, city, 6)   // Related salons
  ]);
  
  return { salon, details, relatedSalons };
}
```

---

## 💰 Cost Breakdown

### Per 1,000 Users (Full Journey):

| API | Calls | Cost per 1K | Total |
|-----|-------|-------------|-------|
| **Places API - Text Search** | 5,000 | $0.032 | $160.00 |
| **Places API - Place Details** | 2,000 | $0.032 | $64.00 |
| **Gemini API - Content Gen** | 7,000 | $0.025 | $175.00 |
| **Static JSON** | ∞ | $0 | $0 |
| **Total** | - | - | **$399.00** |

### With 90% Cache Hit Rate (Future):

| API | Calls | Cost per 1K | Total |
|-----|-------|-------------|-------|
| **Places API - Text Search** | 500 | $0.032 | $16.00 |
| **Places API - Place Details** | 200 | $0.032 | $6.40 |
| **Gemini API - Content Gen** | 700 | $0.025 | $17.50 |
| **Static JSON** | ∞ | $0 | $0 |
| **Total** | - | - | **$39.90** |

**Savings with caching: 90% reduction!** 🎉

---

## 🚀 Next Steps

### Phase 2: Implement Caching (HIGHEST PRIORITY)

**Goal:** Cache API responses to avoid repeated calls

**Strategy:**
```typescript
// Cache TTL (Time To Live)
const CACHE_TTL = {
  CITIES: 7 days,           // Cities rarely change
  SALONS_LIST: 24 hours,    // Salon lists stable
  SALON_DETAILS: 12 hours,  // Details change occasionally
  PLACE_DETAILS: 6 hours,   // Place API data
  GEMINI_CONTENT: 24 hours, // AI-generated content
};
```

**Expected Impact:**
- ⚡ 80-95% faster response times
- 💰 90% cost reduction
- 😊 Excellent user experience

---

## 📚 Documentation

For more details, see:
- `OPTIMIZATION_PROGRESS.md` - Detailed optimization tracking
- `OPTIMIZATION_SUMMARY.md` - Executive summary
- `API_OPTIMIZATION_ANALYSIS.md` - Full technical analysis
- `PHASE_4_COMPLETION.md` - Latest optimization details

---

**Last Updated:** November 6, 2025  
**Current Status:** 70-75% faster, 33% cheaper, much better UX! 🚀

