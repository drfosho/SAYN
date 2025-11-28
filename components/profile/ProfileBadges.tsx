import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Zap, ShieldCheck, Image as ImageIcon, Trophy } from 'lucide-react-native';
import { RankBadge } from '../RankBadge';
import { NaturalBadge } from '../badges/NaturalBadge';
import { EnhancedBadge } from '../badges/EnhancedBadge';
import { VerifiedCoachBadge } from '../badges/VerifiedCoachBadge';
import { getRankFromLevel } from '@/utils/getRankFromLevel';
import type { BadgeType } from '@/constants/badges';

interface ProfileBadgesProps {
  level: number;
  xp: number;
  badgeType?: BadgeType | null;
  badgeVerified?: boolean;
  isVerifiedCoach?: boolean;
  postStreak?: number;
  totalPosts?: number;
}

/**
 * ProfileBadges - Displays all user badges and achievements on profile
 * Shows rank, Natural/Enhanced status, coach verification, and achievement badges
 */
export const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  level,
  xp,
  badgeType,
  badgeVerified,
  isVerifiedCoach = false,
  postStreak = 0,
  totalPosts = 0,
}) => {
  const userRank = getRankFromLevel(level);

  // Check which achievement badges to show
  const has7DayStreak = postStreak >= 7;
  const has1kXP = xp >= 1000;
  const has10kXP = xp >= 10000;
  const has50kXP = xp >= 50000;
  const has100Posts = totalPosts >= 100;
  const has500Posts = totalPosts >= 500;

  const hasAnyAchievements = has7DayStreak || has1kXP || has10kXP || has50kXP || has100Posts || has500Posts;
  const hasMainBadges = (badgeType && badgeVerified) || isVerifiedCoach;

  // If no badges at all, show empty state
  if (!hasMainBadges && !hasAnyAchievements) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Badges & Achievements</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Keep posting to earn badges and achievements!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Badges & Achievements</Text>

      {/* Main Badges Row */}
      <View style={styles.mainBadges}>
        {/* Rank Badge - Always shown */}
        <View style={styles.badgeItem}>
          <RankBadge rank={userRank} size="large" animate={false} />
          <Text style={styles.badgeLabel}>Rank</Text>
        </View>

        {/* Natural/Enhanced Badge - If verified */}
        {badgeType && badgeVerified && (
          <View style={styles.badgeItem}>
            {badgeType === 'natural' ? (
              <NaturalBadge size="large" />
            ) : (
              <EnhancedBadge size="large" />
            )}
            <Text style={styles.badgeLabel}>
              {badgeType === 'natural' ? 'Natural' : 'Enhanced'}
            </Text>
          </View>
        )}

        {/* Verified Coach Badge */}
        {isVerifiedCoach && (
          <View style={styles.badgeItem}>
            <VerifiedCoachBadge size="large" />
            <Text style={styles.badgeLabel}>Coach</Text>
          </View>
        )}
      </View>

      {/* Achievement Badges */}
      {hasAnyAchievements && (
        <View style={styles.achievementBadges}>
          {/* Streak Badge */}
          {has7DayStreak && (
            <AchievementBadge
              icon="flame"
              label={`${postStreak} Day Streak`}
              color="#ff6b00"
            />
          )}

          {/* XP Milestone Badges */}
          {has1kXP && (
            <AchievementBadge
              icon="zap"
              label="1K XP"
              color="#00d4ff"
            />
          )}
          {has10kXP && (
            <AchievementBadge
              icon="zap"
              label="10K XP"
              color="#9D4EDD"
            />
          )}
          {has50kXP && (
            <AchievementBadge
              icon="zap"
              label="50K XP"
              color="#FFD700"
            />
          )}

          {/* Post Milestone Badges */}
          {has100Posts && (
            <AchievementBadge
              icon="image"
              label="100 Posts"
              color="#ff0099"
            />
          )}
          {has500Posts && (
            <AchievementBadge
              icon="trophy"
              label="500 Posts"
              color="#FFD700"
            />
          )}
        </View>
      )}
    </View>
  );
};

// Individual Achievement Badge Component
interface AchievementBadgeProps {
  icon: 'flame' | 'zap' | 'shield-check' | 'image' | 'trophy';
  label: string;
  color: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ icon, label, color }) => {
  const IconComponent = {
    flame: Flame,
    zap: Zap,
    'shield-check': ShieldCheck,
    image: ImageIcon,
    trophy: Trophy,
  }[icon];

  return (
    <View style={[styles.achievementBadge, { borderColor: color }]}>
      <IconComponent size={16} color={color} strokeWidth={2.5} />
      <Text style={[styles.achievementLabel, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#050814',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mainBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  achievementBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textAlign: 'center',
  },
});
