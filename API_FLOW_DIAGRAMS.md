# API Flow Diagrams - Current vs Optimized

## 🔴 CURRENT FLOW (SLOW)

### Salon Detail Page Load

```
┌──────────────────────────────────────────────────────────────┐
│                    USER VISITS SALON PAGE                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 1: getNailSalonBySlug(state, city, slug)                │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ getNailSalonsForLocation(state, city, 100)          │   │
│   │                                                      │   │
│   │  → Places API Call #1: "nail salons in city"       │   │
│   │  → Places API Call #2: "nail spa in city"          │   │
│   │  → Places API Call #3: "nail art studio in city"   │   │
│   │  → Places API Call #4: "manicure pedicure in city" │   │
│   │  → Places API Call #5: "beauty salon in city"      │   │
│   │                                                      │   │
│   │  Time: 500-800ms (parallel)                         │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                               │
│   Find salon by slug in results                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: Parallel Fetch (3 operations)                        │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ A) getSalonDetails(salon)                          │     │
│  │                                                     │     │
│  │    → getPlaceDetails(placeId)  [Places API #6]    │     │
│  │      Time: 200-400ms                               │     │
│  │                                                     │     │
│  │    → 7 Parallel Gemini API Calls:                 │     │
│  │      1. Description                                │     │
│  │      2. Services                                   │     │
│  │      3. Reviews summary                            │     │
│  │      4. Neighborhood info                          │     │
│  │      5. Nearby attractions                         │     │
│  │      6. Parking info                               │     │
│  │      7. FAQ                                        │     │
│  │      Time: 2-5 seconds each (parallel = 2-5s)     │     │
│  │                                                     │     │
│  │    Total: 2.2-5.4 seconds                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ B) getSalonAdditionalData(salon)                   │     │
│  │                                                     │     │
│  │    → getPlaceDetails(placeId)  [Places API #7]    │     │
│  │      ⚠️  DUPLICATE CALL! Same as #6                │     │
│  │      Time: 200-400ms (wasted!)                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ C) getNailSalonsForLocation(state, city, 6)       │     │
│  │    (for related salons)                            │     │
│  │                                                     │     │
│  │    → Places API Call #8: "nail salons in city"    │     │
│  │      Time: 200-500ms                               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Parallel execution time: 2.2-5.4 seconds                    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      RENDER PAGE                              │
│                                                               │
│  Total Time: 3-6 seconds                                      │
│  Total API Calls:                                             │
│    - Places API: 8 calls                                      │
│    - Gemini API: 7 calls                                      │
│  Total Cost: ~$0.43 per page view                             │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ OPTIMIZED FLOW (FAST)

### Salon Detail Page Load (With Caching)

```
┌──────────────────────────────────────────────────────────────┐
│                    USER VISITS SALON PAGE                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 1: Check Cache                                           │
│                                                               │
│   Cache Key: "salon_details:california:los-angeles:slug"     │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ CACHE HIT? (95% of requests)                        │   │
│   │                                                      │   │
│   │ ✅ YES → Return cached data                         │   │
│   │    Time: 50-100ms                                    │   │
│   │    API Calls: 0                                      │   │
│   │    Cost: $0                                          │   │
│   │                                                      │   │
│   │    ┌──────────────────────────────────────┐         │   │
│   │    │    RENDER PAGE (50-100ms)            │         │   │
│   │    │    Done! 95% faster!                 │         │   │
│   │    └──────────────────────────────────────┘         │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ CACHE MISS? (5% of requests)                        │   │
│   │                                                      │   │
│   │ ❌ NO → Fetch from API (continue below)             │   │
│   └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: Optimized API Fetch (Cache Miss Only - 5%)           │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ A) Direct Salon Search (optimized)                 │     │
│  │                                                     │     │
│  │    → Places API Call #1:                           │     │
│  │      "Salon Name in City, State"                   │     │
│  │      Time: 200-400ms                               │     │
│  │      ✅ Direct search, no need to fetch 100        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ B) Single getPlaceDetails Call                     │     │
│  │                                                     │     │
│  │    → Places API Call #2: getPlaceDetails(placeId) │     │
│  │      Time: 200-400ms                               │     │
│  │      ✅ Called once, shared between functions      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ C) Reduced Gemini Calls (3-4 instead of 7)        │     │
│  │                                                     │     │
│  │    → Gemini Call #1: Description + Services        │     │
│  │      (combined prompt)                             │     │
│  │    → Gemini Call #2: Reviews + Neighborhood        │     │
│  │      (combined prompt)                             │     │
│  │    → Gemini Call #3: Attractions + Parking         │     │
│  │      (combined prompt)                             │     │
│  │                                                     │     │
│  │    Time: 1-2 seconds (parallel)                    │     │
│  │    ✅ 50% fewer Gemini calls                       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ D) Related Salons (from cache if available)       │     │
│  │                                                     │     │
│  │    Cache Key: "salons_list:california:los-angeles"│     │
│  │    → Cache Hit: 0ms                                │     │
│  │    → Cache Miss: 1 Places API call (200-400ms)    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Total Time: 1-2 seconds                                      │
│  Total API Calls:                                             │
│    - Places API: 2-3 calls (vs 8)                             │
│    - Gemini API: 3 calls (vs 7)                               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Cache Result                                          │
│                                                               │
│   Store in cache with 12-hour TTL                             │
│   Next 95% of requests will be instant!                       │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      RENDER PAGE                              │
│                                                               │
│  Cache Hit (95%):  50-100ms, 0 API calls, $0                 │
│  Cache Miss (5%):  1-2 seconds, 2-3 Places + 3 Gemini, $0.08 │
│                                                               │
│  Average Response Time: 150ms (vs 3-6 seconds)                │
│  Average Cost: $0.004 per page view (vs $0.43)                │
│                                                               │
│  🎉 95% FASTER, 99% CHEAPER! 🎉                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Side-by-Side Comparison

