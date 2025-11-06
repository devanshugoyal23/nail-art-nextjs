# API Optimization Analysis & Strategy

## Executive Summary

**Current Status:** The nail salon directory uses a hybrid approach with Google Places API (primary) and Gemini API with Maps Grounding (fallback + content generation). While functional, there are significant performance bottlenecks causing slow page loads.

**Key Issues:**
- 🔴 **Multiple sequential API calls** per page (up to 5 Places API + 7 Gemini API calls)
- 🔴 **No caching layer** - every request hits external APIs
- 🔴 **Expensive Gemini calls** for content that rarely changes
- 🔴 **Redundant requests** - same data fetched multiple times

**Potential Improvements:**
- ✅ Implement Redis/in-memory caching → **80-95% faster**
- ✅ Reduce Gemini API calls → **50-70% cost reduction**
- ✅ Optimize Places API usage → **40-60% faster**
- ✅ Add request deduplication → **30-50% fewer API calls**

---

## Current Data Flow Analysis

### 1. States Page (`/nail-salons`)

```
User Request
    ↓
getAllStatesWithSalons()
    ↓
[STATIC DATA] - Hardcoded list of 10 states
    ↓
Response: ~50ms (no API calls)
```

**Status:** ✅ **GOOD** - No API calls, instant response

---

### 2. State Page (`/nail-salons/california`)

```
User Request
    ↓
getCitiesInState(state)
    ↓
Gemini API Call (1x)
    ├─ Prompt: "List ALL cities in California..."
    ├─ Response time: 2-5 seconds
    └─ Returns: 50-100+ cities
    ↓
Response: 2-5 seconds
```

**Status:** 🟡 **NEEDS OPTIMIZATION**

**Issues:**
- Gemini API call on every request (no caching)
- Cities list rarely changes
- 2-5 second wait time for static data

**API Usage:**
- **Gemini API:** 1 call per state visit
- **Places API:** 0 calls
- **Cost:** ~$0.001 per request

---

### 3. City Page (`/nail-salons/california/los-angeles`)

```
User Request
    ↓
getNailSalonsForLocation(state, city, 100)
    ↓
Multiple Parallel Places API Calls (5x)
    ├─ Query 1: "nail salons in Los Angeles, California"
    ├─ Query 2: "nail spa in Los Angeles, California"
    ├─ Query 3: "nail art studio in Los Angeles, California"
    ├─ Query 4: "manicure pedicure in Los Angeles, California"
    └─ Query 5: "beauty salon in Los Angeles, California"
    ↓
Each call: 200-500ms
Parallel execution: 500-800ms total
    ↓
Deduplicate & Filter Results
    ↓
If < 100 salons → Gemini Fallback (1x)
    └─ Additional 2-5 seconds
    ↓
Response: 500ms - 6 seconds (depending on fallback)
```

**Status:** 🔴 **CRITICAL - NEEDS OPTIMIZATION**

**Issues:**
- 5 parallel Places API calls per city visit
- No caching - same salons fetched repeatedly
- Gemini fallback adds 2-5 seconds
- Salon lists change infrequently

**API Usage:**
- **Places API:** 5 calls per city visit
- **Gemini API:** 0-1 calls (if fallback needed)
- **Cost:** ~$0.160 per request (Places) + ~$0.001 (Gemini if used)

---

### 4. Salon Detail Page (`/nail-salons/california/los-angeles/salon-name`)

```
User Request
    ↓
getNailSalonBySlug(state, city, slug)
    ├─ Calls: getNailSalonsForLocation(state, city, 100)
    │   └─ 5 Places API calls (500-800ms)
    └─ Find salon by slug
    ↓
Parallel Fetch (3 operations):
    ├─ getSalonDetails(salon)
    │   ├─ getPlaceDetails(placeId) - 1 Places API call (200-400ms)
    │   └─ 7 Parallel Gemini API calls (2-5 seconds each)
    │       ├─ Description
    │       ├─ Services
    │       ├─ Reviews summary
    │       ├─ Neighborhood info
    │       ├─ Nearby attractions
    │       ├─ Parking info
    │       └─ FAQ
    ├─ getSalonAdditionalData(salon)
    │   └─ getPlaceDetails(placeId) - 1 Places API call (200-400ms)
    └─ getNailSalonsForLocation(state, city, 6) - Related salons
        └─ 1 Places API call (200-500ms)
    ↓
Total API Calls:
    - Places API: 8 calls (5 + 1 + 1 + 1)
    - Gemini API: 7 calls
    ↓
Response: 5-10 seconds
```

