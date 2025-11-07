# R2 Salon Data - Testing Guide

## Prerequisites

Before running the data collection script, ensure you have:

1. ✅ **Environment variables set** in `.env.local`:
   ```
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_ENDPOINT=https://05b5ee1a83754aa6b4fcd974016ecde8.r2.cloudflarestorage.com
   R2_PUBLIC_URL=https://cdn.nailartai.app
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   GEMINI_API_KEY=your_gemini_key (optional, for fallback)
   ```

2. ✅ **Dependencies installed**:
   ```bash
   npm install
   ```

3. ✅ **tsx installed** (should be auto-installed):
   ```bash
   npm list tsx
   ```

## Step 1: Run Data Collection

### Start the Collection

```bash
npm run collect-salon-data
```

### What to Expect

The script will:
1. Process 5 test states (California, Texas, New York, Florida, Illinois)
2. Collect data for ~500-800 cities
3. Fetch up to 50 salons per city from Google Places API
4. Upload all data to R2 bucket
5. Display progress and statistics

### Expected Output

```
🚀 Starting Salon Data Collection
============================================================
📍 Collecting data for 5 test states:
   California, Texas, New York, Florida, Illinois
============================================================

🏛️  Processing California...
   Found 641 cities in California
  📍 Fetching salons for Los Angeles, California...
  ✅ Los Angeles, California: 50 salons uploaded to R2
  📍 Fetching salons for San Francisco, California...
  ✅ San Francisco, California: 50 salons uploaded to R2
  ...
✅ California complete: 641 cities, 32,050 salons

🏛️  Processing Texas...
  ...

📊 COLLECTION SUMMARY
============================================================
✅ States processed:     5
✅ Cities processed:     2,500
✅ Successful cities:    2,450
❌ Failed cities:        50
✅ Total salons:         122,500
⏱️  Duration:             45m 30s
💾 Estimated storage:    ~600 MB
💰 Estimated API cost:   ~$28.00
============================================================
```

### Time Estimates

- **Per city**: ~1-3 seconds
- **5 states (~2,500 cities)**: 30-60 minutes
- **All 50 states (~8,200 cities)**: 2-6 hours

### Cost Estimates

- **5 states**: ~$28 (one-time)
- **All 50 states**: ~$139 (one-time)

## Step 2: Verify R2 Structure

### Check Cloudflare R2 Dashboard

1. Go to Cloudflare Dashboard → R2
2. Open bucket: `nail-art-unified`
3. Navigate to: `data/nail-salons/`

### Expected Structure

```
data/nail-salons/
├── index.json                          ✅ Should exist
├── states/
│   ├── california.json                 ✅ Should exist
│   ├── texas.json                      ✅ Should exist
│   ├── new-york.json                   ✅ Should exist
│   ├── florida.json                    ✅ Should exist
│   └── illinois.json                   ✅ Should exist
└── cities/
    ├── california/
    │   ├── los-angeles.json            ✅ Should exist
    │   ├── san-francisco.json          ✅ Should exist
    │   └── ... (639 more files)
    ├── texas/
    │   ├── houston.json                ✅ Should exist
    │   └── ... (200 more files)
    └── ... (other states)
```

### Verify File Contents

Check a sample city file:

```bash
# Using Cloudflare R2 dashboard or CLI
# File: data/nail-salons/cities/california/los-angeles.json

{
  "city": "Los Angeles",
  "state": "California",
  "citySlug": "los-angeles",
  "stateSlug": "california",
  "salonCount": 50,
  "lastUpdated": "2025-01-XX...",
  "salons": [
    {
      "name": "Luxury Nails Spa",
      "address": "123 Main St, Los Angeles, CA 90001",
      "rating": 4.5,
      "photos": [
        {
          "name": "places/ChIJ.../photos/abc123",
          "url": "https://places.googleapis.com/v1/.../media?maxWidthPx=800&key=...",
          "width": 800,
          "height": 600
        }
      ],
      ...
    }
  ]
}
```

## Step 3: Test Sitemap Generation

### Test Locally (Development)

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit sitemap URL:
   ```
   http://localhost:3000/sitemap-nail-salons.xml
   ```

### Verify Sitemap

**Expected Results:**
- ✅ Response time: **5-10 seconds** (not 4-6 hours!)
- ✅ Status code: **200 OK**
- ✅ Content-Type: `application/xml`
- ✅ URLs count: **~8,250** (50 states + ~8,200 cities)
- ✅ Valid XML format
- ✅ No timeout errors

