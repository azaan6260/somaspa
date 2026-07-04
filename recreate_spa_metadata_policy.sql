-- SQL Script to safely recreate Row Level Security (RLS) policies for spa_metadata table
-- Run this script in your Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor)

-- 1. Ensure Row Level Security (RLS) is enabled on the table
ALTER TABLE public.spa_metadata ENABLE ROW LEVEL SECURITY;

-- 2. Safely drop the existing policy if it already exists
DROP POLICY IF EXISTS "Allow public read-write access to spa_metadata" ON public.spa_metadata;

-- 3. Create the fresh permissive policy allowing read-write access to public users
CREATE POLICY "Allow public read-write access to spa_metadata" 
    ON public.spa_metadata
    AS PERMISSIVE 
    FOR ALL 
    TO public 
    USING (true) 
    WITH CHECK (true);

-- 4. Verify policies currently applied to public.spa_metadata (optional debug query)
-- SELECT * FROM pg_policies WHERE tablename = 'spa_metadata';
