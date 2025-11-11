// XP System API for SAYN
import { supabase } from '@/lib/supabase';
import {
  XPStats,
  XPTransaction,
  XPSource,
  PostType,
  RankTier,
  LevelUpResult,
  RankUpResult,
  XPAwardResult,
  PowerUpResult,
  RANK_THRESHOLDS,
  POST_TYPE_CONFIGS,
  XP_CONFIG,
} from '@/lib/types/xp';

/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(xp / 10)) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

/**
 * Calculate XP needed for a specific level
 * Inverse formula: xp = (level - 1)^2 * 10
 */
export function calculateXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 10;
}

/**
 * Calculate XP needed to reach next level
 */
export function calculateXPToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
}

/**
 * Calculate progress percentage to next level
 */
export function calculateLevelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  return Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100);
}

/**
 * Get rank tier for given XP amount
 */
export function getRankForXP(xp: number): RankTier {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i].minXP) {
      return RANK_THRESHOLDS[i].rank;
    }
  }
  return 'rookie';
}

/**
 * Get rank configuration
 */
export function getRankConfig(rank: RankTier) {
  return RANK_THRESHOLDS.find((r) => r.rank === rank) || RANK_THRESHOLDS[0];
}

/**
 * Calculate XP for a post based on type and bonuses
 */
export function calculatePostXP(
  postType: PostType,
  isVerified: boolean,
  streakMultiplier: number
): number {
  const config = POST_TYPE_CONFIGS.find((c) => c.type === postType);
  if (!config) return 0;

  let xp = config.baseXP;

  // Apply streak multiplier
  xp = Math.floor(xp * streakMultiplier);

  // Apply verification bonus
  if (isVerified) {
    xp = Math.floor(xp * XP_CONFIG.VERIFICATION_BONUS_MULTIPLIER);
  }

  return xp;
}

/**
 * Calculate XP for receiving a power-up
 */
export function calculatePowerUpReceivedXP(giverLevel: number): number {
  return Math.floor(
    XP_CONFIG.POWER_UP_BASE_XP + giverLevel * XP_CONFIG.POWER_UP_LEVEL_MULTIPLIER
  );
}

/**
 * Calculate streak multiplier based on consecutive days
 */
export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays <= 0) return 1.0;

  const multiplier = Math.min(
    1.0 + (streakDays - 1) * XP_CONFIG.STREAK_MULTIPLIER_INCREMENT,
    XP_CONFIG.MAX_STREAK_MULTIPLIER
  );

  return Math.round(multiplier * 100) / 100; // Round to 2 decimals
}

/**
 * Update user's post streak
 */
export async function updatePostStreak(userId: string): Promise<{
  streak: number;
  multiplier: number;
}> {
  try {
    // Get user's current streak info
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('last_post_date, post_streak')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastPostDate = profile?.last_post_date;

    let newStreak = 1;

    if (lastPostDate) {
      const lastDate = new Date(lastPostDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already posted today, keep current streak
        newStreak = profile.post_streak || 1;
      } else if (diffDays === 1) {
        // Posted yesterday, increment streak
        newStreak = (profile.post_streak || 0) + 1;
      } else {
        // Gap > 1 day, reset streak
        newStreak = 1;
      }
    }

    const newMultiplier = calculateStreakMultiplier(newStreak);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_post_date: today,
        post_streak: newStreak,
        xp_multiplier: newMultiplier,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { streak: newStreak, multiplier: newMultiplier };
  } catch (error: any) {
    console.error('Error updating post streak:', error);
    return { streak: 1, multiplier: 1.0 };
  }
}

/**
 * Check if level up occurred
 */
export function checkLevelUp(oldXP: number, newXP: number): LevelUpResult {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);
  const didLevelUp = newLevel > oldLevel;
  const levelsGained = newLevel - oldLevel;

  return {
    didLevelUp,
    oldLevel,
    newLevel,
    levelsGained,
  };
}

/**
 * Check if rank up occurred
 */
