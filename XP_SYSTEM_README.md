# SAYN XP System Documentation

## Overview

The XP (Experience Points) system is the core progression and engagement mechanism in SAYN. It rewards users for posting content, giving power-ups, maintaining streaks, and staying active.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        XP SYSTEM                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database         API Layer         UI Components           │
│  ┌────────┐      ┌──────────┐      ┌─────────────┐         │
│  │profiles│      │  xp.ts   │      │   XPBar     │         │
│  │  + xp  │─────▶│          │─────▶│ LevelUpModal│         │
│  │+ level │      │Functions │      │ RankUpModal │         │
│  │+ rank  │      │          │      │  XPToast    │         │
│  │+ streak│      │          │      │PowerUpCounter        │
│  └────────┘      └──────────┘      └─────────────┘         │
│       │                                                     │
│       ▼                                                     │
│  ┌────────────┐                                            │
│  │xp_transactions│                                         │
│  │ audit trail  │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### 1. Run Database Migration

```sql
-- Execute the migration file
-- Location: supabase/migrations/20250111_xp_system.sql
```

This adds:
- XP columns to `profiles` table
- New `xp_transactions` table
- Indexes for performance
- RLS policies for security

### 2. Import Types and Functions

```typescript
// Import types
import { XPStats, RankTier, PostType } from '@/lib/types/xp';

// Import API functions
import {
  awardPostXP,
  usePowerUp,
  getUserXPStats,
  calculateLevel,
} from '@/lib/api/xp';

// Import UI components
import {
  XPBar,
  LevelUpModal,
  RankUpModal,
  PowerUpCounter,
  XPGainToast,
} from '@/components/xp';
```

## Core Concepts

### 1. XP (Experience Points)

Total points earned through activities. Never decreases.

**XP Sources:**
- **Posts**: 0-40 XP depending on type
- **Power-Ups Received**: 5 + (giver level × 0.5) XP
- **Power-Ups Given**: 2 XP (encourages engagement)
- **Streak Bonus**: +10% to +50% XP multiplier
- **Verification Bonus**: +50% XP for verified posts

### 2. Levels

Calculated from total XP using the formula:
```typescript
level = Math.floor(Math.sqrt(xp / 10)) + 1
```

**Examples:**
- 0 XP = Level 1
- 100 XP = Level 4
- 1,000 XP = Level 11
- 10,000 XP = Level 32

**XP to Next Level:**
```typescript
xpNeeded = (currentLevel² × 10) - currentXP
```

### 3. Ranks

Tiered progression system based on total XP:

| Rank | XP Range | Levels | Icon | Description |
|------|----------|--------|------|-------------|
| **Rookie** | 0 - 999 | 1-10 | 🔰 | Just starting out |
| **Warrior** | 1,000 - 4,999 | 11-30 | ⚔️ | Building momentum |
| **Titan** | 5,000 - 14,999 | 31-60 | 👑 | Dominating the game |
| **Superhuman** | 15,000 - 39,999 | 61-90 | 🔥 | Beyond mortal limits |
| **God Tier** | 40,000+ | 91+ | ⚡ | Legendary status |

### 4. Post Types

When posting, users select a type:

| Type | Base XP | Icon | Description |
|------|---------|------|-------------|
| **Daily Check-In** | 10 | 📅 | Quick daily update |
| **Progress Update** | 25 | 📈 | Show gains/improvements |
| **Peak Condition** | 40 | ⭐ | Best physique, max effort |
| **Just Sharing** | 0 | 💬 | Social only, no XP |

### 5. Streaks

Consecutive days posting increases XP multiplier:

| Streak Days | Multiplier | Bonus |
|-------------|------------|-------|
| 1 day | 1.0x | +0% |
| 2 days | 1.1x | +10% |
| 3 days | 1.2x | +20% |
| 4 days | 1.3x | +30% |
| 5+ days | 1.5x | +50% (max) |

