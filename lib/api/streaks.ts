// Daily Streak System API for SAYN
import { supabase } from '@/lib/supabase';
import {
  LOGIN_STREAK_MILESTONES,
  POST_STREAK_MILESTONES,
  getMilestoneAtStreak,
  getNextMilestone,
  getProgressToNextMilestone,
  getDailyStreakBonus,
  STREAK_FREEZE_CONFIG,
  StreakMilestone,
} from '@/constants/streaks';
import { awardXP } from './xp';

export interface StreakData {
  loginStreak: number;
  longestLoginStreak: number;
  postStreak: number;
  longestPostStreak: number;
  lastLoginDate: string | null;
  lastPostDate: string | null;
  streakFreezeCount: number;
  lastStreakFreezeUsed: string | null;
}

export interface StreakUpdateResult {
  success: boolean;
  streakData?: StreakData;
  milestoneAchieved?: StreakMilestone;
  xpAwarded?: number;
  error?: string;
}

/**
 * Get user's current streak data
 */
export async function getUserStreakData(userId: string): Promise<StreakData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        login_streak,
        longest_login_streak,
        post_streak,
        longest_post_streak,
        last_login_date,
        last_post_date,
        streak_freeze_count,
        last_streak_freeze_used
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      loginStreak: data?.login_streak || 0,
      longestLoginStreak: data?.longest_login_streak || 0,
      postStreak: data?.post_streak || 0,
      longestPostStreak: data?.longest_post_streak || 0,
      lastLoginDate: data?.last_login_date || null,
      lastPostDate: data?.last_post_date || null,
      streakFreezeCount: data?.streak_freeze_count || 0,
      lastStreakFreezeUsed: data?.last_streak_freeze_used || null,
    };
  } catch (error: any) {
    console.error('Error fetching streak data:', error);
    return null;
  }
}

/**
 * Record daily login and update login streak
 * Should be called when user opens the app
 */
