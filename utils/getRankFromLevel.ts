import { RANK_TIERS, RankDefinition, RANK_ORDER } from '@/constants/ranks';

/**
 * Get the rank definition based on user level
 */
export const getRankFromLevel = (level: number): RankDefinition => {
  for (const tier of RANK_ORDER) {
    const rank = RANK_TIERS[tier];
    if (level >= rank.minLevel && level <= rank.maxLevel) {
      return rank;
    }
  }

  // If level exceeds all ranges, return the highest tier (God Tier)
  return RANK_TIERS.god;
};

/**
 * Calculate progress to next rank
 */
export const getProgressToNextRank = (level: number): {
  currentRank: RankDefinition;
  nextRank: RankDefinition | null;
  progress: number; // 0-1
  levelsRemaining: number;
} => {
  const currentRank = getRankFromLevel(level);
  const currentTierIndex = RANK_ORDER.indexOf(currentRank.tier);

  // Check if there's a next rank
  const nextTier = RANK_ORDER[currentTierIndex + 1];
  const nextRank = nextTier ? RANK_TIERS[nextTier] : null;

  if (!nextRank) {
    // Already at max rank
    return {
      currentRank,
      nextRank: null,
      progress: 1,
      levelsRemaining: 0,
    };
  }

  // Calculate progress within current rank tier
  const levelsInCurrentTier = currentRank.maxLevel - currentRank.minLevel + 1;
  const currentLevelInTier = level - currentRank.minLevel;
  const progress = currentLevelInTier / levelsInCurrentTier;
  const levelsRemaining = currentRank.maxLevel - level + 1;

  return {
    currentRank,
    nextRank,
    progress,
    levelsRemaining,
  };
};