**Sample Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nailartai.app/nail-salons/california</loc>
    <lastmod>2025-01-XX...</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://nailartai.app/nail-salons/california/los-angeles</loc>
    <lastmod>2025-01-XX...</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  ...
</urlset>
```

### Test in Production

After deployment:
1. Visit: `https://nailartai.app/sitemap-nail-salons.xml`
2. Verify same results as above
3. Submit to Google Search Console

## Step 4: Test Salon Pages

### Test Individual Salon Page

1. Visit a salon page URL:
   ```
   https://nailartai.app/nail-salons/california/los-angeles/luxury-nails-spa
   ```

2. **Check Browser Console:**
   - Look for: `✅ Using R2 data for salon luxury-nails-spa`
   - Should NOT see: `⚠️ Salon not in R2, fetching from API`

3. **Verify Page Loads:**
   - ✅ Fast load time (50-200ms for R2 data)
   - ✅ All salon information displayed
   - ✅ Photos load correctly (from Google URLs)
   - ✅ No errors in console
   - ✅ Good Core Web Vitals scores

### Test City Page

1. Visit a city page:
   ```
   https://nailartai.app/nail-salons/california/los-angeles
   ```

2. **Verify:**
   - ✅ Shows list of salons
   - ✅ Links to individual salon pages work
   - ✅ Fast page load

### Test State Page

1. Visit a state page:
   ```
   https://nailartai.app/nail-salons/california
   ```

2. **Verify:**
   - ✅ Shows list of cities
   - ✅ Links to city pages work
   - ✅ Fast page load

## Step 5: Monitor Performance

### Check Logs

**Development:**
- Check terminal output for R2 fetch messages
- Look for any error messages

**Production:**
- Check Vercel logs
- Monitor API usage in Google Cloud Console
- Check R2 usage in Cloudflare dashboard

### Key Metrics to Monitor

1. **Sitemap Generation Time**
   - Should be: 5-10 seconds
   - If slower: Check R2 connection

2. **Salon Page Load Time**
   - R2 data: 50-200ms
   - API fallback: 2-5 seconds
   - Monitor ratio of R2 vs API

3. **API Costs**
   - Should be minimal (only for fallback)
   - Monitor Google Places API usage

4. **R2 Storage**
   - Should be: ~200-300 MB for 5 states
   - Monitor growth as you expand

## Troubleshooting

### Issue: Script Fails with "Missing API Key"

**Solution:**
```bash
# Check .env.local exists and has required keys
cat .env.local | grep GOOGLE_MAPS_API_KEY
```

### Issue: R2 Upload Fails

**Solution:**
1. Verify R2 credentials in `.env.local`
2. Check R2 bucket exists: `nail-art-unified`
3. Verify bucket permissions

### Issue: Sitemap Still Slow

**Solution:**
1. Check if using R2 data (should be fast)
2. Verify cities are read from local JSON (not API)
3. Check for network issues

### Issue: Salon Pages Use API Instead of R2

**Solution:**
1. Verify data was uploaded to R2
2. Check R2 path structure matches expected format
3. Verify slug generation matches (case-sensitive)

### Issue: Photos Don't Load

**Solution:**
1. Photos are fetched from Google (not stored)
2. Check Google Maps API key is valid
3. Verify photo URLs in R2 JSON data

## Success Criteria

✅ **All tests pass when:**
- [ ] Data collection completes without errors
- [ ] R2 structure matches expected hierarchy
- [ ] Sitemap generates in <10 seconds
- [ ] Salon pages load from R2 (not API)
- [ ] Photos display correctly
- [ ] No console errors
- [ ] Good performance scores

## Next Steps After Testing

Once all tests pass:

1. **Deploy to Production**
   ```bash
   git add .
   git commit -m "Add R2 salon data storage"
   git push
   ```

2. **Submit Sitemap to Google**
   - Go to Google Search Console
   - Submit: `https://nailartai.app/sitemap-nail-salons.xml`

3. **Monitor for 24-48 hours**
   - Check Google indexing
   - Monitor performance
   - Watch for any errors

4. **Expand to All States** (Optional)
   - Update `TEST_STATES` in collection script
   - Run full collection
   - Monitor costs and performance

## Questions?

If you encounter any issues:
1. Check this guide first
2. Review error messages carefully
3. Check R2 dashboard for data structure
4. Verify environment variables are set

Good luck! 🚀

