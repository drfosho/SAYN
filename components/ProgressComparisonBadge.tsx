import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface ProgressComparisonBadgeProps {
  size?: 'small' | 'medium';
}

/**
 * Badge shown on posts that include AI progress comparison
 * Indicates the post contains before/after analysis with AI feedback
 */
export const ProgressComparisonBadge: React.FC<ProgressComparisonBadgeProps> = ({
  size = 'small',
}) => {
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeMedium]}>
      <Text style={[styles.icon, isSmall ? styles.iconSmall : styles.iconMedium]}>
        📊
      </Text>
      <Text style={[styles.label, isSmall ? styles.labelSmall : styles.labelMedium]}>
        PROGRESS COMPARISON
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 170, 0.15)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff00aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    shadowColor: '#ff00aa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeSmall: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  badgeMedium: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  icon: {
    fontSize: 12,
  },
  iconSmall: {
    fontSize: 10,
  },
  iconMedium: {
    fontSize: 14,
  },
  label: {
    fontWeight: '900',
    color: '#ff00aa',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  labelSmall: {
    fontSize: 9,
  },
  labelMedium: {
    fontSize: 11,
  },
});
