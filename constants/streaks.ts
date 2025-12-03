/**
 * Streak Milestones Configuration
 * Defines XP rewards for achieving streak milestones
 */

export interface StreakMilestone {
  days: number;
  xpReward: number;
  label: string;
  emoji: string;
}

export const LOGIN_STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xpReward: 50, label: '3 Day Streak', emoji: '🔥' },
  { days: 7, xpReward: 150, label: 'Week Warrior', emoji: '⚡' },
  { days: 14, xpReward: 300, label: '2 Week Champion', emoji: '🏆' },
  { days: 30, xpReward: 500, label: 'Monthly Master', emoji: '👑' },
  { days: 60, xpReward: 1000, label: '2 Month Legend', emoji: '🌟' },
  { days: 90, xpReward: 2000, label: 'Quarterly King', emoji: '💎' },
  { days: 180, xpReward: 5000, label: 'Half Year Hero', emoji: '🚀' },
  { days: 365, xpReward: 10000, label: 'Year of Dedication', emoji: '🎖️' },
];

export const POST_STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xpReward: 75, label: '3 Day Creator', emoji: '📸' },
  { days: 7, xpReward: 200, label: 'Week of Content', emoji: '🎬' },
  { days: 14, xpReward: 400, label: 'Content Machine', emoji: '🏅' },
  { days: 30, xpReward: 750, label: 'Monthly Creator', emoji: '⭐' },
  { days: 60, xpReward: 1500, label: 'Prolific Poster', emoji: '💪' },
  { days: 90, xpReward: 3000, label: 'Content Legend', emoji: '🔱' },
];

/**
 * Get the next milestone for a given streak count
 */
export const getNextMilestone = (
  currentStreak: number,
  milestones: StreakMilestone[]
): StreakMilestone | null => {
  return milestones.find((m) => m.days > currentStreak) || null;
};

/**
 * Get milestone achieved at a specific streak count (if any)
 */
export const getMilestoneAtStreak = (
  streak: number,
  milestones: StreakMilestone[]
): StreakMilestone | null => {
  return milestones.find((m) => m.days === streak) || null;
};

/**
 * Get all achieved milestones for a streak count
 */
export const getAchievedMilestones = (
  streak: number,
  milestones: StreakMilestone[]
): StreakMilestone[] => {
  return milestones.filter((m) => m.days <= streak);
};

/**
 * Calculate progress to next milestone (0-100)
 */
export const getProgressToNextMilestone = (
  currentStreak: number,
  milestones: StreakMilestone[]
): number => {
  const achievedMilestones = getAchievedMilestones(currentStreak, milestones);
  const lastMilestone = achievedMilestones[achievedMilestones.length - 1];
  const nextMilestone = getNextMilestone(currentStreak, milestones);

  if (!nextMilestone) return 100; // All milestones achieved

  const startDays = lastMilestone?.days || 0;
  const endDays = nextMilestone.days;
  const progress = ((currentStreak - startDays) / (endDays - startDays)) * 100;

  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Daily XP bonus based on current streak
 * Higher streaks give bonus XP on daily activities
 */
export const getDailyStreakBonus = (streak: number): number => {
  if (streak >= 30) return 25; // +25 XP per activity
  if (streak >= 14) return 15; // +15 XP per activity
  if (streak >= 7) return 10; // +10 XP per activity
  if (streak >= 3) return 5; // +5 XP per activity
  return 0;
};

/**
 * Streak freeze configuration
 * Users can use a streak freeze to protect their streak for one day
 */
export const STREAK_FREEZE_CONFIG = {
  maxFreezes: 3, // Maximum streak freezes a user can hold
  cooldownDays: 7, // Days between earning new freezes
  earnedEveryXDays: 7, // Earn a freeze every 7 days of streak
};
