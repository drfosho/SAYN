-- Migration: Add all missing columns to posts table
-- Run this in your Supabase SQL Editor if you're seeing "Could not find column" errors
-- This is a comprehensive migration that adds all columns referenced in the codebase

-- =====================================================
-- VERIFICATION COLUMNS
-- =====================================================

-- Add verification_confidence (decimal score 0-1)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS verification_confidence DECIMAL(3,2);

-- Add verification_details (JSON with AI response data)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS verification_details JSONB;

-- Add verification_requested if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS verification_requested BOOLEAN DEFAULT false;

-- Add verification_status if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS verification_status TEXT;

-- =====================================================
-- PROGRESS COMPARISON COLUMNS
-- =====================================================

-- Add comparison_enabled (whether post includes AI comparison)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS comparison_enabled BOOLEAN DEFAULT false;

-- Add comparison_previous_post_id (reference to compared post)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS comparison_previous_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;

-- Add comparison_feedback (AI-generated feedback)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS comparison_feedback TEXT;

-- =====================================================
-- TEXT POST COLUMNS
-- =====================================================

-- Add text_category for text-only posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS text_category TEXT;

-- =====================================================
-- CORE COLUMNS (ensure these exist)
-- =====================================================

-- Add post_type if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'just_sharing';

-- Add power_count if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS power_count INTEGER DEFAULT 0;

-- Add comment_count if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Add image_url if missing (nullable for text posts)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add caption if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS caption TEXT;

-- Add timestamps if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- CONSTRAINTS
-- =====================================================

-- Update verification_status constraint to match expected values
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_verification_status_check;

ALTER TABLE public.posts
ADD CONSTRAINT posts_verification_status_check
CHECK (verification_status IS NULL OR verification_status IN ('verified', 'not_verified'));

-- Update post_type constraint
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_post_type_check;

ALTER TABLE public.posts
ADD CONSTRAINT posts_post_type_check
CHECK (post_type IS NULL OR post_type IN ('daily_check_in', 'progress_update', 'peak_condition', 'just_sharing'));

-- =====================================================
-- INDEXES (for performance)
-- =====================================================

CREATE INDEX IF NOT EXISTS posts_verification_status_idx
ON public.posts(verification_status);

CREATE INDEX IF NOT EXISTS posts_comparison_previous_post_id_idx
ON public.posts(comparison_previous_post_id);

CREATE INDEX IF NOT EXISTS posts_comparison_enabled_idx
ON public.posts(comparison_enabled) WHERE comparison_enabled = true;

CREATE INDEX IF NOT EXISTS posts_post_type_idx
ON public.posts(post_type);

CREATE INDEX IF NOT EXISTS posts_text_category_idx
ON public.posts(text_category) WHERE text_category IS NOT NULL;

-- =====================================================
-- COMMENTS (documentation)
-- =====================================================

COMMENT ON COLUMN public.posts.verification_status IS 'AI verification result: verified (passed), not_verified (failed check), or null (not requested)';
COMMENT ON COLUMN public.posts.verification_confidence IS 'AI confidence score (0-1) for verification result';
COMMENT ON COLUMN public.posts.verification_details IS 'Detailed AI verification response data';
COMMENT ON COLUMN public.posts.verification_requested IS 'Whether user requested AI verification for this post';
COMMENT ON COLUMN public.posts.comparison_enabled IS 'Whether this post includes AI progress comparison';
COMMENT ON COLUMN public.posts.comparison_previous_post_id IS 'Reference to the previous progress post being compared to';
COMMENT ON COLUMN public.posts.comparison_feedback IS 'AI-generated feedback comparing the two photos';
COMMENT ON COLUMN public.posts.text_category IS 'Category for text-only posts';
COMMENT ON COLUMN public.posts.post_type IS 'Type of post: daily_check_in, progress_update, peak_condition, just_sharing';

-- =====================================================
-- VERIFY TABLE STRUCTURE
-- =====================================================

-- Run this to see all columns in the posts table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;
