# 🚀 Supabase Implementation Guide

## ✅ **Step 1: Environment Setup**

### Create Environment File
```bash
# Run the setup script
./setup-env.sh

# Or manually create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=https://nail-art-gallery.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## ✅ **Step 2: Database Setup**

### 1. Go to Supabase Dashboard
- Navigate to: [supabase.com/dashboard](https://supabase.com/dashboard)
- Select your `nail-art-gallery` project

### 2. Create Database Table
- Go to **SQL Editor**
- Copy and paste the contents of `supabase-setup.sql`
- Click **Run** to execute

### 3. Verify Table Creation
- Go to **Database > Tables**
- You should see `gallery_items` table

## ✅ **Step 3: Storage Setup**

### 1. Create Storage Bucket
- Go to **Storage** in Supabase dashboard
- Click **"Create a new bucket"**
- Name: `nail-art-images`
- **⚠️ IMPORTANT**: Uncheck "Private bucket" (make it public)
- Click **Create bucket**

### 2. Set Storage Policies
- Go to **Storage > Policies**
- Click **"New Policy"** for `nail-art-images` bucket
- Create these 3 policies (one by one):

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'nail-art-images');
```

**Policy 2: Public Upload Access**
```sql
CREATE POLICY "Allow public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nail-art-images');
```

**Policy 3: Public Delete Access**
```sql
CREATE POLICY "Allow public delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'nail-art-images');
```

## ✅ **Step 4: Get Your Credentials**

### 1. Go to Settings > API
- Copy **Project URL**: `https://nail-art-gallery.supabase.co`
- Copy **Anon/Public Key**: `eyJ...` (starts with eyJ)

### 2. Update .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://nail-art-gallery.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## ✅ **Step 5: Test the Implementation**

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Gallery Functionality
1. Go to `http://localhost:3000/try-on`
2. Upload an image and generate nail art
3. Click **"Save to Gallery"**
4. Go to `http://localhost:3000/gallery`
5. Verify your image appears in the gallery

## 🔧 **Troubleshooting**

### Common Issues:

1. **"Failed to save to gallery"**
   - Check `.env.local` has correct Supabase URL and key
   - Verify database table exists
   - Check Supabase logs

2. **Images not loading**
   - Ensure storage bucket is public
   - Verify storage policies are set
   - Check image URLs in database

3. **Database errors**
   - Verify `gallery_items` table exists
   - Check RLS policies are enabled
   - Review Supabase logs

### Useful Dashboard Links:
- **Database**: Dashboard > Database > Tables
- **Storage**: Dashboard > Storage > nail-art-images  
- **Logs**: Dashboard > Logs
- **API**: Dashboard > Settings > API

## 🎯 **Verification Checklist**

- [ ] `.env.local` created with correct credentials
- [ ] `gallery_items` table created in database
- [ ] `nail-art-images` storage bucket created (public)
- [ ] Storage policies set up (3 policies)
- [ ] App runs without errors (`npm run dev`)
- [ ] Can save images to gallery
- [ ] Gallery page displays saved images
- [ ] Can delete images from gallery

## 🚀 **Next Steps**

Once everything is working:
1. Test with multiple images
2. Verify prompt storage
3. Check image quality
4. Test on mobile devices
5. Consider adding user authentication for production

---

**Need Help?** Check the Supabase logs in your dashboard for detailed error messages.


