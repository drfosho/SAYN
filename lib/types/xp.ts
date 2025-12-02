// XP System Types for SAYN

export type RankTier = 'rookie' | 'warrior' | 'titan' | 'superhuman' | 'god_tier';

export type XPSource =
  | 'post'
  | 'power_up_received'
  | 'power_up_given'
  | 'streak_bonus'
  | 'verification_bonus'
  | 'admin_award'
  | 'comment'
  | 'comment_power_up'
  | 'give_comment_power_up';

export type PostType =
  | 'daily_check_in'
  | 'progress_update'
  | 'peak_condition'
  | 'just_sharing';

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: XPSource;
  source_id?: string;
  multiplier: number;
  created_at: string;
}

export interface XPStats {
  xp: number;
  level: number;
  rank: RankTier;
  xpToNextLevel: number;
  xpProgress: number; // Percentage 0-100
  daily_power_ups_remaining: number;
  post_streak: number;
  xp_multiplier: number;
  last_post_date?: string;
  last_power_up_reset: string;
}

export interface RankThreshold {
  rank: RankTier;
  minXP: number;
  maxXP: number;
  minLevel: number;
  maxLevel: number;
  color: string;
  icon: string;
  description: string;
}

export interface PostTypeConfig {
  type: PostType;
  label: string;
  description: string;
  baseXP: number;
  icon: string;
  color: string;
}

export interface LevelUpResult {
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
}

export interface RankUpResult {
  didRankUp: boolean;
  oldRank: RankTier;
  newRank: RankTier;
  unlockedPerks?: string[];
}

export interface XPAwardResult {
  success: boolean;
  xpAwarded: number;
  newTotalXP: number;
  levelUpResult: LevelUpResult;
  rankUpResult: RankUpResult;
  transaction?: XPTransaction;
  error?: string;
}

export interface PowerUpResult {
  success: boolean;
  recipientXP?: number;
  giverXP?: number;
  powerUpsRemaining?: number;
  error?: string;
  resetTime?: string; // Time when power-ups reset if depleted
}

// Constants
export const RANK_THRESHOLDS: RankThreshold[] = [
  {
    rank: 'rookie',
    minXP: 0,
    maxXP: 999,
    minLevel: 1,
    maxLevel: 10,
    color: '#808080',
    icon: '🔰',
    description: 'Just starting out',
  },
  {
    rank: 'warrior',
    minXP: 1000,
    maxXP: 4999,
    minLevel: 11,
    maxLevel: 30,
    color: '#00e5ff',
    icon: '⚔️',
    description: 'Building momentum',
  },
  {
    rank: 'titan',
    minXP: 5000,
    maxXP: 14999,
    minLevel: 31,
    maxLevel: 60,
    color: '#ff00ff',
    icon: '👑',
    description: 'Dominating the game',
  },
  {
    rank: 'superhuman',
    minXP: 15000,
    maxXP: 39999,
    minLevel: 61,
    maxLevel: 90,
    color: '#ffa500',
    icon: '🔥',
    description: 'Beyond mortal limits',
  },
  {
    rank: 'god_tier',
    minXP: 40000,
    maxXP: 999999999,
    minLevel: 91,
    maxLevel: 999,
    color: '#FFD700',
    icon: '⚡',
    description: 'Legendary status',
  },
];

export const POST_TYPE_CONFIGS: PostTypeConfig[] = [
  {
    type: 'daily_check_in',
    label: 'Daily Check-In',
    description: 'Quick update on your day',
    baseXP: 10,
    icon: '📅',
    color: '#00e5ff',
  },
  {
    type: 'progress_update',
    label: 'Progress Update',
    description: 'Show your gains and improvements',
    baseXP: 25,
    icon: '📈',
    color: '#ff00ff',
  },
  {
    type: 'peak_condition',
    label: 'Peak Condition',
    description: 'Best physique, max effort',
    baseXP: 40,
    icon: '⭐',
    color: '#ffa500',
  },
  {
    type: 'just_sharing',
    label: 'Just Sharing',
    description: 'Social post, no XP',
    baseXP: 0,
    icon: '💬',
    color: '#808080',
  },
];

// XP Calculation Constants
export const XP_CONFIG = {
  POWER_UP_BASE_XP: 5,
  POWER_UP_LEVEL_MULTIPLIER: 0.5,
  POWER_UP_GIVER_XP: 2,
  VERIFICATION_BONUS_MULTIPLIER: 1.5, // +50%
  MAX_DAILY_POWER_UPS: 10,
  MAX_STREAK_MULTIPLIER: 1.5,
  STREAK_MULTIPLIER_INCREMENT: 0.1,
  STREAK_DAYS_FOR_MAX: 5,
};
