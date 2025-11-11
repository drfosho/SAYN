# SAYN Database Migrations

## Running Migrations

To apply these migrations to your Supabase database:

### Option 1: Supabase Dashboard (Recommended for Development)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run a specific migration
supabase db execute --file supabase/migrations/20250111_xp_system.sql
```

### Option 3: Manual SQL Execution

Connect to your Supabase database and execute the SQL file directly.

## Migrations

- **20250111_xp_system.sql**: Adds XP progression system including:
  - XP, level, rank columns to profiles table
  - Power-up daily limit tracking
  - Post streak tracking
  - XP transactions table for audit trail
  - Indexes and RLS policies

## Verifying Migration Success

After running the migration, verify in the Supabase dashboard:

1. Check `profiles` table has new columns: `xp`, `level`, `rank`, etc.
2. Check `xp_transactions` table exists
3. Verify indexes are created
4. Confirm RLS policies are active
