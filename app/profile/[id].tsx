import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ProfileHeader } from '@/components/ProfileHeader';
import { StatsRow } from '@/components/StatsRow';
import { AchievementScroll, Achievement } from '@/components/AchievementScroll';
import { PostsGrid, GridPost } from '@/components/PostsGrid';
import { FollowButton } from '@/components/FollowButton';
import { BadgeInfoModal } from '@/components/badges/BadgeInfoModal';
import { ReportButton } from '@/components/ReportButton';
import { ProfileBadges } from '@/components/profile/ProfileBadges';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/lib/api/profiles';
import { getUserPosts } from '@/lib/api/posts';
import type { Profile as DBProfile, Post as DBPost } from '@/lib/api/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile: currentUserProfile } = useAuth();
  const { isFollowing, toggleFollow } = useFollow();

  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [rawPosts, setRawPosts] = useState<DBPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);

  const isOwnProfile = id === user?.id || id === currentUserProfile?.id;

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;

      console.log('🔄 Fetching profile data for:', id);
      setLoading(true);

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await getProfile(id);

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          setError(profileError);
          return;
        }

        if (!profileData) {
          console.error('❌ Profile not found');
          setError('Profile not found');
          return;
        }

        console.log('✅ Profile loaded:', profileData.username);
        setProfile(profileData);

        // Fetch user's posts
        console.log('🔄 Fetching user posts...');
        const { data: postsData, error: postsError } = await getUserPosts(id, 20, 0);

        if (postsError) {
          console.error('❌ Error fetching posts:', postsError);
        } else {
          console.log('✅ Posts loaded:', postsData?.length || 0);

          // Store raw posts for verification stats
          setRawPosts(postsData || []);

          // Map posts to grid format
          const gridPosts: GridPost[] = (postsData || []).map((post) => ({
            id: post.id,
            imageUrl: post.image_url || undefined,
            isVerified: post.verification_status === 'verified',
            powerLevel: post.power_count,
          }));

          setPosts(gridPosts);
        }

        setError(null);
      } catch (err: any) {
        console.error('❌ Exception fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push('/edit-profile');
  };

  const handleSettings = () => {
    router.push('/settings');
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

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error || 'Profile not found'}
          </Text>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate XP for next level (simplified formula)
  const nextLevelXP = profile.level * 1000;
  const currentXP = profile.xp % nextLevelXP;

  // Calculate verification stats
  const verifiedPosts = rawPosts.filter(p => p.verification_status === 'verified').length;
  const requestedVerificationPosts = rawPosts.filter(p => p.verification_requested).length;
  const verificationRate = requestedVerificationPosts > 0
    ? Math.round((verifiedPosts / requestedVerificationPosts) * 100)
    : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: profile?.username ? `@${profile.username}` : 'Profile',
          headerShown: true,
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: '#050814',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <ProfileHeader
            avatarUrl={profile.avatar_url || 'https://via.placeholder.com/150'}
            username={profile.username}
            level={profile.level}
          bio={profile.bio || ''}
          location={profile.location || ''}
          badge={profile.badge_type || undefined}
          onBack={handleBack}
          onEdit={handleEdit}
          onSettings={handleSettings}
          isOwnProfile={isOwnProfile}
          onBadgePress={handleBadgePress}
        />

        {/* Stats Row */}
        <StatsRow
          level={profile.level}
          currentXP={currentXP}
          nextLevelXP={nextLevelXP}
          followers={0} // TODO: Add follower count from API
          following={0} // TODO: Add following count from API
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
            <ReportButton username={profile.username} userId={profile.id} />
          </View>
        )}

        {/* Badges & Achievements */}
        <ProfileBadges
          level={profile.level}
          xp={profile.xp}
          badgeType={profile.badge_type}
          badgeVerified={profile.badge_verified}
          isVerifiedCoach={profile.is_verified_coach}
          postStreak={profile.post_streak}
          totalPosts={rawPosts.length}
        />

        {/* Posts Grid */}
        <PostsGrid
          posts={posts}
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
              <StatItem label="Total Posts" value={posts.length.toString()} />
              <StatItem
                label="Total Power Points"
                value={profile.power_points.toLocaleString()}
              />
              <StatItem label="Current Streak" value={`${profile.streak_days} days`} />
              <StatItem
                label="Verified Posts"
                value={verifiedPosts.toString()}
                highlight={verifiedPosts > 0}
              />
              <StatItem
                label="Verification Rate"
                value={requestedVerificationPosts > 0 ? `${verificationRate}%` : 'N/A'}
                highlight={verificationRate >= 70}
              />
              <StatItem
                label="Member Since"
                value={new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              />
              <StatItem label="Level" value={profile.level.toString()} />
              <StatItem label="XP" value={profile.xp.toLocaleString()} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Badge Info Modal */}
      <BadgeInfoModal visible={showBadgeInfo} onClose={() => setShowBadgeInfo(false)} />
    </SafeAreaView>
    </>
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
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, highlight = false }) => (
  <View style={styles.statItem}>
    <Text style={styles.statItemLabel}>{label}</Text>
    <Text style={[styles.statItemValue, highlight && styles.statItemValueHighlight]}>
      {highlight && '✓ '}
      {value}
    </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#00e5ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
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
  statItemValueHighlight: {
    color: '#00ff88',
    textShadowColor: '#00ff88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