**Status:** 🔴 **CRITICAL - MAJOR BOTTLENECK**

**Issues:**
- **8 Places API calls** per salon page
- **7 Gemini API calls** per salon page
- Duplicate `getPlaceDetails` calls (called twice!)
- Content generated on every request
- No caching whatsoever
- 5-10 second page load time

**API Usage:**
- **Places API:** 8 calls per salon visit
- **Gemini API:** 7 calls per salon visit
- **Cost:** ~$0.256 (Places) + ~$0.175 (Gemini) = **~$0.43 per salon page**

---

## Performance Bottlenecks

### 🔴 Critical Issues

1. **No Caching Layer**
   - Every request hits external APIs
   - Same data fetched repeatedly
   - Impact: 80-95% slower than with caching

2. **Duplicate API Calls**
   - `getPlaceDetails` called twice on salon pages
   - `getNailSalonsForLocation` called for both slug lookup and related salons
   - Impact: 30-50% unnecessary API calls

3. **Excessive Gemini Calls**
   - 7 parallel Gemini calls per salon page
   - Content rarely changes
   - Impact: 5-8 seconds per salon page

4. **Sequential Dependencies**
   - Must fetch all salons before finding one by slug
   - Impact: 500-800ms unnecessary delay

### 🟡 Medium Issues

5. **Gemini for Static Data**
   - Cities list fetched from Gemini on every state page visit
   - Cities rarely change
   - Impact: 2-5 seconds per state page

6. **Over-fetching**
   - Fetching 100 salons to find 1 by slug
   - Fetching 100 salons when only showing 20-30
   - Impact: Unnecessary API costs and latency

---

## API Usage Breakdown

### Current API Calls Per User Journey

| Page | Places API | Gemini API | Total Time | Cost |
|------|-----------|-----------|------------|------|
| States List | 0 | 0 | ~50ms | $0 |
| State → Cities | 0 | 1 | 2-5s | $0.001 |
| City → Salons | 5 | 0-1 | 0.5-6s | $0.16 |
| Salon Detail | 8 | 7 | 5-10s | $0.43 |
| **Total Journey** | **13** | **8-9** | **8-21s** | **$0.59** |

### API Cost Analysis

**Per 1,000 Users (full journey):**
- Places API: 13,000 calls × $0.032/1K = **$416**
- Gemini API: 8,500 calls × $0.025/1K = **$212.50**
- **Total: $628.50 per 1,000 users**

**With 95% cache hit rate:**
- Places API: 650 calls × $0.032/1K = **$20.80**
- Gemini API: 425 calls × $0.025/1K = **$10.63**
- **Total: $31.43 per 1,000 users** (95% cost reduction!)

---

## Optimization Strategy

### Phase 1: Implement Caching (Highest Impact)

**Goal:** Reduce API calls by 80-95%

#### 1.1 Redis/In-Memory Cache

```typescript
// Cache TTL (Time To Live)
const CACHE_TTL = {
  CITIES: 7 * 24 * 60 * 60,      // 7 days - cities rarely change
  SALONS_LIST: 24 * 60 * 60,     // 24 hours - salon lists stable
  SALON_DETAILS: 12 * 60 * 60,   // 12 hours - details change occasionally
  PLACE_DETAILS: 6 * 60 * 60,    // 6 hours - Place API data
  GEMINI_CONTENT: 24 * 60 * 60,  // 24 hours - AI-generated content
};
```

**Implementation:**
- Use Redis for production (fast, distributed)
- Use in-memory Map for development
- Cache key format: `nail_salons:{type}:{state}:{city}:{id}`

**Expected Impact:**
- **Response time:** 8-21s → 50-500ms (95% faster)
- **API costs:** $628.50 → $31.43 per 1K users (95% reduction)
- **Server load:** Minimal (cache hits are instant)

---

### Phase 2: Optimize API Calls (Medium Impact)

**Goal:** Reduce redundant calls and improve efficiency

#### 2.1 Fix Duplicate `getPlaceDetails` Calls

**Current:**
```typescript
// Called twice on salon detail page!
getSalonDetails(salon) → getPlaceDetails(placeId)
getSalonAdditionalData(salon) → getPlaceDetails(placeId)
```

**Optimized:**
```typescript
// Call once, share result
const placeDetails = await getPlaceDetails(salon.placeId);
const [details, additionalData] = await Promise.all([
  getSalonDetails(salon, placeDetails),  // Pass cached data
  getSalonAdditionalData(salon, placeDetails),  // Pass cached data
]);
```

