# Deployment Guide - Unified Bucket Migration

## 🚀 Ready for Production Deployment

Your unified bucket migration is complete and ready for production! Here's what you need to do:

## 📋 Pre-Deployment Checklist

### ✅ Completed:
- [x] Unified bucket created (`nail-art-unified`)
- [x] Custom domain configured (`cdn.nailartai.app`)
- [x] All files migrated (1,167 files, 1.66 GB)
- [x] Code updated for unified bucket
- [x] Environment variables updated
- [x] Testing files cleaned up

## 🔧 CloudFlare Configuration

### 1. Verify Custom Domain
- Go to **CloudFlare R2 Dashboard**
- Navigate to **nail-art-unified** bucket
- Check **Settings** → **Custom Domains**
- Ensure `cdn.nailartai.app` is **Active**

### 2. Configure Caching (Recommended)
- Go to **Caching** → **Configuration**
- Create caching rule:
  - **Rule Name**: `R2 Images Cache`
  - **When**: `Hostname equals cdn.nailartai.app AND URI Path contains .jpg OR .png OR .jpeg`
  - **Then**: Cache level = **Cache Everything**
  - **Edge TTL**: 1 month
  - **Browser TTL**: 1 year

### 3. Verify SSL Certificate
- Go to **SSL/TLS** → **Edge Certificates**
- Ensure `cdn.nailartai.app` shows **Active** status

## 🚀 Vercel Deployment

### 1. Update Environment Variables
In your Vercel dashboard:
- Go to **Settings** → **Environment Variables**
- Update `R2_PUBLIC_URL` to: `https://cdn.nailartai.app`
- Ensure all other R2 variables are set

### 2. Deploy to Vercel
```bash
# Commit your changes
git add .
git commit -m "feat: migrate to unified bucket with custom domain"

# Push to trigger deployment
git push origin main
```

### 3. Verify Deployment
After deployment, test:
- [ ] Images load from `cdn.nailartai.app`
- [ ] API endpoints work correctly
- [ ] No 404 errors in browser console
- [ ] Performance is good

## 🧪 Testing Checklist

### Test These URLs:
- [ ] `https://cdn.nailartai.app/data/categories.json`
- [ ] `https://cdn.nailartai.app/images/[any-image].jpg`
- [ ] Your application's image gallery
- [ ] API endpoints that serve data

### Monitor For:
- [ ] 404 errors
- [ ] Slow loading times
- [ ] SSL certificate issues
- [ ] CDN cache performance

## 🧹 Cleanup (After Successful Deployment)

### 1. Delete Old Buckets (Optional)
Once you've verified everything works:
- Delete `nail-art-images` bucket
- Delete `nail-art-data` bucket
- Remove old domains from Next.js config (optional)

### 2. Update Documentation
- Update any hardcoded URLs in documentation
- Update API documentation if needed

## 🎯 Expected Results

After deployment, you should see:
- ✅ **Faster loading times** (unified CDN)
- ✅ **Professional URLs** (`cdn.nailartai.app`)
- ✅ **Lower costs** (single bucket)
- ✅ **Better performance** (optimized caching)
- ✅ **Easier management** (single bucket)

## 🆘 Troubleshooting

### If Images Don't Load:
1. Check CloudFlare custom domain status
2. Verify SSL certificate is active
3. Check DNS propagation
4. Test direct URL access

### If API Errors:
1. Verify environment variables in Vercel
2. Check R2 bucket permissions
3. Test with curl commands

### If Performance Issues:
1. Check CloudFlare caching rules
2. Monitor CDN cache hit rates
3. Verify image optimization settings

## 📞 Support

If you encounter any issues:
1. Check CloudFlare R2 dashboard for bucket status
2. Verify DNS configuration
3. Test with the provided curl commands
4. Check Vercel deployment logs

---

**Status**: ✅ **READY FOR DEPLOYMENT**
**Next Action**: Update Vercel environment variables and deploy
