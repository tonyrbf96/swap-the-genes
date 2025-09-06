-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public images" ON storage.objects;

-- Create simplified policies that work with the folder structure
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-images' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-images' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-images' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Allow public read access to all images in the bucket
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images');