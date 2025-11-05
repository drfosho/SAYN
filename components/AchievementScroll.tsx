import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: Date;
}

interface AchievementScrollProps {
  achievements: Achievement[];
  onAchievementPress?: (achievement: Achievement) => void;
}

/**
 * Horizontal scroll of achievement badges with comic burst effects
 * Following SAYN's powerful aesthetic
 */
export const AchievementScroll: React.FC<AchievementScrollProps> = ({
  achievements,
  onAchievementPress,
}) => {
  if (achievements.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyText}>Start posting to earn badges!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {achievements.map((achievement, index) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            index={index}
            onPress={() => onAchievementPress?.(achievement)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface AchievementBadgeProps {
  achievement: Achievement;
  index: number;
  onPress?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, index, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.badgeWrapper}>
      <LinearGradient
        colors={['#0d1128', '#1a1f3a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        {/* Comic burst effect */}
        <View style={styles.burstContainer}>
          {[0, 45, 90, 135].map((angle) => (
            <View
              key={angle}
              style={[
                styles.burstLine,
                { transform: [{ rotate: `${angle}deg` }] },
              ]}
            />
          ))}
        </View>

        {/* Achievement icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{achievement.icon}</Text>
        </View>

        {/* Achievement name */}
        <Text style={styles.badgeName} numberOfLines={2}>
          {achievement.name}
        </Text>
      </LinearGradient>

      {/* Badge glow */}
      <View style={styles.badgeGlow} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 12,
  },
  badgeWrapper: {
    position: 'relative',
    width: 120,
  },
  badge: {
    width: 120,
    height: 140,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#000000',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  burstContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burstLine: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#00e5ff',
    opacity: 0.4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 3,
    borderColor: '#00e5ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  badgeGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 18,
    backgroundColor: '#00e5ff',
    opacity: 0.2,
    zIndex: -1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