export function checkRankUp(oldXP: number, newXP: number): RankUpResult {
  const oldRank = getRankForXP(oldXP);
  const newRank = getRankForXP(newXP);
  const didRankUp = oldRank !== newRank;

  // Define unlocked perks per rank
  const perks: Record<RankTier, string[]> = {
    rookie: [],
    warrior: ['Profile badge glow', 'Priority in feed'],
    titan: ['Custom rank color', 'Extended bio length'],
    superhuman: ['Exclusive badge', 'Double power-up value'],
    god_tier: ['Legendary badge', 'Unlimited bio', 'Custom profile theme'],
  };

  return {
    didRankUp,
    oldRank,
    newRank,
    unlockedPerks: didRankUp ? perks[newRank] : undefined,
  };
}

/**
 * Award XP to a user and create transaction
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: XPSource,
  sourceId?: string,
  multiplier: number = 1.0
): Promise<XPAwardResult> {
  try {
    console.log(`🎯 Awarding ${amount} XP to user ${userId} from ${source}`);

    // Get current user XP
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, level, rank')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const oldXP = profile?.xp || 0;
    const newXP = oldXP + amount;
    const newLevel = calculateLevel(newXP);
    const newRank = getRankForXP(newXP);

    // Update user's XP, level, and rank
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        rank: newRank,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Create XP transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: userId,
        amount,
        source,
        source_id: sourceId,
        multiplier,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Check for level up and rank up
    const levelUpResult = checkLevelUp(oldXP, newXP);
    const rankUpResult = checkRankUp(oldXP, newXP);

    console.log(`✅ Awarded ${amount} XP. New total: ${newXP} XP, Level ${newLevel}, Rank: ${newRank}`);

    if (levelUpResult.didLevelUp) {
      console.log(`🎉 LEVEL UP! ${levelUpResult.oldLevel} → ${levelUpResult.newLevel}`);
    }

    if (rankUpResult.didRankUp) {
      console.log(`👑 RANK UP! ${rankUpResult.oldRank} → ${rankUpResult.newRank}`);
    }

    return {
      success: true,
      xpAwarded: amount,
      newTotalXP: newXP,
      levelUpResult,
      rankUpResult,
      transaction: transaction as XPTransaction,
    };
  } catch (error: any) {
    console.error('❌ Error awarding XP:', error);
    return {
      success: false,
      xpAwarded: 0,
      newTotalXP: 0,
      levelUpResult: { didLevelUp: false, oldLevel: 1, newLevel: 1, levelsGained: 0 },
      rankUpResult: { didRankUp: false, oldRank: 'rookie', newRank: 'rookie' },
      error: error.message || 'Failed to award XP',
    };
  }
}

/**
 * Get user's XP stats
 */
export async function getUserXPStats(userId: string): Promise<XPStats | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'xp, level, rank, daily_power_ups_remaining, post_streak, xp_multiplier, last_post_date, last_power_up_reset'
      )
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      xp: data.xp || 0,
      level: data.level || 1,
      rank: data.rank || 'rookie',
      xpToNextLevel: calculateXPToNextLevel(data.xp || 0),
      xpProgress: calculateLevelProgress(data.xp || 0),
      daily_power_ups_remaining: data.daily_power_ups_remaining || 10,
      post_streak: data.post_streak || 0,
      xp_multiplier: data.xp_multiplier || 1.0,
      last_post_date: data.last_post_date,
      last_power_up_reset: data.last_power_up_reset,
    };
  } catch (error: any) {
    console.error('Error fetching XP stats:', error);
    return null;
  }
}

/**
 * Get XP transaction history for a user
 */
export async function getXPTransactions(
  userId: string,
  limit: number = 50
): Promise<XPTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data as XPTransaction[]) || [];
  } catch (error: any) {
    console.error('Error fetching XP transactions:', error);
    return [];
  }
}

/**
 * Reset daily power-ups if needed
 */
