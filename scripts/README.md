# 🎨 Pinterest Image Optimization Scripts

This directory contains scripts for optimizing your nail art images for Pinterest.

## 📁 Scripts Overview

### 1. `generate-pinterest-optimized.js`
**Safe pre-generation script** that creates Pinterest-optimized (1000x1500) versions of all images without touching originals.

### 2. Usage Instructions

## 🚀 Quick Start

### Step 1: Test with a Small Batch
```bash
# Test with 10 images (safe dry run)
node scripts/generate-pinterest-optimized.js --test --dry-run

# Test with 10 images (actually process)
node scripts/generate-pinterest-optimized.js --test
```

### Step 2: Run Full Migration
```bash
# Full migration (recommended)
node scripts/generate-pinterest-optimized.js

# With custom batch size
node scripts/generate-pinterest-optimized.js --batch=5

# Dry run to see what would happen
node scripts/generate-pinterest-optimized.js --dry-run
```

## ⚙️ Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--test` | Process only 10 images for testing | `--test` |
| `--dry-run` | Simulate processing without uploading | `--dry-run` |
| `--batch=N` | Set custom batch size (default: 10) | `--batch=5` |

## 📊 What the Script Does

### ✅ Safe Operations
- ✅ **Never deletes** original images
- ✅ **Skips** already processed images (resumable)
- ✅ **Creates new files** with `pinterest-optimized-` prefix
- ✅ **Detailed logging** and progress tracking
- ✅ **Error handling** with retry logic

### 🔄 Processing Flow
1. **Fetch** all gallery items from database
2. **Check** if Pinterest version already exists (skip if yes)
3. **Download** original image from R2
4. **Resize** to exact 1000x1500 pixels using Sharp
5. **Upload** Pinterest version with metadata
6. **Log** progress and continue

### 📁 File Naming Convention
```
Original:  nail-art-12345.jpg
Pinterest: pinterest-optimized-nail-art-12345.jpg
```

## 📈 Expected Results

### Before Migration
```
Pinterest Extension → Small/wrong images → Poor engagement
API calls → On-demand processing → 2-3s delay
```

### After Migration  
```
Pinterest Extension → Perfect 1000x1500 images → ⚡ Instant + Great engagement
API calls → Pre-generated files → <100ms response
```

## 🛠️ Troubleshooting

### Common Issues

**Script fails to start:**
```bash
# Make sure you're in the project root
cd /path/to/nail-art-nextjs
npm install
node scripts/generate-pinterest-optimized.js --test
```

**Images not found:**
- Check R2 connection in environment variables
- Verify `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`

**Sharp/image processing errors:**
```bash
# Reinstall Sharp
npm uninstall sharp
npm install sharp
```

**Database connection issues:**
- Verify Supabase credentials in `.env.local`
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Monitoring Progress

The script provides detailed logs:
```
✅ 2024-01-15T10:30:00.000Z Created Pinterest version: pinterest-optimized-nail-art-12345.jpg
📊 Progress: 145/1167 processed, 23 skipped, 2 errors
⏱️  Time: 120s elapsed, ~18min remaining, 72.5/min
```

### Resuming Interrupted Runs

The script is **resumable** - it automatically skips already processed images:
```
⏭️  2024-01-15T10:30:00.000Z Already optimized: Gold Glitter Nails
```

## 📋 Migration Checklist

### Pre-Migration
- [ ] Run test with `--test --dry-run` 
- [ ] Verify R2 and database connections
- [ ] Check available storage space (doubles current usage)
- [ ] Backup environment variables

### During Migration  
- [ ] Monitor logs for errors
- [ ] Check R2 storage dashboard
- [ ] Test Pinterest Chrome extension on a few pages
- [ ] Verify meta tags are working

### Post-Migration
- [ ] Test Pinterest sharing extensively
- [ ] Monitor Pinterest engagement metrics
- [ ] Check Google PageSpeed (should improve)
- [ ] Consider cleaning up originals (after 1-2 weeks)

## 💰 Cost Implications

**Storage Increase:**
- Current: ~1.66 GB
- After: ~3.32 GB (doubled)
- Cost: ~$0.05/month (negligible)

**Processing Savings:**
- Eliminates on-demand function calls
- Reduces R2 API requests
- Improves Pinterest engagement significantly

## 🎯 Next Steps After Migration

1. **Monitor Results**: Use Pinterest Analytics to track improvements
2. **Update Meta Tags**: Script automatically handles fallback system
3. **Test Extensively**: Verify Chrome extension works perfectly
4. **Optional Cleanup**: Delete originals after confirming success (1-2 weeks)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the detailed logs
3. Run with `--test --dry-run` to debug safely
4. Re-run the script - it's safe and resumable
