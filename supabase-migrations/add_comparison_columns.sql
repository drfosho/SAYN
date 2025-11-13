-- Migration: Add AI Progress Comparison columns to posts table
-- Run this in your Supabase SQL Editor if you already have an existing posts table

-- Step 1: Add new columns
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS comparison_enabled boolean default false,
ADD COLUMN IF NOT EXISTS comparison_previous_post_id uuid references public.posts(id) on delete set null,
ADD COLUMN IF NOT EXISTS comparison_feedback text;

-- Step 2: Create index for comparison queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS posts_comparison_previous_post_id_idx ON public.posts(comparison_previous_post_id);
CREATE INDEX IF NOT EXISTS posts_comparison_enabled_idx ON public.posts(comparison_enabled) WHERE comparison_enabled = true;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN public.posts.comparison_enabled IS 'Whether this post includes AI progress comparison';
COMMENT ON COLUMN public.posts.comparison_previous_post_id IS 'Reference to the previous progress post being compared to';
COMMENT ON COLUMN public.posts.comparison_feedback IS 'AI-generated feedback comparing the two photos';