export async function checkAndResetPowerUps(userId: string): Promise<number> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('last_power_up_reset, daily_power_ups_remaining')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const lastReset = new Date(profile?.last_power_up_reset || 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const resetDate = new Date(
      lastReset.getFullYear(),
      lastReset.getMonth(),
      lastReset.getDate()
    );

    // If last reset was before today, reset power-ups
    if (resetDate < today) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          daily_power_ups_remaining: XP_CONFIG.MAX_DAILY_POWER_UPS,
          last_power_up_reset: now.toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      console.log(`🔄 Reset power-ups for user ${userId}`);
      return XP_CONFIG.MAX_DAILY_POWER_UPS;
    }

    return profile?.daily_power_ups_remaining || 0;
  } catch (error: any) {
    console.error('Error checking/resetting power-ups:', error);
    return 0;
  }
}

/**
 * Use a power-up (award XP to both giver and receiver)
 */
export async function usePowerUp(
  giverId: string,
  receiverId: string,
  postId: string
): Promise<PowerUpResult> {
  try {
    // Check if giver has power-ups remaining
    const powerUpsRemaining = await checkAndResetPowerUps(giverId);

    if (powerUpsRemaining <= 0) {
      // Calculate time until reset (next midnight)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const hoursUntilReset = Math.ceil(
        (tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      return {
        success: false,
        error: `Out of Power Ups! Resets in ${hoursUntilReset} hours`,
        resetTime: tomorrow.toISOString(),
        powerUpsRemaining: 0,
      };
    }

    // Get giver's level for XP calculation
    const { data: giverProfile, error: giverError } = await supabase
      .from('profiles')
      .select('level')
      .eq('id', giverId)
      .single();

    if (giverError) throw giverError;

    const giverLevel = giverProfile?.level || 1;

    // Calculate XP amounts
    const receiverXP = calculatePowerUpReceivedXP(giverLevel);
    const giverXP = XP_CONFIG.POWER_UP_GIVER_XP;

    // Award XP to receiver
    const receiverResult = await awardXP(
      receiverId,
      receiverXP,
      'power_up_received',
      postId
    );

    // Award XP to giver
    const giverResult = await awardXP(giverId, giverXP, 'power_up_given', postId);

    // Decrement giver's power-ups
    const { error: decrementError } = await supabase
      .from('profiles')
      .update({
        daily_power_ups_remaining: powerUpsRemaining - 1,
      })
      .eq('id', giverId);

    if (decrementError) throw decrementError;

    console.log(
      `⚡ Power-up used! Receiver +${receiverXP} XP, Giver +${giverXP} XP. ${powerUpsRemaining - 1} remaining`
    );

    return {
      success: true,
      recipientXP: receiverXP,
      giverXP: giverXP,
      powerUpsRemaining: powerUpsRemaining - 1,
    };
  } catch (error: any) {
    console.error('Error using power-up:', error);
    return {
      success: false,
      error: error.message || 'Failed to use power-up',
    };
  }
}

/**
 * Award XP for a new post
 */
export async function awardPostXP(
  userId: string,
  postId: string,
  postType: PostType,
  isVerified: boolean = false
): Promise<XPAwardResult> {
  try {
    // Update streak first
    const { streak, multiplier } = await updatePostStreak(userId);

    // Calculate XP for this post
    const xpAmount = calculatePostXP(postType, isVerified, multiplier);

    // Award XP
    const result = await awardXP(userId, xpAmount, 'post', postId, multiplier);

    console.log(
      `📝 Post XP awarded! Type: ${postType}, Streak: ${streak} days (${multiplier}x), Verified: ${isVerified}, Total: ${xpAmount} XP`
    );

    return result;
  } catch (error: any) {
    console.error('Error awarding post XP:', error);
    return {
      success: false,
      xpAwarded: 0,
      newTotalXP: 0,
      levelUpResult: { didLevelUp: false, oldLevel: 1, newLevel: 1, levelsGained: 0 },
      rankUpResult: { didRankUp: false, oldRank: 'rookie', newRank: 'rookie' },
      error: error.message || 'Failed to award post XP',
    };
  }
}
