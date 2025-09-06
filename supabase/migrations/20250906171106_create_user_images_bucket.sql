-- Create the user-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true);

-- Set up RLS policies for the user-images bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to images (optional - remove if you want private images)
CREATE POLICY "Anyone can view public images" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images');