**Impact:**
- Removes 1 Places API call per salon page
- Saves ~200-400ms per request
- Reduces cost by $0.032 per salon page

#### 2.2 Optimize Salon Lookup

**Current:**
```typescript
// Fetches 100 salons to find 1
getNailSalonBySlug(state, city, slug) {
  const salons = await getNailSalonsForLocation(state, city, 100);
  return salons.find(s => generateSlug(s.name) === slug);
}
```

**Optimized:**
```typescript
// Use Places API Text Search with specific salon name
getNailSalonBySlug(state, city, slug) {
  // Try cache first
  const cached = cache.get(`salon:${state}:${city}:${slug}`);
  if (cached) return cached;
  
  // Search for specific salon
  const salon = await searchSalonByName(salonNameFromSlug, city, state);
  cache.set(`salon:${state}:${city}:${slug}`, salon, CACHE_TTL.SALON_DETAILS);
  return salon;
}
```

**Impact:**
- Reduces from 5 Places API calls to 1
- Saves ~400-600ms per salon page
- Reduces cost by $0.128 per salon page

#### 2.3 Reduce Gemini Calls

**Current:** 7 Gemini calls per salon page

**Optimized:** 3-4 Gemini calls per salon page

**Strategy:**
- Combine related prompts (services + pricing in one call)
- Use Places API data when available (reviews, photos)
- Cache aggressively (24 hour TTL)
- Generate content lazily (only when needed)

**Impact:**
- Reduces Gemini calls by 40-50%
- Saves ~2-3 seconds per salon page
- Reduces cost by $0.075-$0.10 per salon page

---

### Phase 3: Smart Data Fetching (Low-Medium Impact)

**Goal:** Fetch only what's needed, when it's needed

#### 3.1 Lazy Loading for Salon Details

**Current:** All 7 sections fetched on page load

**Optimized:** 
- Load critical data first (name, address, rating, photos)
- Load additional sections on-demand or in background
- Use Intersection Observer for below-fold content

**Impact:**
- Initial page load: 5-10s → 1-2s
- Full page load: Same, but perceived as faster

#### 3.2 Pagination for Salon Lists

**Current:** Fetch 100 salons, show all

**Optimized:**
- Fetch 20 salons initially
- Load more on scroll/click
- Cache each page separately

**Impact:**
- Initial load: 500-800ms → 200-400ms
- Reduces unnecessary data transfer

---

## Proposed Architecture

### Current Flow (Slow)

```
┌─────────────┐
│ User Request│
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│ No Cache Check   │
└──────┬───────────┘
       │
       ↓
┌──────────────────────────┐
│ Multiple API Calls       │
│ - Places API: 5-8 calls  │
│ - Gemini API: 0-7 calls  │
│ Time: 5-10 seconds       │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────┐
│ Process & Return │
└──────────────────┘
```

### Optimized Flow (Fast)

```
┌─────────────┐
│ User Request│
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│ Check Cache      │
└──────┬───────────┘
       │
       ├─── Cache Hit (95% of requests)
       │    └─→ Return cached data (50-100ms)
       │
       └─── Cache Miss (5% of requests)
            │
            ↓
       ┌────────────────────────┐
       │ Optimized API Calls    │
       │ - Places API: 1-2 calls│
       │ - Gemini API: 0-3 calls│
       │ Time: 1-3 seconds      │
       └──────┬─────────────────┘
              │
              ↓
       ┌──────────────────┐
       │ Cache & Return   │
       └──────────────────┘
```

---

## Implementation Plan

### Step 1: Add Caching Layer (Week 1)

**Priority:** 🔴 CRITICAL

**Tasks:**
1. Install Redis or use in-memory cache
2. Create cache service with TTL support
3. Wrap all API calls with cache layer
4. Add cache invalidation strategy

**Files to modify:**
- Create `src/lib/cacheService.ts`
- Modify `src/lib/nailSalonService.ts`

**Expected Impact:**
- **Response time:** 80-95% faster
- **API costs:** 80-95% reduction
- **Implementation time:** 2-3 days

---

### Step 2: Fix Duplicate API Calls (Week 1)

**Priority:** 🔴 HIGH

**Tasks:**
1. Consolidate `getPlaceDetails` calls
2. Optimize `getNailSalonBySlug` to not fetch all salons
3. Add request deduplication

**Files to modify:**
- `src/lib/nailSalonService.ts`
- `src/app/nail-salons/[state]/[city]/[slug]/page.tsx`

