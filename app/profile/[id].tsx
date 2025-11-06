import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ProfileHeader } from '@/components/ProfileHeader';
import { StatsRow } from '@/components/StatsRow';
import { AchievementScroll, Achievement } from '@/components/AchievementScroll';
import { PostsGrid, GridPost } from '@/components/PostsGrid';
import { FollowButton } from '@/components/FollowButton';
import { BadgeInfoModal } from '@/components/badges/BadgeInfoModal';
import { ReportButton } from '@/components/ReportButton';
import { useFollow } from '@/hooks/useFollow';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock profile data
const MOCK_PROFILE = {
  id: '1',
  username: 'GokuFitness',
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
  bio: 'Pushing limits every day. Train hard, recover harder. 💪⚡',
  location: 'Earth',
  level: 42,
  badge: 'natural' as const, // Verified natural athlete
  currentXP: 8750,
  nextLevelXP: 10000,
  followers: 15420,
  following: 342,
  totalPosts: 156,
  totalPowerUps: 45280,
  longestStreak: 87,
  joinDate: new Date('2024-01-15'),
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'First Post',
    icon: '🎯',
    description: 'Posted your first workout',
    unlockedAt: new Date('2024-01-16'),
  },
  {
    id: '2',
    name: 'Power Surge',
    icon: '⚡',
    description: 'Received 100 power ups',
    unlockedAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: 'Consistency King',
    icon: '🔥',
    description: '30 day posting streak',
    unlockedAt: new Date('2024-03-15'),
  },
  {
    id: '4',
    name: 'Community Leader',
    icon: '👑',
    description: 'Reached 1000 followers',
    unlockedAt: new Date('2024-04-20'),
  },
];

const MOCK_POSTS: GridPost[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/seed/workout1/400/400',
    isVerified: true,
    powerLevel: 1250,
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/seed/workout2/400/400',
    isVerified: true,
    powerLevel: 980,
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/seed/workout3/400/400',
    isVerified: false,
    powerLevel: 745,
  },
  {
    id: '4',
    imageUrl: undefined, // Text post
    isVerified: true,
    powerLevel: 1100,
  },
  {
    id: '5',
    imageUrl: 'https://picsum.photos/seed/workout5/400/400',
    isVerified: true,
    powerLevel: 1520,
  },
  {
    id: '6',
    imageUrl: 'https://picsum.photos/seed/workout6/400/400',
    isVerified: false,
    powerLevel: 620,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFollowing, toggleFollow } = useFollow();
  const [showStats, setShowStats] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);

  const isOwnProfile = id === 'me' || id === MOCK_PROFILE.id;

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    console.log('Edit profile');
  };

  const handleBadgePress = () => {
    setShowBadgeInfo(true);
  };

  const handlePowerUp = () => {
    console.log('Power up user');
  };

  const handleMessage = () => {
    console.log('Message user');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader
          avatarUrl={MOCK_PROFILE.avatarUrl}
          username={MOCK_PROFILE.username}
          level={MOCK_PROFILE.level}
          bio={MOCK_PROFILE.bio}
          location={MOCK_PROFILE.location}
          badge={MOCK_PROFILE.badge}
          onBack={handleBack}
          onEdit={handleEdit}
          isOwnProfile={isOwnProfile}
          onBadgePress={handleBadgePress}
        />

        {/* Stats Row */}
        <StatsRow
          level={MOCK_PROFILE.level}
          currentXP={MOCK_PROFILE.currentXP}
          nextLevelXP={MOCK_PROFILE.nextLevelXP}
          followers={MOCK_PROFILE.followers}
          following={MOCK_PROFILE.following}
          onFollowersPress={() => router.push('/followers')}
          onFollowingPress={() => router.push('/following')}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <>
              <ActionButton
                label="⚡ POWER UP"
                gradient={['#00e5ff', '#ff0080']}
                onPress={handlePowerUp}
                isPrimary
              />
              <ActionButton
                label="EDIT PROFILE"
                gradient={['#0d1128', '#1a1f3a']}
                onPress={handleEdit}
              />
            </>
          ) : (
            <>
              <ActionButton
                label="MESSAGE"
                gradient={['#0d1128', '#1a1f3a']}
                onPress={handleMessage}
              />
              <View style={styles.followButtonContainer}>
                <FollowButton
                  isFollowing={isFollowing(id || '')}
                  onPress={() => toggleFollow(id || '')}
                />
              </View>
            </>
          )}
        </View>

        {/* Report Button - Only for other users' profiles */}
        {!isOwnProfile && (
          <View style={styles.reportButtonContainer}>
            <ReportButton username={MOCK_PROFILE.username} userId={MOCK_PROFILE.id} />
          </View>
        )}

        {/* Achievements */}
        <AchievementScroll
          achievements={MOCK_ACHIEVEMENTS}
          onAchievementPress={(achievement) => console.log('Tapped:', achievement.name)}
        />

        {/* Posts Grid */}
        <PostsGrid
          posts={MOCK_POSTS}
          onPostPress={(post) => console.log('Tapped post:', post.id)}
        />

        {/* Expandable Stats Section */}
        <View style={styles.statsSection}>
          <Pressable
            onPress={() => setShowStats(!showStats)}
            style={styles.statsSectionHeader}
          >
            <Text style={styles.statsSectionTitle}>DETAILED STATS</Text>
            <Text style={styles.statsSectionIcon}>{showStats ? '▼' : '▶'}</Text>
          </Pressable>

          {showStats && (
            <View style={styles.detailedStats}>
              <StatItem label="Total Posts" value={MOCK_PROFILE.totalPosts.toString()} />
              <StatItem
                label="Total Power Ups"
                value={MOCK_PROFILE.totalPowerUps.toLocaleString()}
              />
              <StatItem label="Longest Streak" value={`${MOCK_PROFILE.longestStreak} days`} />
              <StatItem
                label="Member Since"
                value={MOCK_PROFILE.joinDate.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Badge Info Modal */}
      <BadgeInfoModal visible={showBadgeInfo} onClose={() => setShowBadgeInfo(false)} />
    </SafeAreaView>
  );
}

interface ActionButtonProps {
  label: string;
  gradient: [string, string];
  onPress: () => void;
  isPrimary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, gradient, onPress, isPrimary }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.94, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionButton, isPrimary && styles.actionButtonPrimary, animatedStyle]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.actionButtonGradient}
      >
        <Text style={styles.actionButtonText}>{label}</Text>
      </LinearGradient>
      {isPrimary && <View style={styles.actionButtonGlow} />}
    </AnimatedPressable>
  );
};

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statItemLabel}>{label}</Text>
    <Text style={styles.statItemValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  scrollView: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  actionButtonPrimary: {
    flex: 1.5,
  },
  followButtonContainer: {
    flex: 1,
  },
  reportButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  actionButtonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: '#00e5ff',
    opacity: 0.4,
    zIndex: -1,
  },
  statsSection: {
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#000000',
    backgroundColor: '#0d1128',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  statsSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
  },
  statsSectionIcon: {
    fontSize: 16,
    color: '#00e5ff',
  },
  detailedStats: {
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 229, 255, 0.2)',
    padding: 20,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