export async function recordDailyLogin(userId: string): Promise<StreakUpdateResult> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get current streak data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        login_streak,
        longest_login_streak,
        last_login_date,
        streak_freeze_count,
        last_streak_freeze_used
      `)
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const lastLoginDate = profile?.last_login_date;
    let newStreak = 1;
    let usedFreeze = false;

    if (lastLoginDate) {
      // Already logged in today
      if (lastLoginDate === today) {
        return {
          success: true,
          streakData: await getUserStreakData(userId) || undefined,
        };
      }

      const lastDate = new Date(lastLoginDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = (profile.login_streak || 0) + 1;
      } else if (diffDays === 2 && (profile.streak_freeze_count || 0) > 0) {
        // Missed one day but has freeze available
        newStreak = (profile.login_streak || 0) + 1;
        usedFreeze = true;
        console.log(`🧊 Streak freeze used for user ${userId}`);
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Calculate longest streak
    const longestStreak = Math.max(profile?.longest_login_streak || 0, newStreak);

    // Update profile
    const updateData: any = {
      login_streak: newStreak,
      longest_login_streak: longestStreak,
      last_login_date: today,
    };

    if (usedFreeze) {
      updateData.streak_freeze_count = (profile.streak_freeze_count || 0) - 1;
      updateData.last_streak_freeze_used = today;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    // Check for milestone achievement
    const milestone = getMilestoneAtStreak(newStreak, LOGIN_STREAK_MILESTONES);
    let xpAwarded = 0;

    if (milestone) {
      // Check if milestone already claimed
      const { data: existingMilestone } = await supabase
        .from('streak_milestones')
        .select('id')
        .eq('user_id', userId)
        .eq('milestone_days', milestone.days)
        .eq('streak_type', 'login')
        .single();

      if (!existingMilestone) {
        // Award milestone XP
        await awardXP(userId, milestone.xpReward, 'login_streak_milestone');
        xpAwarded = milestone.xpReward;

        // Record milestone
        await supabase.from('streak_milestones').insert({
          user_id: userId,
          milestone_days: milestone.days,
          streak_type: 'login',
          xp_awarded: milestone.xpReward,
        });

        console.log(`🏆 Login streak milestone achieved: ${milestone.label} (+${milestone.xpReward} XP)`);
      }
    }

    // Award streak freeze if earned
    if (newStreak > 0 && newStreak % STREAK_FREEZE_CONFIG.earnedEveryXDays === 0) {
      const currentFreezes = usedFreeze
        ? (profile.streak_freeze_count || 0) - 1
        : (profile.streak_freeze_count || 0);

      if (currentFreezes < STREAK_FREEZE_CONFIG.maxFreezes) {
        await supabase
          .from('profiles')
          .update({ streak_freeze_count: currentFreezes + 1 })
          .eq('id', userId);

        console.log(`🧊 Streak freeze earned! User now has ${currentFreezes + 1} freezes`);
      }
    }

    console.log(`📅 Daily login recorded. Streak: ${newStreak} days${usedFreeze ? ' (freeze used)' : ''}`);

    return {
      success: true,
      streakData: await getUserStreakData(userId) || undefined,
      milestoneAchieved: milestone || undefined,
      xpAwarded: xpAwarded > 0 ? xpAwarded : undefined,
    };
  } catch (error: any) {
    console.error('Error recording daily login:', error);
    return {
      success: false,
      error: error.message || 'Failed to record login',
    };
  }
}

/**
 * Check and award post streak milestone
 * Called after updatePostStreak in xp.ts
 */
export async function checkPostStreakMilestone(
  userId: string,
  currentStreak: number
): Promise<{ milestone?: StreakMilestone; xpAwarded?: number }> {
  try {
    const milestone = getMilestoneAtStreak(currentStreak, POST_STREAK_MILESTONES);

    if (!milestone) return {};

    // Check if milestone already claimed
    const { data: existingMilestone } = await supabase
      .from('streak_milestones')
      .select('id')
      .eq('user_id', userId)
      .eq('milestone_days', milestone.days)
      .eq('streak_type', 'post')
      .single();

    if (existingMilestone) return {};

    // Award milestone XP
    await awardXP(userId, milestone.xpReward, 'post_streak_milestone');

    // Record milestone
    await supabase.from('streak_milestones').insert({
      user_id: userId,
      milestone_days: milestone.days,
      streak_type: 'post',
      xp_awarded: milestone.xpReward,
    });

    console.log(`🏆 Post streak milestone achieved: ${milestone.label} (+${milestone.xpReward} XP)`);

    return {
      milestone,
      xpAwarded: milestone.xpReward,
    };
  } catch (error: any) {
    console.error('Error checking post streak milestone:', error);
    return {};
  }
}

/**
 * Get user's achieved milestones
 */
export async function getUserMilestones(
  userId: string
): Promise<{ login: number[]; post: number[] }> {
  try {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('milestone_days, streak_type')
      .eq('user_id', userId);

    if (error) throw error;

    const loginMilestones: number[] = [];
    const postMilestones: number[] = [];

    data?.forEach((m) => {
      if (m.streak_type === 'login') {
        loginMilestones.push(m.milestone_days);
      } else {
        postMilestones.push(m.milestone_days);
      }
    });

    return {
      login: loginMilestones.sort((a, b) => a - b),
      post: postMilestones.sort((a, b) => a - b),
    };
  } catch (error: any) {
    console.error('Error fetching milestones:', error);
    return { login: [], post: [] };
  }
}

/**
 * Get streak info for display
 */
export async function getStreakDisplayInfo(userId: string) {
  const streakData = await getUserStreakData(userId);

  if (!streakData) return null;

  const nextLoginMilestone = getNextMilestone(
    streakData.loginStreak,
    LOGIN_STREAK_MILESTONES
  );
  const nextPostMilestone = getNextMilestone(
    streakData.postStreak,
    POST_STREAK_MILESTONES
  );

  return {
    ...streakData,
    dailyBonus: getDailyStreakBonus(streakData.loginStreak),
    loginProgress: getProgressToNextMilestone(
      streakData.loginStreak,
      LOGIN_STREAK_MILESTONES
    ),
    postProgress: getProgressToNextMilestone(
      streakData.postStreak,
      POST_STREAK_MILESTONES
    ),
    nextLoginMilestone,
    nextPostMilestone,
  };
}

/**
 * Use a streak freeze manually (if user wants to protect future streak)
 */
export async function useStreakFreeze(userId: string): Promise<boolean> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('streak_freeze_count')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    if ((profile?.streak_freeze_count || 0) <= 0) {
      return false;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_freeze_count: profile.streak_freeze_count - 1,
        last_streak_freeze_used: new Date().toISOString().split('T')[0],
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return true;
  } catch (error: any) {
    console.error('Error using streak freeze:', error);
    return false;
  }
}