**Streak resets if user skips a day** (gap > 1 day).

### 6. Power-Ups

Daily limit of **10 power-ups** per user.

**When User A power-ups User B's post:**
- User B receives: `5 + (User A's level × 0.5)` XP
- User A receives: `2` XP (for being supportive)
- User A's counter decrements: `9/10 remaining`

**Resets:** Daily at midnight.

## API Reference

### Award Post XP

```typescript
await awardPostXP(
  userId: string,
  postId: string,
  postType: PostType,
  isVerified: boolean = false
): Promise<XPAwardResult>
```

**Returns:**
```typescript
{
  success: true,
  xpAwarded: 25,
  newTotalXP: 1050,
  levelUpResult: {
    didLevelUp: true,
    oldLevel: 10,
    newLevel: 11,
    levelsGained: 1
  },
  rankUpResult: {
    didRankUp: true,
    oldRank: 'rookie',
    newRank: 'warrior',
    unlockedPerks: ['Profile badge glow', 'Priority in feed']
  }
}
```

### Use Power-Up

```typescript
await usePowerUp(
  giverId: string,
  receiverId: string,
  postId: string
): Promise<PowerUpResult>
```

**Returns:**
```typescript
{
  success: true,
  recipientXP: 12, // 5 + (level 14 × 0.5) = 12
  giverXP: 2,
  powerUpsRemaining: 9
}
```

### Get User XP Stats

```typescript
await getUserXPStats(userId: string): Promise<XPStats | null>
```

**Returns:**
```typescript
{
  xp: 1250,
  level: 12,
  rank: 'warrior',
  xpToNextLevel: 190,
  xpProgress: 73, // percentage to next level
  daily_power_ups_remaining: 7,
  post_streak: 5,
  xp_multiplier: 1.5,
  last_post_date: '2025-01-11',
  last_power_up_reset: '2025-01-11T00:00:00Z'
}
```

### Calculate Level

```typescript
const level = calculateLevel(xp: number): number
```

### Calculate XP to Next Level

```typescript
const xpNeeded = calculateXPToNextLevel(currentXP: number): number
```

## UI Components

### XPBar

Shows user's level, rank, and progress to next level.

```typescript
<XPBar
  currentXP={stats.xp}
  level={stats.level}
  rank={stats.rank}
  xpToNextLevel={stats.xpToNextLevel}
  xpProgress={stats.xpProgress}
  showDetails={true}
  compact={false}
/>
```

### LevelUpModal

Epic modal shown when user levels up.

```typescript
<LevelUpModal
  visible={showLevelUp}
  oldLevel={10}
  newLevel={11}
  levelsGained={1}
  onClose={() => setShowLevelUp(false)}
/>
```

### RankUpModal

Full-screen takeover for rank ups.

```typescript
<RankUpModal
  visible={showRankUp}
  oldRank="rookie"
  newRank="warrior"
  unlockedPerks={['Profile badge glow', 'Priority in feed']}
  onClose={() => setShowRankUp(false)}
/>
```

### PowerUpCounter

Shows daily power-ups remaining.

```typescript
<PowerUpCounter
  remaining={7}
  total={10}
  compact={false}
/>
```

### XPGainToast

Floating toast showing XP gained.

```typescript
<XPGainToast
  xpAmount={25}
  source="Progress Update"
  visible={showToast}
  onHide={() => setShowToast(false)}
  duration={3000}
/>
```

## Integration Example

### Post Upload Flow