**Expected Impact:**
- **Response time:** 30-40% faster
- **API costs:** 30-40% reduction
- **Implementation time:** 1 day

---

### Step 3: Reduce Gemini Calls (Week 2)

**Priority:** 🟡 MEDIUM

**Tasks:**
1. Combine related prompts
2. Use Places API data when available
3. Implement lazy loading for non-critical sections
4. Increase cache TTL for stable content

**Files to modify:**
- `src/lib/nailSalonService.ts`
- `src/app/nail-salons/[state]/[city]/[slug]/page.tsx`

**Expected Impact:**
- **Response time:** 40-50% faster
- **API costs:** 40-50% reduction
- **Implementation time:** 2-3 days

---

### Step 4: Add Pagination & Lazy Loading (Week 2-3)

**Priority:** 🟢 LOW-MEDIUM

**Tasks:**
1. Implement pagination for salon lists
2. Add lazy loading for salon detail sections
3. Use Intersection Observer for below-fold content

**Files to modify:**
- `src/app/nail-salons/[state]/[city]/page.tsx`
- `src/app/nail-salons/[state]/[city]/[slug]/page.tsx`

**Expected Impact:**
- **Initial load:** 50-60% faster
- **User experience:** Significantly improved
- **Implementation time:** 2-3 days

---

## Performance Comparison

### Before Optimization

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **States Page** | 50ms | 50ms | - |
| **State Page (Cities)** | 2-5s | 50-200ms | **95% faster** |
| **City Page (Salons)** | 0.5-6s | 200-500ms | **90% faster** |
| **Salon Detail Page** | 5-10s | 500ms-2s | **80-95% faster** |
| **Full Journey** | 8-21s | 1-3s | **85-90% faster** |
| **API Cost (1K users)** | $628.50 | $31.43 | **95% reduction** |

### After Optimization (with 95% cache hit rate)

| Page | Cache Hit | Cache Miss | Avg Response |
|------|-----------|------------|--------------|
| States | 50ms | 50ms | 50ms |
| State → Cities | 50ms | 1-2s | 150ms |
| City → Salons | 100ms | 1-2s | 250ms |
| Salon Detail | 200ms | 2-3s | 500ms |
| **Total Journey** | **400ms** | **4-7s** | **950ms** |

---

## Recommendations

### Immediate Actions (This Week)

1. ✅ **Implement caching layer** - Highest impact, easiest to implement
2. ✅ **Fix duplicate API calls** - Quick win, significant impact
3. ✅ **Add request deduplication** - Prevents redundant calls

### Short-term (Next 2 Weeks)

4. ✅ **Reduce Gemini API calls** - Combine prompts, use Places data
5. ✅ **Optimize salon lookup** - Direct search instead of fetching all
6. ✅ **Add pagination** - Reduce initial data load

### Long-term (Next Month)

7. ✅ **Implement lazy loading** - Load content on-demand
8. ✅ **Add background refresh** - Keep cache warm
9. ✅ **Monitor and optimize** - Track metrics, adjust strategy

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Page Load Time**
   - Target: < 1 second for cached requests
   - Target: < 3 seconds for uncached requests

2. **API Cost**
   - Target: < $50 per 1,000 users
   - Current: $628.50 per 1,000 users

3. **Cache Hit Rate**
   - Target: > 90%
   - Monitor and optimize

4. **User Experience**
   - Target: Time to Interactive < 2 seconds
   - Target: First Contentful Paint < 1 second

---

## Conclusion

The current implementation is **functional but inefficient**. The main bottlenecks are:

1. **No caching** - Every request hits external APIs
2. **Duplicate API calls** - Same data fetched multiple times
3. **Excessive Gemini calls** - 7 calls per salon page

By implementing the optimization strategy, we can achieve:

- **85-95% faster response times**
- **95% cost reduction**
- **Significantly better user experience**

The highest impact optimization is **implementing a caching layer**, which alone can provide 80-95% improvement with minimal code changes.

**Recommended Priority:**
1. 🔴 Add caching layer (Week 1)
2. 🔴 Fix duplicate calls (Week 1)
3. 🟡 Reduce Gemini calls (Week 2)
4. 🟢 Add pagination & lazy loading (Week 2-3)

---

## Next Steps

1. Review and approve optimization plan
2. Set up Redis or in-memory cache
3. Implement caching layer
4. Test and measure improvements
5. Roll out optimizations incrementally
6. Monitor performance and adjust

**Estimated Timeline:** 2-3 weeks for full implementation
**Expected ROI:** 10-20x improvement in performance and cost

