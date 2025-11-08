# SAYN Supabase Database Setup

Complete database schema and setup instructions for the SAYN authentication and user management system.

## Prerequisites

1. A Supabase project (you already have one configured)
2. Access to the Supabase SQL Editor
3. Environment variables set in `.env` file

## Database Tables

### 1. User Profiles Table

This table extends Supabase Auth users with profile information.

```sql
-- Create user_profiles table
create table public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  display_name text not null,
  bio text default '',
  location text default '',
  avatar_url text default '',
  fitness_goals text[] default array[]::text[],
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced', 'expert')) default 'beginner',
  athlete_type text check (athlete_type in ('natural', 'enhanced', 'prefer_not_to_say')) default null,

  -- Gamification stats
  level integer default 1,
  xp integer default 0,
  total_power_ups integer default 0,
  streak_days integer default 0,

  -- Badge system
  badge text check (badge in ('natural', 'enhanced', 'under_review')) default null,
  badge_verified_at timestamptz default null,

  -- Counters (can be updated via triggers or manually)
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 20),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- RLS Policies for user_profiles

-- Allow users to view all profiles
create policy "Public profiles are viewable by everyone"
  on user_profiles for select
  using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Create indexes for performance
create index user_profiles_username_idx on public.user_profiles(username);
create index user_profiles_athlete_type_idx on public.user_profiles(athlete_type);
create index user_profiles_level_idx on public.user_profiles(level);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();
```

### 2. Followers Table

Tracks follow relationships between users.

```sql
-- Create followers table
create table public.followers (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.user_profiles(id) on delete cascade not null,
  following_id uuid references public.user_profiles(id) on delete cascade not null,
  created_at timestamptz default now(),

  constraint no_self_follow check (follower_id != following_id),
  constraint unique_follow unique (follower_id, following_id)
);

-- Enable Row Level Security
alter table public.followers enable row level security;

-- RLS Policies for followers

-- Allow users to view all follow relationships
create policy "Follow relationships are viewable by everyone"
  on followers for select
  using (true);

-- Allow users to create follow relationships where they are the follower
create policy "Users can follow others"
  on followers for insert
  with check (auth.uid() = follower_id);

-- Allow users to delete their own follow relationships
create policy "Users can unfollow"
  on followers for delete
  using (auth.uid() = follower_id);

-- Create indexes
create index followers_follower_id_idx on public.followers(follower_id);
create index followers_following_id_idx on public.followers(following_id);

-- Function to update follower counts
create or replace function public.handle_follower_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    -- Increment follower count for the user being followed
    update public.user_profiles
    set followers_count = followers_count + 1
    where id = new.following_id;

    -- Increment following count for the follower
    update public.user_profiles
    set following_count = following_count + 1
    where id = new.follower_id;

    return new;
  elsif (tg_op = 'DELETE') then
    -- Decrement follower count
    update public.user_profiles
    set followers_count = followers_count - 1
    where id = old.following_id;

    -- Decrement following count
    update public.user_profiles
    set following_count = following_count - 1
    where id = old.follower_id;

    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger handle_follower_count_trigger
  after insert or delete on public.followers
  for each row
  execute function public.handle_follower_count();
```

### 3. Posts Table (Optional - for future use)

```sql
-- Create posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  content text,
  image_url text,
  power_level integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- RLS Policies for posts

-- Allow everyone to view posts
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

-- Allow users to create their own posts
create policy "Users can create their own posts"
  on posts for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own posts
create policy "Users can update their own posts"
  on posts for update
  using (auth.uid() = user_id);

-- Allow users to delete their own posts
create policy "Users can delete their own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- Create indexes
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- Trigger to update updated_at
create trigger handle_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();
```

### 4. Power Ups Table (Optional - for future use)