### City Page: Salon Listing

#### Current (Slow)
```
User Request
    ↓
No Cache Check
    ↓
5 Parallel Places API Calls
├─ "nail salons in city"
├─ "nail spa in city"
├─ "nail art studio in city"
├─ "manicure pedicure in city"
└─ "beauty salon in city"
    ↓
Deduplicate & Filter
    ↓
Response: 500-800ms
Cost: $0.16
```

#### Optimized (Fast)
```
User Request
    ↓
Check Cache: "salons_list:state:city"
    ↓
┌─ Cache Hit (90%)
│  └─→ Return: 50-100ms, $0
│
└─ Cache Miss (10%)
   ↓
   1 Places API Call
   (or use existing cached data)
   ↓
   Cache & Return: 200-400ms
   Cost: $0.032
   
Average: 65ms, $0.003
```

---

### State Page: City Listing

#### Current (Slow)
```
User Request
    ↓
No Cache Check
    ↓
Gemini API Call
"List ALL cities in State..."
    ↓
Parse Response
    ↓
Response: 2-5 seconds
Cost: $0.001
```

#### Optimized (Fast)
```
User Request
    ↓
Check Cache: "cities:state"
    ↓
┌─ Cache Hit (98%)
│  └─→ Return: 20-50ms, $0
│
└─ Cache Miss (2%)
   ↓
   Gemini API Call
   ↓
   Cache (7 days TTL)
   ↓
   Response: 2-5 seconds
   Cost: $0.001
   
Average: 50ms, $0.00002
```

---

## 🎯 Key Improvements Summary

### 1. Caching Layer
- **Impact:** 80-95% faster, 95% cost reduction
- **Cache Hit Rate:** 90-98% depending on page
- **TTL Strategy:** 6 hours to 7 days based on data volatility

### 2. Eliminate Duplicate Calls
- **Before:** `getPlaceDetails` called twice per salon page
- **After:** Called once, result shared
- **Savings:** 1 API call, 200-400ms, $0.032 per page

### 3. Optimize Salon Lookup
- **Before:** Fetch 100 salons to find 1
- **After:** Direct search for specific salon
- **Savings:** 4 API calls, 400-600ms, $0.128 per page

### 4. Reduce Gemini Calls
- **Before:** 7 separate calls per salon page
- **After:** 3-4 combined calls per salon page
- **Savings:** 3-4 API calls, 2-3 seconds, $0.075-$0.10 per page

---

## 💰 Cost Breakdown

### Per 1,000 Page Views

| Page Type | Current | Optimized | Savings |
|-----------|---------|-----------|---------|
| State (Cities) | $1.00 | $0.02 | 98% |
| City (Salons) | $160.00 | $3.00 | 98% |
| Salon Detail | $430.00 | $4.00 | 99% |
| **Average** | **$197.00** | **$2.34** | **99%** |

### Annual Projection (100K users, 5 pages each)

| Metric | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| Total API Calls | 6.5M | 325K | 95% |
| Total Cost | $98,500 | $1,170 | **$97,330** |
| Avg Response Time | 5-8s | 200-500ms | 90% |

---

## 🚀 Implementation Priority

### Phase 1: Caching (Week 1) - 80-95% improvement
```typescript
// Simple in-memory cache for development
const cache = new Map();

// Redis for production
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### Phase 2: Fix Duplicates (Week 1) - 30-40% improvement
```typescript
// Before: Called twice
const details = await getSalonDetails(salon);
const additional = await getSalonAdditionalData(salon);

// After: Called once
const placeDetails = await getPlaceDetails(salon.placeId);
const [details, additional] = await Promise.all([
  getSalonDetails(salon, placeDetails),
  getSalonAdditionalData(salon, placeDetails)
]);
```

### Phase 3: Optimize Queries (Week 2) - 20-30% improvement
```typescript
// Before: Fetch 100 to find 1
const allSalons = await getNailSalonsForLocation(state, city, 100);
const salon = allSalons.find(s => generateSlug(s.name) === slug);

// After: Direct search
const salon = await searchSalonByName(nameFromSlug, city, state);
```

### Phase 4: Reduce Gemini (Week 2) - 40-50% improvement
```typescript
// Before: 7 separate calls
await Promise.all([
  getDescription(),
  getServices(),
  getReviews(),
  getNeighborhood(),
  getAttractions(),
  getParking(),
  getFAQ()
]);

// After: 3 combined calls
await Promise.all([
  getDescriptionAndServices(),
  getReviewsAndNeighborhood(),
  getAttractionsAndParking()
]);
```

---

**Total Expected Improvement:**
- ⚡ **85-95% faster** response times
- 💰 **99% cost reduction**
- 🎯 **Better SEO** (faster pages rank higher)
- 😊 **Happier users** (lower bounce rate)

---

See `API_OPTIMIZATION_ANALYSIS.md` for detailed implementation guide.
