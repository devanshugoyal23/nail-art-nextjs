# Admin Panel Setup Guide

## 🚀 Quick Start

This guide will help you set up and troubleshoot the `/admin/generate` page and content management features.

## ⚠️ Common Issues and Solutions

### Issue 1: "GEMINI_API_KEY is not configured correctly"

**Cause**: The Gemini API key is missing or not properly configured in your `.env.local` file.

**Solution**:
1. Open the `.env.local` file in the project root directory
2. Find the line: `GEMINI_API_KEY=your_gemini_api_key_here`
3. Replace `your_gemini_api_key_here` with your actual Gemini API key
4. Get your API key from: https://makersuite.google.com/app/apikey
5. Save the file and restart the development server:
   ```bash
   npm run dev
   ```

### Issue 2: Category or Tag Creation Not Working

**Cause**: Missing environment variables or API configuration issues.

**Solution**:
1. Verify all required environment variables are set in `.env.local`:
   - `GEMINI_API_KEY` - For AI content generation
   - `NEXT_PUBLIC_SUPABASE_URL` - For database access
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For database authentication
   - `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` - For image storage

2. Check the browser console for detailed error messages
3. Check the server logs for API errors
4. Ensure Supabase database is accessible and has the correct schema

### Issue 3: Generation Functions Not Responding

**Cause**: API timeouts or network issues.

**Solution**:
1. Check your internet connection
2. Verify Gemini API quota hasn't been exceeded
3. Check server logs for timeout errors
4. Try generating fewer items at a time
5. Ensure the Gemini API key has proper permissions

## 📋 Complete Setup Checklist

### 1. Environment Variables Setup

Create or update `.env.local` in the project root with these variables:

```bash
# Required for content generation
GEMINI_API_KEY=your_actual_gemini_api_key

# Required for database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for image storage
R2_ENDPOINT=your_r2_endpoint
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_PUBLIC_URL=your_r2_public_url

# Required for site configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Admin Panel

Navigate to: `http://localhost:3000/admin/generate`

## 🎨 Admin Panel Features

### Generate Content Tab
- **Generate Nail Art**: Create nail art designs for specific categories or tiers
- **Quick Generation**: Pre-configured buttons for popular categories
- **Custom Prompts**: Generate designs with custom descriptions
- **Tier Selection**: Target specific priority tiers for strategic content creation

### Tag Generation Tab
- **Generate for Specific Tags**: Target under-populated tags
- **Fix Empty Tag Pages**: Automatically populate all empty tag pages
- **Refresh Tag List**: Update the list of tags needing content

### Impact Analysis Tab
- **Category Impact**: Analyze how new content will affect categories
- **SEO Thresholds**: See which categories will reach SEO-friendly thresholds
- **Tag Detection**: Automatically detect new tags from prompts

### Content Management Page
Features available at `/admin/content-management`:
- **Fill Content Gaps**: Auto-generate content for empty categories
- **Distribute Evenly**: Balance content across all categories
- **High Priority Generation**: Focus on critical content gaps
- **Consolidate Tags**: Merge similar categories
- **Tag-Specific Generation**: Generate content for specific tags
- **Editorial Content**: Generate editorial descriptions and tutorials

## 🔍 Testing the Setup

### Test 1: Generate Simple Content
1. Go to `/admin/generate`
2. Select a category (e.g., "Red Nails")
3. Set count to 1
4. Click "Generate Nail Art"
5. Wait for generation to complete
6. Verify the result appears in the "Generated Results" section

### Test 2: Create Categories
1. Go to `/admin/content-management`
2. Click "Fill Content Gaps"
3. Wait for the process to complete
4. Check the "Content Gaps Analysis" section for updates

### Test 3: Generate for Tags
1. Go to `/admin/generate`
2. Switch to "Tag Generation" tab
3. Select a tag from the dropdown
4. Set count to 3
5. Click "Generate for Tag"
6. Verify results appear

## 🐛 Debugging Tips

### View Server Logs
```bash
# In your terminal where you ran `npm run dev`
# Look for error messages starting with "Error in..."
```

### View Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed API requests

### Check Environment Variables
```bash
# In your terminal
node -e "console.log(process.env.GEMINI_API_KEY)"
```

### Verify Database Connection
1. Go to Supabase Dashboard
2. Check if your database is online
3. Verify API keys are correct
4. Check if `gallery_items` table exists

## 📝 API Endpoints Reference

### Generate Gallery
- **Endpoint**: `/api/generate-gallery`
- **Method**: POST
- **Required**: `category` or `customPrompt`
- **Optional**: `count`, `tier`

### Auto Generate Content
- **Endpoint**: `/api/auto-generate-content`
- **Method**: POST
- **Actions**:
  - `get-under-populated-tags` - Get tags needing content
  - `generate-for-tag` - Generate content for specific tag
  - `generate-for-tag-pages` - Fix all empty tag pages
  - `analyze-category-impact` - Analyze category impact
  - `fill-gaps` - Fill content gaps
  - `distribute-evenly` - Distribute content evenly
  - `auto-generate-high-priority` - Generate high-priority content

## 🆘 Support

If you're still experiencing issues after following this guide:

1. Check that all environment variables are correctly set
2. Verify your Gemini API key is valid and has quota available
3. Ensure Supabase database is accessible
4. Check server logs for detailed error messages
5. Review browser console for client-side errors

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure and private
- Use environment variables for all sensitive data
- Set a strong `ADMIN_PASSWORD` for production
- Regularly rotate API keys

## 📚 Additional Resources

- Gemini API Documentation: https://ai.google.dev/docs
- Supabase Documentation: https://supabase.com/docs
- Cloudflare R2 Documentation: https://developers.cloudflare.com/r2/
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
