# Supabase MCP Server Setup Guide

## Current Project Configuration

Your Supabase project is already configured with:
- **Project Reference**: `ccrarmffjbvkggrtktyy`
- **Project URL**: `https://ccrarmffjbvkggrtktyy.supabase.co`
- **Access Token**: Configured in `.cursor/mcp.json`

## Next Steps to Complete Setup

### 1. Get Your Supabase Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (ccrarmffjbvkggrtktyy)
3. Navigate to **Settings** > **API**
4. Copy the **anon/public** key (starts with `eyJ`)
5. Update your `.env.local` file with the actual key

### 2. Set Up Database Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create the gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
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
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY IF NOT EXISTS "Allow public read access" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert access" ON gallery_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public delete access" ON gallery_items
  FOR DELETE USING (true);
```

### 3. Set Up Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **"Create a new bucket"**
3. Name: `nail-art-images`
4. **⚠️ IMPORTANT**: Uncheck "Private bucket" (make it public)
5. Click **Create bucket**

### 4. Set Storage Policies

Go to **Storage** > **Policies** and create these policies for the `nail-art-images` bucket:

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

### 5. Test the Setup

1. Update your `.env.local` with the correct anon key
2. Start your development server: `npm run dev`
3. Go to the Try-On page and generate a nail art image
4. Click "Save to Gallery"
5. Check the Gallery page to see your saved images

## MCP Server Integration

The MCP server is configured in `.cursor/mcp.json` and should allow you to:

- Query your database using natural language
- Manage tables and schemas
- Execute SQL commands
- View logs and debug issues

## Troubleshooting

If you encounter issues:

1. **MCP Server not working**: Restart Cursor to reload the MCP configuration
2. **Database errors**: Check the Supabase logs in your dashboard
3. **Storage issues**: Verify the bucket is public and policies are set
4. **Environment issues**: Ensure your `.env.local` has the correct anon key

## Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Your Project](https://supabase.com/dashboard/project/ccrarmffjbvkggrtktyy)
- [API Documentation](https://supabase.com/dashboard/project/ccrarmffjbvkggrtktyy/api)
- [Storage Management](https://supabase.com/dashboard/project/ccrarmffjbvkggrtktyy/storage)
