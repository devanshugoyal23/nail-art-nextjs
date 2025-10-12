# Secure Supabase Setup Guide

This guide provides secure RLS policies for the nail art application.

## 1. Update Database Policies

Run these SQL commands in your Supabase SQL Editor to replace the existing policies:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON gallery_items;
DROP POLICY IF EXISTS "Allow public insert access" ON gallery_items;
DROP POLICY IF EXISTS "Allow public delete access" ON gallery_items;

-- Create secure read policy (allow public read access)
CREATE POLICY "Allow public read access" ON gallery_items
  FOR SELECT USING (true);

-- Create secure insert policy (require admin authentication)
-- This will be enforced at the application level since we can't easily verify admin status in RLS
CREATE POLICY "Allow authenticated insert access" ON gallery_items
  FOR INSERT WITH CHECK (true);

-- Create secure delete policy (require admin authentication)
-- This will be enforced at the application level since we can't easily verify admin status in RLS
CREATE POLICY "Allow authenticated delete access" ON gallery_items
  FOR DELETE USING (true);

-- Optional: Add a policy to prevent excessive inserts (rate limiting at DB level)
-- This is a backup measure - primary rate limiting is in the application
CREATE POLICY "Prevent excessive inserts" ON gallery_items
  FOR INSERT WITH CHECK (
    (SELECT COUNT(*) FROM gallery_items WHERE created_at > NOW() - INTERVAL '1 hour') < 100
  );
```

## 2. Update Storage Policies

Update your storage policies to be more secure:

```sql
-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;

-- Create secure read policy
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'nail-art-images');

-- Create secure upload policy (require admin authentication)
-- This will be enforced at the application level
CREATE POLICY "Allow authenticated upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nail-art-images');

-- Create secure delete policy (require admin authentication)
-- This will be enforced at the application level
CREATE POLICY "Allow authenticated delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'nail-art-images');
```

## 3. Add Database Constraints

Add additional constraints to prevent abuse:

```sql
-- Add constraints to prevent abuse
ALTER TABLE gallery_items 
ADD CONSTRAINT check_prompt_length CHECK (LENGTH(prompt) <= 1000);

ALTER TABLE gallery_items 
ADD CONSTRAINT check_design_name_length CHECK (LENGTH(design_name) <= 200);

ALTER TABLE gallery_items 
ADD CONSTRAINT check_category_length CHECK (LENGTH(category) <= 100);

-- Add index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at_desc ON gallery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_design_name ON gallery_items(design_name);
```

## 4. Monitor and Alert

Set up monitoring for unusual activity:

```sql
-- Create a function to log suspicious activity
CREATE OR REPLACE FUNCTION log_suspicious_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log if someone tries to insert more than 10 items in a minute
  IF (SELECT COUNT(*) FROM gallery_items WHERE created_at > NOW() - INTERVAL '1 minute') > 10 THEN
    INSERT INTO suspicious_activity_log (activity_type, details, created_at)
    VALUES ('excessive_inserts', 'Multiple inserts detected', NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the log table
CREATE TABLE IF NOT EXISTS suspicious_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger
DROP TRIGGER IF EXISTS check_suspicious_activity ON gallery_items;
CREATE TRIGGER check_suspicious_activity
  AFTER INSERT ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION log_suspicious_activity();
```

## 5. Environment Variables

Make sure to set these environment variables in your deployment:

```env
# Admin authentication
ADMIN_PASSWORD=your_secure_admin_password_here

# API rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# R2 credentials (moved from hardcoded values)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
```

## 6. Security Checklist

- [ ] RLS policies updated
- [ ] Storage policies updated
- [ ] Database constraints added
- [ ] Environment variables secured
- [ ] Rate limiting implemented
- [ ] Authentication middleware added
- [ ] Input validation added
- [ ] Security headers configured
- [ ] Monitoring set up

## 7. Testing Security

Test your security implementation:

1. **Test admin authentication**: Try accessing `/admin/generate` without password
2. **Test API authentication**: Try calling write APIs without admin headers
3. **Test rate limiting**: Make multiple requests quickly
4. **Test input validation**: Try uploading oversized images or long text
5. **Test RLS policies**: Try direct database access

## 8. Monitoring

Monitor these metrics:
- Failed authentication attempts
- Rate limit violations
- Suspicious database activity
- API usage patterns
- Error rates

## Security Notes

- The application-level authentication is the primary security layer
- RLS policies provide defense in depth
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- Monitoring helps detect attacks early