```typescript
import { awardPostXP } from '@/lib/api/xp';
import { PostType } from '@/lib/types/xp';

async function handlePostUpload(
  userId: string,
  postType: PostType,
  isVerified: boolean = false
) {
  // 1. Upload post to database
  const { data: post, error } = await supabase
    .from('posts')
    .insert({ ... })
    .select()
    .single();

  if (error) throw error;

  // 2. Award XP for the post
  const result = await awardPostXP(
    userId,
    post.id,
    postType,
    isVerified
  );

  // 3. Show XP toast
  if (result.success) {
    setXPToast({
      visible: true,
      amount: result.xpAwarded,
      source: postType
    });
  }

  // 4. Check for level up
  if (result.levelUpResult.didLevelUp) {
    setLevelUpModal({
      visible: true,
      oldLevel: result.levelUpResult.oldLevel,
      newLevel: result.levelUpResult.newLevel,
      levelsGained: result.levelUpResult.levelsGained
    });
  }

  // 5. Check for rank up
  if (result.rankUpResult.didRankUp) {
    setRankUpModal({
      visible: true,
      oldRank: result.rankUpResult.oldRank,
      newRank: result.rankUpResult.newRank,
      unlockedPerks: result.rankUpResult.unlockedPerks
    });
  }

  return result;
}
```

### Power-Up Flow

```typescript
import { usePowerUp, checkAndResetPowerUps } from '@/lib/api/xp';

async function handlePowerUpTap(
  giverId: string,
  receiverId: string,
  postId: string
) {
  // 1. Use power-up
  const result = await usePowerUp(giverId, receiverId, postId);

  // 2. Handle result
  if (result.success) {
    // Show success feedback
    setXPToast({
      visible: true,
      amount: result.recipientXP,
      source: 'Power-Up Received'
    });

    // Update power-up counter
    setPowerUpsRemaining(result.powerUpsRemaining);

    // Haptic feedback
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  } else {
    // Show error (out of power-ups)
    Alert.alert('Out of Power-Ups!', result.error);
  }

  return result;
}
```

## Database Schema

### profiles table (additions)

```sql
xp INTEGER DEFAULT 0 CHECK (xp >= 0)
level INTEGER DEFAULT 1 CHECK (level >= 1)
rank TEXT DEFAULT 'rookie'
daily_power_ups_remaining INTEGER DEFAULT 10
last_power_up_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW()
post_streak INTEGER DEFAULT 0
last_post_date DATE
xp_multiplier DECIMAL(3,2) DEFAULT 1.0
```

### xp_transactions table

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
amount INTEGER NOT NULL
source TEXT NOT NULL
source_id UUID
multiplier DECIMAL(3,2) DEFAULT 1.0
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## Testing

### Test Scenarios

1. **New User Posts**
   ```typescript
   await awardPostXP(userId, postId, 'daily_check_in', false);
   // Expect: 10 XP, Level 1 → 2
   ```

2. **5-Day Streak**
   ```typescript
   // Post for 5 consecutive days
   // Expect: 1.5x multiplier, higher XP
   ```

3. **Power-Up Chain**
   ```typescript
   // High-level user (Level 50) power-ups newbie
   // Expect: Newbie gets 30 XP (5 + 50×0.5)
   ```

4. **Rank Up**
   ```typescript
   // User at 990 XP posts for 40 XP
   // Expect: Rank up from Rookie → Warrior
   ```

5. **Power-Up Depletion**
   ```typescript
   // User taps power-up 11 times
   // Expect: 11th tap fails with error message
   ```

## Performance Considerations

- **Indexes**: XP columns are indexed for fast leaderboards
- **Transactions**: Each XP award is atomic (database transaction)
- **Caching**: Consider caching user XP stats in memory/state
- **Batch Updates**: Transaction table can grow large - consider archiving old records

## Future Enhancements

- [ ] Leaderboards (global, friends, local)
- [ ] Seasonal XP resets/rankings
- [ ] Special events with bonus XP multipliers
- [ ] Achievement system tied to XP milestones
- [ ] XP decay for inactive users (optional)
- [ ] Bonus XP weekends/events
- [ ] Referral bonuses

## Support

For questions or issues with the XP system:
1. Check this documentation
2. Review code comments in `/lib/api/xp.ts`
3. Test in development with admin tools
4. Check Supabase logs for errors

---

**Built for SAYN** 🚀
Making fitness transparent, one power-up at a time.
