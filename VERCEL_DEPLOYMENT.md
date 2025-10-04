# Vercel Deployment Guide

## Required Environment Variables

Set these in your Vercel project settings:

### 1. Gemini AI API Key
```
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 2. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

### 3. Optional: Site URL
```
NEXT_PUBLIC_SITE_URL=https://nailartai.app
```

## Deployment Steps

1. **Connect your GitHub repository to Vercel**
2. **Set the environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy
4. **Test your deployment** by visiting the gallery and try-on pages

## Build Configuration

- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## Troubleshooting

### Common Issues:
1. **Build fails**: Check environment variables are set correctly
2. **Images not loading**: Verify Supabase storage bucket is public
3. **API errors**: Ensure all environment variables are configured

### Environment Variable Sources:
- **Gemini API Key**: Get from Google AI Studio
- **Supabase URL/Key**: Get from Supabase Dashboard → Settings → API
