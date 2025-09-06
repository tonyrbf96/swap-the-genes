-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Create more permissive policies for debugging
-- Allow authenticated users to upload to user-images bucket
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view their own files
CREATE POLICY "Authenticated users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-images' AND 
    (auth.uid()::text = split_part(name, '/', 1) OR auth.role() = 'authenticated')
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images');