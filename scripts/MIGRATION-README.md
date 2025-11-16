# Migration Guide: /raw to /enriched

## 🎯 What This Does

Moves reviews from duplicate `/raw` files into `/enriched` files to save storage and simplify data structure.

**SAFE:** Does NOT delete anything! Old /raw files stay intact.

---

## 📊 Before vs After

### Before (Current):
```
/cities/{state}/{city}.json          - Basic salon data (2 KB)
/raw/{state}/{city}/{salon}.json     - Google API response (8 KB) ❌ Duplicate data!
/enriched/{state}/{city}/{salon}.json - AI content (4 KB)
```

### After (Optimized):
```
/cities/{state}/{city}.json          - Basic salon data (2 KB)
/enriched/{state}/{city}/{salon}.json - AI content + reviews (6 KB) ✅ All in one!
```

**Storage savings:** ~50-60% reduction in /raw + /enriched combined

---

## 🚀 How to Run Migration

### Step 1: Test (Dry Run)

First, make sure your environment is set up:

```bash
# Verify .env.local has R2 credentials
cat .env.local | grep R2_
```

Should show:
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

### Step 2: Run Migration

```bash
# Option 1: Using tsx (recommended, works better with TypeScript)
npx tsx scripts/migrate-raw-to-enriched.ts

# Option 2: Using ts-node
npx ts-node --esm scripts/migrate-raw-to-enriched.ts
```

### Step 3: Verify Results

The script will show a summary:
```
📊 MIGRATION SUMMARY
Total /raw files found:      500
✅ Successfully migrated:     450
⏭️  Already had reviews:       20
⚠️  /enriched not found:       30
❌ Errors:                    0
```

**Explanations:**
- **Successfully migrated:** Reviews added to /enriched ✅
- **Already had reviews:** Was already migrated (safe to re-run)
- **/enriched not found:** Salon has /raw but no /enriched yet (will be created on next enrichment)
- **Errors:** Check logs for details

---

## ✅ What Happens Next

### Immediately:
- ✅ New enrichments use new structure (reviews in /enriched)
- ✅ Old /raw files still work (backward compatible)
- ✅ Code checks /enriched first, falls back to /raw

### After 30 days:
- Old /raw files expire naturally (30-day TTL)
- OR manually delete them to free space immediately

### To Manually Clean Up /raw (Optional):

**⚠️ Only after verifying migration worked!**

```bash
# List all /raw files
aws s3 ls s3://YOUR-BUCKET/data/nail-salons/raw/ --recursive --endpoint-url=YOUR_R2_ENDPOINT

# Delete all /raw files (⚠️ irreversible!)
aws s3 rm s3://YOUR-BUCKET/data/nail-salons/raw/ --recursive --endpoint-url=YOUR_R2_ENDPOINT
```

---

## 🔍 How to Verify Migration

Pick a few salons and check their /enriched files:

```typescript
// Example: Check if reviews were migrated
const enriched = await getEnrichedDataFromR2(salon);
console.log('Reviews:', enriched.sourceReviews?.length);
// Should show review count if migrated
```

Or use R2 dashboard to inspect files manually.

---

## 🛡️ Safety Features

1. **No deletions:** Script only ADDS data, never removes
2. **Idempotent:** Safe to run multiple times (skips already-migrated)
3. **Backward compatible:** Code still reads /raw if /enriched missing reviews
4. **Error handling:** Continues even if individual files fail

---

## ❓ FAQ

**Q: What if migration fails halfway?**
A: Safe to re-run! Script skips already-migrated files.

**Q: Can I rollback?**
A: Yes! Old /raw files are untouched. Just don't delete them.

**Q: Will this break my site?**
A: No! Code checks both locations. Fully backward compatible.

**Q: When should I delete /raw files?**
A: After verifying migration worked and waiting at least 30 days (so TTL expires naturally).

**Q: What about salons with no /enriched file yet?**
A: They'll get new structure when enriched next time.

---

## 📈 Expected Results

**For 500 salons:**
- Before: 500 × 8 KB (/raw) + 500 × 4 KB (/enriched) = 6 MB
- After: 500 × 6 KB (/enriched only) = 3 MB
- **Saved: 3 MB (50%)**

**Cost savings:**
- Fewer PUT operations (Class A)
- Smaller files = less bandwidth
- Simpler codebase = easier maintenance

---

## 🐛 Troubleshooting

**Error: "Missing R2 credentials"**
```bash
# Check .env.local exists and has correct values
cat .env.local | grep R2_
```

**Error: "Permission denied"**
- Verify R2_ACCESS_KEY_ID has write permissions
- Check bucket name is correct

**Migration shows 0 files found**
- Verify you have /raw files in R2
- Check bucket name matches R2_BUCKET_NAME

---

Need help? Check the code in `scripts/migrate-raw-to-enriched.ts` for detailed implementation.
