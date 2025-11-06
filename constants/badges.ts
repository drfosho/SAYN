/**
 * Badge System Constants
 *
 * SAYN values HONESTY over everything else.
 * Both Natural and Enhanced badges are badges of HONOR.
 */

export type BadgeType = 'natural' | 'enhanced' | 'under_review' | null;

export interface BadgeRequirements {
  type: BadgeType;
  name: string;
  description: string;
  requirements: string[];
  color: string;
  accentColor: string;
  icon: string;
}

export const BADGE_DEFINITIONS: Record<Exclude<BadgeType, null>, BadgeRequirements> = {
  natural: {
    type: 'natural',
    name: 'VERIFIED NATURAL',
    description: 'Drug-free athlete with verified natural progression',
    requirements: [
      '30+ days of verified photo uploads',
      'Consistent, realistic progress tracked',
      'Passed AI physique analysis',
      'No sustained community reports',
      'SAYN admin verification completed',
    ],
    color: '#00ff88', // Electric green
    accentColor: '#00e5ff', // Cyan
    icon: 'shield-checkmark',
  },
  enhanced: {
    type: 'enhanced',
    name: 'TRANSPARENT ENHANCED',
    description: 'Honest about enhancement use, maintains transparency',
    requirements: [
      'Self-disclosed enhancement use OR community verified',
      'Maintains verified photo uploads',
      'Transparent about their fitness journey',
      'SAYN admin verification completed',
    ],
    color: '#9D4EDD', // Deep purple
    accentColor: '#FF6B35', // Orange
    icon: 'shield-star',
  },
  under_review: {
    type: 'under_review',
    name: 'VERIFICATION PENDING',
    description: 'Profile is currently under review by SAYN',
    requirements: [
      'Community reports are being investigated',
      'SAYN admin review in progress',
      'Status will update once review is complete',
    ],
    color: '#FFD700', // Gold
    accentColor: '#FFA500', // Orange
    icon: 'shield-question',
  },
};

export const BADGE_PHILOSOPHY = {
  title: 'HONESTY OVER EVERYTHING',
  description:
    "SAYN doesn't judge Natural vs Enhanced. We judge HONESTY vs DISHONESTY.\n\n" +
    "Both Natural and Enhanced badges are badges of HONOR - they show transparency and credibility.\n\n" +
    "No badge simply means you haven't completed verification yet. It's not a negative mark.",
  principles: [
    'Natural Badge = Verified drug-free progression',
    'Enhanced Badge = Verified honest about enhancement use',
    'Both badges command RESPECT and CREDIBILITY',
    'Lying or misleading others is what we stand against',
  ],
};

export const REPORT_TYPES = [
  {
    id: 'fake_natural',
    label: 'Report Fake Natural',
    description: 'User claims natural but shows enhanced characteristics',
  },
  {
    id: 'misleading',
    label: 'Report Misleading Content',
    description: 'User is posting misleading fitness information',
  },
  {
    id: 'other',
    label: 'Report Other Issue',
    description: 'Other verification or credibility concern',
  },
] as const;