```sql
-- Create power_ups table
create table public.power_ups (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  created_at timestamptz default now(),

  constraint unique_power_up unique (post_id, user_id)
);

-- Enable Row Level Security
alter table public.power_ups enable row level security;

-- RLS Policies for power_ups

-- Allow everyone to view power ups
create policy "Power ups are viewable by everyone"
  on power_ups for select
  using (true);

-- Allow users to power up posts
create policy "Users can power up posts"
  on power_ups for insert
  with check (auth.uid() = user_id);

-- Allow users to remove their power ups
create policy "Users can remove their power ups"
  on power_ups for delete
  using (auth.uid() = user_id);

-- Create indexes
create index power_ups_post_id_idx on public.power_ups(post_id);
create index power_ups_user_id_idx on public.power_ups(user_id);

-- Function to update power level on posts
create or replace function public.handle_power_level()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts
    set power_level = power_level + 1
    where id = new.post_id;

    update public.user_profiles
    set total_power_ups = total_power_ups + 1
    where id = (select user_id from public.posts where id = new.post_id);

    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts
    set power_level = power_level - 1
    where id = old.post_id;

    update public.user_profiles
    set total_power_ups = total_power_ups - 1
    where id = (select user_id from public.posts where id = old.post_id);

    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger handle_power_level_trigger
  after insert or delete on public.power_ups
  for each row
  execute function public.handle_power_level();
```

## Setup Instructions

### Step 1: Run SQL Scripts

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each table creation script above
4. Run them in order:
   - user_profiles
   - followers
   - posts (optional)
   - power_ups (optional)

### Step 2: Configure Supabase Auth

1. Go to Authentication → Settings
2. Enable email confirmation (optional, but recommended)
3. Configure email templates:
   - Customize the password reset email template
   - Set the redirect URL to: `sayn://reset-password`

### Step 3: Set Up Storage (Optional - for avatars)

1. Go to Storage
2. Create a new bucket called `avatars`
3. Set it to public
4. Add RLS policies:

```sql
-- Allow users to upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow everyone to view avatars
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

### Step 4: Verify Setup

Test the setup by:
1. Creating a test account through the app
2. Completing the onboarding flow
3. Checking that a profile was created in `user_profiles` table
4. Testing follow/unfollow functionality

## Common Queries

### Get user profile by username
```sql
select * from user_profiles where username = 'someusername';
```

### Get user's followers
```sql
select up.*
from user_profiles up
join followers f on f.follower_id = up.id
where f.following_id = 'user-uuid-here';
```

### Get users a user is following
```sql
select up.*
from user_profiles up
join followers f on f.following_id = up.id
where f.follower_id = 'user-uuid-here';
```

### Leaderboard by level
```sql
select username, level, xp, total_power_ups
from user_profiles
order by level desc, xp desc
limit 50;
```

## Maintenance

### Update XP and Level
You'll likely want to create a function to handle XP and leveling:

```sql
create or replace function public.add_xp(user_uuid uuid, xp_amount integer)
returns void as $$
declare
  current_level integer;
  current_xp integer;
  new_xp integer;
  new_level integer;
begin
  -- Get current stats
  select level, xp into current_level, current_xp
  from user_profiles
  where id = user_uuid;

  -- Calculate new XP
  new_xp := current_xp + xp_amount;
  new_level := current_level;

  -- Simple leveling formula (adjust as needed)
  -- Every 1000 XP = 1 level
  while new_xp >= 1000 loop
    new_level := new_level + 1;
    new_xp := new_xp - 1000;
  end loop;

  -- Update profile
  update user_profiles
  set level = new_level, xp = new_xp
  where id = user_uuid;
end;
$$ language plpgsql;
```

## Troubleshooting

### Issue: Can't create profile
- Check that RLS policies are enabled
- Verify that the user is authenticated
- Check auth.uid() matches the id being inserted

### Issue: Username already taken
- The unique constraint on username prevents duplicates
- Use the `checkUsernameAvailability()` function before attempting to create

### Issue: Follow counts not updating
- Check that the trigger is created and enabled
- Verify RLS policies allow the insert/delete operations

## Next Steps

1. Set up real-time subscriptions for live updates
2. Add more gamification features (achievements, streaks)
3. Implement post creation and power-ups
4. Add badge verification system
5. Create admin panel for managing users and badges

## Security Notes

- Never expose the `service_role` key in client code
- Always use RLS policies to protect data
- Validate all user inputs before inserting to database
- Use parameterized queries to prevent SQL injection
- Regularly audit RLS policies for security gaps
