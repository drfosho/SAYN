import { RANK_TIERS, RankTier } from '@/constants/ranks';

/**
 * Get the primary color for a rank tier
 * Used for default avatar glow and other rank-based styling
 */
export const getRankColor = (rank?: string | RankTier): string => {
  if (!rank) return '#00d4ff'; // Default cyan

  const normalizedRank = rank.toLowerCase() as RankTier;
  const rankDef = RANK_TIERS[normalizedRank];

  if (rankDef) {
    return rankDef.colors.primary;
  }

  // Fallback colors for any string-based ranks
  switch (normalizedRank) {
    case 'rookie':
      return '#808080';
    case 'warrior':
      return '#00d4ff';
    case 'titan':
      return '#00ffff';
    case 'superhuman':
      return '#ff0099';
    case 'god':
      return '#FFD700';
    default:
      return '#00d4ff';
  }
};
