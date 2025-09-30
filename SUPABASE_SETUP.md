# Supabase Setup Guide

This guide will help you set up Supabase for storing generated nail art images and prompts.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and enter project details:
   - Name: `nail-art-gallery`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"

## 2. Set up the Database

### Create the Gallery Items Table

1. Go to the SQL Editor in your Supabase dashboard
2. Run this SQL to create the gallery_items table:

```sql
-- Create the gallery_items table
CREATE TABLE gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  original_image_url TEXT,
  design_name TEXT,
  category TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for faster queries
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read gallery items
CREATE POLICY "Allow public read access" ON gallery_items
  FOR SELECT USING (true);

-- Create a policy that allows anyone to insert gallery items
CREATE POLICY "Allow public insert access" ON gallery_items
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to delete gallery items
CREATE POLICY "Allow public delete access" ON gallery_items
  FOR DELETE USING (true);
```

## 3. Set up Storage

### Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Name: `nail-art-images`
4. Make it **Public** (uncheck "Private bucket")
5. Click "Create bucket"

### Set Storage Policies

1. Go to Storage > Policies
2. Click "New Policy" for the `nail-art-images` bucket
3. Create these policies:

**Policy 1: Allow public read access**
```sql
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'nail-art-images');
```

**Policy 2: Allow public upload access**
```sql
CREATE POLICY "Allow public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nail-art-images');
```

**Policy 3: Allow public delete access**
```sql
CREATE POLICY "Allow public delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'nail-art-images');
```

## 4. Get Your Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon/Public Key** (starts with `eyJ`)

## 5. Update Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials:

```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. Install Supabase Dependencies

Run this command in your project directory:

```bash
npm install @supabase/supabase-js
```

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Go to the Try-On page and generate a nail art image
3. Click "Save to Gallery"
4. Go to the Gallery page to see your saved images

## Troubleshooting

### Common Issues:

1. **"Failed to save to gallery"** - Check that your Supabase URL and key are correct
2. **Images not loading** - Ensure the storage bucket is public and policies are set correctly
3. **Database errors** - Verify the table was created correctly and RLS policies are in place

### Useful Supabase Dashboard Links:

- **Database**: [Your Project] > Database > Tables
- **Storage**: [Your Project] > Storage > nail-art-images
- **API Docs**: [Your Project] > API > REST API
- **Logs**: [Your Project] > Logs

## Security Notes

- The current setup allows public access to all gallery items
- For production, consider implementing user authentication
- You may want to add rate limiting for uploads
- Consider adding image size limits and validation

