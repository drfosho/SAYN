import React from 'react';
import { BadgeType } from '@/constants/badges';
import { NaturalBadge } from './NaturalBadge';
import { EnhancedBadge } from './EnhancedBadge';
import { UnderReviewBadge } from './UnderReviewBadge';

interface BadgeDisplayProps {
  badgeType: BadgeType;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showLabel?: boolean;
}

/**
 * Unified badge display component
 * Renders the appropriate badge based on type
 */
export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badgeType,
  size = 'medium',
  onPress,
  showLabel = false,
}) => {
  if (!badgeType) {
    return null;
  }

  switch (badgeType) {
    case 'natural':
      return <NaturalBadge size={size} onPress={onPress} showLabel={showLabel} />;
    case 'enhanced':
      return <EnhancedBadge size={size} onPress={onPress} showLabel={showLabel} />;
    case 'under_review':
      return <UnderReviewBadge size={size} onPress={onPress} showLabel={showLabel} />;
    default:
      return null;
  }
};
