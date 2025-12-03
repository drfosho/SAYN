// Daily Challenges System API for SAYN
import { supabase } from '@/lib/supabase';
import { awardXP } from './xp';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'post' | 'power_up' | 'comment' | 'engagement' | 'streak';
  target_count: number;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon_name: string;
}

export interface UserChallengeProgress {
  id: string;
  challenge_id: string;
  challenge: DailyChallenge;
  date: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
  xp_claimed: boolean;
}

export interface ChallengeUpdateResult {
  success: boolean;
  progress?: number;
  completed?: boolean;
  xpAwarded?: number;
  error?: string;
}

/**
 * Get all active daily challenges
 */
export async function getActiveChallenges(): Promise<DailyChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    return (data as DailyChallenge[]) || [];
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    return [];
  }
}

/**
 * Get user's daily challenge progress for today
 */
export async function getUserDailyChallenges(
  userId: string
): Promise<UserChallengeProgress[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // First, ensure user has today's challenges initialized
    await initializeDailyChallenges(userId);

    // Get user's challenge progress with challenge details
    const { data, error } = await supabase
      .from('user_daily_challenges')
      .select(`
        id,
        challenge_id,
        date,
        current_progress,
        completed,
        completed_at,
        xp_claimed,
        daily_challenges (
          id,
          title,
          description,
          challenge_type,
          target_count,
          xp_reward,
          difficulty,
          icon_name
        )
      `)
      .eq('user_id', userId)
      .eq('date', today);

    if (error) throw error;

    return (
      data?.map((item: any) => ({
        id: item.id,
        challenge_id: item.challenge_id,
        challenge: item.daily_challenges,
        date: item.date,
        current_progress: item.current_progress,
        completed: item.completed,
        completed_at: item.completed_at,
        xp_claimed: item.xp_claimed,
      })) || []
    );
  } catch (error: any) {
    console.error('Error fetching user challenges:', error);
    return [];
  }
}

/**
 * Initialize today's challenges for a user
 * Selects a random subset of challenges for the day
 */
export async function initializeDailyChallenges(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if challenges already initialized for today
    const { data: existing, error: checkError } = await supabase
      .from('user_daily_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return; // Already initialized
    }

    // Get all active challenges
    const challenges = await getActiveChallenges();

    if (challenges.length === 0) return;

    // Select challenges for today (3-5 challenges, mix of difficulties)
    const easyMedium = challenges.filter(
      (c) => c.difficulty === 'easy' || c.difficulty === 'medium'
    );
    const hard = challenges.filter((c) => c.difficulty === 'hard');

    // Shuffle arrays
    const shuffledEasyMedium = easyMedium.sort(() => Math.random() - 0.5);
    const shuffledHard = hard.sort(() => Math.random() - 0.5);

    // Select 3 easy/medium and 1 hard (if available)
    const selectedChallenges: DailyChallenge[] = [
      ...shuffledEasyMedium.slice(0, 3),
      ...shuffledHard.slice(0, 1),
    ];

    // Insert user challenge records
    const challengeRecords = selectedChallenges.map((challenge) => ({
      user_id: userId,
      challenge_id: challenge.id,
      date: today,
      current_progress: 0,
      completed: false,
      xp_claimed: false,
    }));

    const { error: insertError } = await supabase
      .from('user_daily_challenges')
      .insert(challengeRecords);

    if (insertError) throw insertError;

    console.log(`📋 Initialized ${challengeRecords.length} daily challenges for user`);
  } catch (error: any) {
    console.error('Error initializing daily challenges:', error);
  }
}

/**
 * Update challenge progress
 * Called when user performs an action (post, power_up, comment, etc.)
 */
