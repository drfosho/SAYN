# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for the SAYN fitness app.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your project URL and anon key from Project Settings > API

## Environment Variables

Add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Database Setup

Run these SQL scripts in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

### 1. Enable UUID Extension

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";
```

### 2. Create Tables

Copy and paste this entire script into the SQL Editor:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  rank text default 'rookie',
  level integer default 1,
  xp integer default 0,
  power_points integer default 0,
  streak_days integer default 0,
  badge_type text check (badge_type in ('natural', 'enhanced', 'under_review')),
  is_verified_coach boolean default false,
  fitness_goals text[],
  experience_level text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create posts table
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text,
  caption text,
  post_type text check (post_type in ('daily_check_in', 'progress_update', 'peak_condition', 'just_sharing')),
  verification_status text check (verification_status in ('verified', 'not_verified')),
  verification_requested boolean default false,
  verification_confidence decimal,
  verification_details jsonb,
  comparison_enabled boolean default false,
  comparison_previous_post_id uuid references public.posts(id) on delete set null,
  comparison_feedback text,
  power_count integer default 0,
  comment_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create follows table
create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Create power_ups table
create table public.power_ups (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

-- Create achievements table
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_type text not null,
  earned_at timestamp with time zone default now()
);
```

### 3. Create Indexes for Performance

```sql
-- Indexes for better query performance
create index profiles_username_idx on public.profiles(username);
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index follows_follower_id_idx on public.follows(follower_id);
create index follows_following_id_idx on public.follows(following_id);
create index power_ups_post_id_idx on public.power_ups(post_id);
create index power_ups_user_id_idx on public.power_ups(user_id);
create index achievements_user_id_idx on public.achievements(user_id);
```

### 4. Enable Row Level Security (RLS)

```sql
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.power_ups enable row level security;
alter table public.achievements enable row level security;
```

### 5. Create RLS Policies

```sql
-- Profiles policies
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

create policy "Users can insert own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone"
  on follows for select
  using (true);

create policy "Users can follow others"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
  on follows for delete
  using (auth.uid() = follower_id);

-- Power ups policies
create policy "Power ups are viewable by everyone"
  on power_ups for select
  using (true);

create policy "Users can power up posts"
  on power_ups for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their power ups"
  on power_ups for delete
  using (auth.uid() = user_id);

-- Achievements policies
create policy "Achievements are viewable by everyone"
  on achievements for select
  using (true);
```

### 6. Create Helper Functions

```sql
-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_posts_updated_at
  before update on public.posts
  for each row execute procedure public.handle_updated_at();

-- Function to increment power count
create or replace function public.increment_power_count(post_id uuid)
returns void as $$
begin
  update public.posts
  set power_count = power_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- Function to decrement power count
create or replace function public.decrement_power_count(post_id uuid)
returns void as $$
begin
  update public.posts
  set power_count = greatest(power_count - 1, 0)
  where id = post_id;
end;
$$ language plpgsql security definer;
```

### 7. Create Storage Buckets

Go to Storage in your Supabase dashboard and create these buckets:

1. **avatars**
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

2. **post-images**
   - Public: Yes
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

### 8. Set Storage Policies

For the storage buckets, you can set policies via the dashboard or SQL:

#### Avatars Bucket Policies:

```sql
-- Allow public read access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
);

-- Allow users to update their own avatars
create policy "Users can update own avatars"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
create policy "Users can delete own avatars"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Post-images Bucket Policies:

```sql
-- Allow public read access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'post-images' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload post images"
on storage.objects for insert
with check (
  bucket_id = 'post-images'
  and auth.role() = 'authenticated'
);

-- Allow users to delete their own post images
create policy "Users can delete own post images"
on storage.objects for delete
using (
  bucket_id = 'post-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

## Verify Setup

After running all scripts, verify your setup:

1. Go to Table Editor in Supabase dashboard
2. You should see these tables:
   - profiles
   - posts
   - follows
   - power_ups
   - achievements

3. Go to Storage and verify:
   - avatars bucket
   - post-images bucket

4. Test in your app:
   - Sign up a new user
   - Upload a profile picture
   - Create a post
   - Follow another user
   - Power up a post

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all the table creation scripts
- Check that you're connected to the correct Supabase project

### "permission denied" errors
- Verify RLS policies are set correctly
- Make sure you're authenticated when making requests

### Image upload fails
- Check storage bucket permissions
- Verify MIME types are allowed
- Check file size limits

### Can't follow/power up
- Verify unique constraints are set
- Check RLS policies for follows and power_ups tables

## Migration from old schema

If you have an existing `user_profiles` table, you can migrate it:

```sql
-- Rename table
alter table user_profiles rename to profiles;

-- Update any references in foreign keys
-- (Your existing data should automatically update)
```

## Next Steps

1. Test authentication by signing up/logging in
2. Create a test profile
3. Upload a test post
4. Test follow/unfollow functionality
5. Test power up functionality

Your backend is now ready! 🚀
