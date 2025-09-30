-- Supabase Database Setup for Nail Art Gallery
-- Run this in your Supabase SQL Editor

-- 1. Create the gallery_items table
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

-- 2. Create an index on created_at for faster queries
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public access
CREATE POLICY "Allow public read access" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON gallery_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON gallery_items
  FOR DELETE USING (true);

-- 5. Create storage policies for nail-art-images bucket
-- (Run these after creating the storage bucket)

-- Policy 1: Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'nail-art-images');

-- Policy 2: Allow public upload access  
CREATE POLICY "Allow public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nail-art-images');

-- Policy 3: Allow public delete access
CREATE POLICY "Allow public delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'nail-art-images');