export async function updateChallengeProgress(
  userId: string,
  challengeType: DailyChallenge['challenge_type'],
  incrementBy: number = 1
): Promise<ChallengeUpdateResult[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get user's challenges of this type for today
    const { data: userChallenges, error: fetchError } = await supabase
      .from('user_daily_challenges')
      .select(`
        id,
        current_progress,
        completed,
        xp_claimed,
        daily_challenges (
          id,
          target_count,
          xp_reward,
          challenge_type
        )
      `)
      .eq('user_id', userId)
      .eq('date', today)
      .eq('completed', false);

    if (fetchError) throw fetchError;

    const results: ChallengeUpdateResult[] = [];

    for (const challenge of userChallenges || []) {
      const challengeData = challenge.daily_challenges as any;

      // Skip if challenge type doesn't match
      if (challengeData.challenge_type !== challengeType) continue;

      const newProgress = Math.min(
        challenge.current_progress + incrementBy,
        challengeData.target_count
      );
      const isNowComplete = newProgress >= challengeData.target_count;

      // Update progress
      const updateData: any = {
        current_progress: newProgress,
      };

      if (isNowComplete) {
        updateData.completed = true;
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('user_daily_challenges')
        .update(updateData)
        .eq('id', challenge.id);

      if (updateError) {
        console.error('Error updating challenge progress:', updateError);
        results.push({
          success: false,
          error: updateError.message,
        });
        continue;
      }

      // Auto-claim XP if completed
      let xpAwarded = 0;
      if (isNowComplete && !challenge.xp_claimed) {
        await awardXP(userId, challengeData.xp_reward, 'daily_challenge', challenge.id);

        await supabase
          .from('user_daily_challenges')
          .update({ xp_claimed: true })
          .eq('id', challenge.id);

        xpAwarded = challengeData.xp_reward;
        console.log(`🎯 Challenge completed! +${xpAwarded} XP`);
      }

      results.push({
        success: true,
        progress: newProgress,
        completed: isNowComplete,
        xpAwarded: xpAwarded > 0 ? xpAwarded : undefined,
      });
    }

    return results;
  } catch (error: any) {
    console.error('Error updating challenge progress:', error);
    return [{ success: false, error: error.message }];
  }
}

/**
 * Claim XP reward for a completed challenge
 * (Alternative to auto-claim if you want manual claiming)
 */
export async function claimChallengeReward(
  userId: string,
  userChallengeId: string
): Promise<{ success: boolean; xpAwarded?: number; error?: string }> {
  try {
    // Get challenge details
    const { data: challenge, error: fetchError } = await supabase
      .from('user_daily_challenges')
      .select(`
        id,
        completed,
        xp_claimed,
        daily_challenges (
          xp_reward
        )
      `)
      .eq('id', userChallengeId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    if (!challenge.completed) {
      return { success: false, error: 'Challenge not completed' };
    }

    if (challenge.xp_claimed) {
      return { success: false, error: 'Reward already claimed' };
    }

    const xpReward = (challenge.daily_challenges as any).xp_reward;

    // Award XP
    await awardXP(userId, xpReward, 'daily_challenge', userChallengeId);

    // Mark as claimed
    const { error: updateError } = await supabase
      .from('user_daily_challenges')
      .update({ xp_claimed: true })
      .eq('id', userChallengeId);

    if (updateError) throw updateError;

    return {
      success: true,
      xpAwarded: xpReward,
    };
  } catch (error: any) {
    console.error('Error claiming challenge reward:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get challenge completion stats for a user
 */
export async function getChallengeStats(userId: string): Promise<{
  totalCompleted: number;
  todayCompleted: number;
  totalXpEarned: number;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get total completed
    const { count: totalCompleted, error: totalError } = await supabase
      .from('user_daily_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    if (totalError) throw totalError;

    // Get today's completed
    const { count: todayCompleted, error: todayError } = await supabase
      .from('user_daily_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('date', today)
      .eq('completed', true);

    if (todayError) throw todayError;

    // Calculate total XP earned from challenges
    const { data: xpData, error: xpError } = await supabase
      .from('user_daily_challenges')
      .select(`
        daily_challenges (xp_reward)
      `)
      .eq('user_id', userId)
      .eq('xp_claimed', true);

    if (xpError) throw xpError;

    const totalXpEarned =
      xpData?.reduce(
        (sum, item) => sum + ((item.daily_challenges as any)?.xp_reward || 0),
        0
      ) || 0;

    return {
      totalCompleted: totalCompleted || 0,
      todayCompleted: todayCompleted || 0,
      totalXpEarned,
    };
  } catch (error: any) {
    console.error('Error fetching challenge stats:', error);
    return {
      totalCompleted: 0,
      todayCompleted: 0,
      totalXpEarned: 0,
    };
  }
}

/**
 * Track engagement for engagement-type challenges
 * Called when user views/interacts with a unique post
 */
const engagementTracker = new Map<string, Set<string>>();

export function trackEngagement(userId: string, postId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;

  if (!engagementTracker.has(key)) {
    engagementTracker.set(key, new Set());
  }

  const userEngagements = engagementTracker.get(key)!;

  if (userEngagements.has(postId)) {
    return false; // Already engaged with this post today
  }

  userEngagements.add(postId);
  return true; // New engagement
}

/**
 * Get today's engagement count for a user
 */
export function getTodayEngagementCount(userId: string): number {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  return engagementTracker.get(key)?.size || 0;
}
