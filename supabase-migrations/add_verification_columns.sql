-- Migration: Add AI verification columns to posts table
-- Run this in your Supabase SQL Editor if you already have an existing posts table

-- Step 1: Add new columns
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS verification_confidence decimal,
ADD COLUMN IF NOT EXISTS verification_details jsonb,
ADD COLUMN IF NOT EXISTS post_type text check (post_type in ('daily_check_in', 'progress_update', 'peak_condition', 'just_sharing'));

-- Step 2: Update verification_status constraint to match new values
-- First, drop the old constraint
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_verification_status_check;

-- Then add the new constraint
ALTER TABLE public.posts
ADD CONSTRAINT posts_verification_status_check
CHECK (verification_status in ('verified', 'not_verified'));

-- Step 3: Update existing data (optional - only if you have existing posts with old status values)
-- Convert 'pending' and 'rejected' to 'not_verified'
UPDATE public.posts
SET verification_status = 'not_verified'
WHERE verification_status IN ('pending', 'rejected');

-- Step 4: Create index for verification queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS posts_verification_status_idx ON public.posts(verification_status);

COMMENT ON COLUMN public.posts.verification_status IS 'AI verification result: verified (passed), not_verified (failed check), or null (not requested)';
COMMENT ON COLUMN public.posts.verification_confidence IS 'AI confidence score (0-1) for verification result';
COMMENT ON COLUMN public.posts.verification_details IS 'Detailed AI verification response data';
