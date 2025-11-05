export type RankTier = 'rookie' | 'warrior' | 'titan' | 'superhuman' | 'god';

export interface RankDefinition {
  tier: RankTier;
  name: string;
  minLevel: number;
  maxLevel: number;
  colors: {
    primary: string;
    secondary: string;
  };
  gradientColors: string[];
  glowColor: string;
  ringCount: number;
  icon: string;
  unlocks: string[];
}

export const RANK_TIERS: Record<RankTier, RankDefinition> = {
  rookie: {
    tier: 'rookie',
    name: 'ROOKIE',
    minLevel: 1,
    maxLevel: 10,
    colors: {
      primary: '#6b7280',
      secondary: '#9ca3af',
    },
    gradientColors: ['#6b7280', '#9ca3af'],
    glowColor: '#6b7280',
    ringCount: 0,
    icon: '🥊',
    unlocks: [
      'Access to community feed',
      'Basic post creation',
      'Follow other users',
      'Power up posts',
    ],
  },
  warrior: {
    tier: 'warrior',
    name: 'WARRIOR',
    minLevel: 11,
    maxLevel: 30,
    colors: {
      primary: '#0088ff',
      secondary: '#00b4ff',
    },
    gradientColors: ['#0088ff', '#00b4ff'],
    glowColor: '#0088ff',
    ringCount: 1,
    icon: '⚔️',
    unlocks: [
      '1 Power Ring unlock',
      'Verified post badge',
      'Custom profile themes',
      'Access to challenges',
    ],
  },
  titan: {
    tier: 'titan',
    name: 'TITAN',
    minLevel: 31,
    maxLevel: 60,
    colors: {
      primary: '#00e5ff',
      secondary: '#00ffcc',
    },
    gradientColors: ['#00e5ff', '#00ffcc'],
    glowColor: '#00e5ff',
    ringCount: 2,
    icon: '💎',
    unlocks: [
      '2 Power Rings unlock',
      'Electric profile aura',
      'Priority feed placement',
      'Exclusive badges',
    ],
  },
  superhuman: {
    tier: 'superhuman',
    name: 'SUPERHUMAN',
    minLevel: 61,
    maxLevel: 90,
    colors: {
      primary: '#ff0080',
      secondary: '#ff4500',
    },
    gradientColors: ['#ff0080', '#ff4500', '#ffaa00'],
    glowColor: '#ff0080',
    ringCount: 2,
    icon: '🔥',
    unlocks: [
      'Dual-color Power Rings',
      'Animated profile effects',
      'Special power up effects',
      'Mentor status',
    ],
  },
  god: {
    tier: 'god',
    name: 'GOD TIER',
    minLevel: 91,
    maxLevel: 999,
    colors: {
      primary: '#ffd700',
      secondary: '#ffed4e',
    },
    gradientColors: ['#ffd700', '#ffed4e', '#ffaa00', '#ff6b00'],
    glowColor: '#ffd700',
    ringCount: 3,
    icon: '👑',
    unlocks: [
      '3 Power Rings unlock',
      'Multi-color electric effects',
      'Legendary profile frame',
      'Exclusive god tier community',
    ],
  },
};

// Helper array for displaying ranks in order
export const RANK_ORDER: RankTier[] = ['rookie', 'warrior', 'titan', 'superhuman', 'god'];
