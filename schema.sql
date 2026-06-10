-- SQL Setup Script for Stash Supabase Database
-- Paste this script inside the Supabase SQL Editor to set up your tables instantly.

-- 1. Create items table
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'link')),
    title TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    favicon TEXT,
    category TEXT NOT NULL,
    "extractedText" TEXT,
    summary TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'ready')) DEFAULT 'ready',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policy for Authenticated/Anonymous Users (supports unconfirmed sessions)
CREATE POLICY "Users can only access their own items" 
ON public.items 
FOR ALL 
TO public 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Enable Realtime (Optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

-- ----------------------------------------------------
-- STORAGE BUCKETS SETUP GUIDE
-- ----------------------------------------------------
-- Please perform these steps in your Supabase Dashboard:
-- 1. Go to the "Storage" tab in the left-hand navigation.
-- 2. Click "New Bucket" and name it exactly: screenshots
-- 3. Make sure the bucket is set to PUBLIC (so public CDN links work).
-- 4. In the screenshot bucket policies, click "New Policy" -> "Allowed to everyone"
--    - Select "Insert", "Select", "Update", and "Delete" actions.
--    - Setting policies to "Allowed to everyone" (public/anonymous access) is highly recommended
--      for local development to prevent unconfirmed auth states from blocking storage uploads.
