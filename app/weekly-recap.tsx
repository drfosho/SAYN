import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  X,
  TrendingUp,
  Zap,
  MessageCircle,
  Users,
  Award,
  ChevronRight,
  Calendar,
  Target,
  Flame,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import {
  WeeklyRecap,
  getLatestRecap,
  getRecapById,
  generateWeeklyRecap,
  markRecapViewed,
  getMotivationalMessage,
} from '@/lib/api/weeklyRecap';
import { spacing, fontSize, fontWeight } from '@/constants';

export default function WeeklyRecapScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const [recap, setRecap] = useState<WeeklyRecap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecap();
  }, [id, user]);

  const loadRecap = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let recapData: WeeklyRecap | null = null;

      if (id) {
        // Load specific recap by ID
        recapData = await getRecapById(id);
      } else {
        // Try to get latest recap
        recapData = await getLatestRecap(user.id);

        // If no recap exists, generate one
        if (!recapData) {
          recapData = await generateWeeklyRecap(user.id);
        }
      }

      setRecap(recapData);

      // Mark as viewed if not already
      if (recapData && !recapData.viewed) {
        await markRecapViewed(recapData.id);
      }
    } catch (error) {
      console.error('Error loading recap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleViewHistory = () => {
    router.push('/recap-history');
  };

  const handleViewPost = (postId: string) => {
    router.push(`/post/${postId}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4ff" />
          <Text style={styles.loadingText}>Loading your recap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recap) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyContainer}>
          <Calendar size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No Recap Available</Text>
          <Text style={styles.emptySubtext}>
            Keep using SAYN and your weekly recap will be ready next Monday!
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const weekStart = new Date(recap.week_start_date);
  const weekEnd = new Date(recap.week_end_date);
  const motivationalMessage = getMotivationalMessage(recap);

  const leveledUp = recap.level_at_end && recap.level_at_start && recap.level_at_end > recap.level_at_start;
  const rankedUp = recap.rank_at_end && recap.rank_at_start && recap.rank_at_end !== recap.rank_at_start;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Close Button */}
      <TouchableOpacity style={styles.headerClose} onPress={handleClose}>
        <X size={24} color="white" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.2)', 'transparent']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Your Week in SAYN</Text>
          <Text style={styles.headerDates}>
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </LinearGradient>

        {/* Hero Stat - XP Earned */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>TOTAL XP EARNED</Text>
          <Text style={styles.heroValue}>{recap.xp_earned.toLocaleString()}</Text>
          <Text style={styles.heroSubtext}>Keep crushing it! 💪</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<ImageIcon size={24} color="#00d4ff" />}
            value={recap.total_posts}
            label="Posts Shared"
            color="#00d4ff"
          />
          <StatCard
            icon={<Zap size={24} color="#ff6b00" />}
            value={recap.power_ups_received}
            label="Power Ups"
            color="#ff6b00"
          />
          <StatCard
            icon={<MessageCircle size={24} color="#9D4EDD" />}
            value={recap.comments_received}
            label="Comments"
            color="#9D4EDD"
          />
          <StatCard
            icon={<Users size={24} color="#00ff88" />}
            value={recap.new_followers}
            label="New Followers"
            color="#00ff88"
          />
        </View>

        {/* Engagement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Engagement</Text>
          <View style={styles.engagementCard}>
            <EngagementRow label="Power Ups Given" value={recap.power_ups_given} />
            <EngagementRow label="Comments Posted" value={recap.comments_posted} />
            <EngagementRow
              label="Total Interactions"
              value={recap.power_ups_given + recap.comments_posted}
              highlight
            />
          </View>
        </View>

        {/* Verified Posts */}
        {recap.verified_posts > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <CheckCircle size={18} color="#00ff88" /> Verified Content
            </Text>
            <View style={styles.verifiedCard}>
              <Text style={styles.verifiedNumber}>{recap.verified_posts}</Text>
              <Text style={styles.verifiedLabel}>
                verified {recap.verified_posts === 1 ? 'post' : 'posts'} this week
              </Text>
            </View>
          </View>
        )}

        {/* Top Post */}
        {recap.most_powered_post_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Your Top Post</Text>
            <TouchableOpacity
              style={styles.topPostCard}
              onPress={() => handleViewPost(recap.most_powered_post_id!)}
            >
              <View style={styles.topPostInfo}>
                <Flame size={24} color="#ff6b00" />
                <Text style={styles.topPostLabel}>Most Powered Up</Text>
              </View>
              <View style={styles.topPostAction}>
                <Text style={styles.topPostActionText}>View Post</Text>
                <ChevronRight size={16} color="rgba(255,255,255,0.6)" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Section */}
        {(leveledUp || rankedUp) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Progress This Week</Text>
            {leveledUp && (
              <View style={styles.progressCard}>
                <Award size={32} color="#FFD700" />
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Level Up!</Text>
                  <Text style={styles.progressText}>
                    Level {recap.level_at_start} → Level {recap.level_at_end}
                  </Text>
                </View>
              </View>
            )}
            {rankedUp && (
              <View style={[styles.progressCard, styles.progressCardRank]}>
                <TrendingUp size={32} color="#00d4ff" />
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Rank Up!</Text>
                  <Text style={styles.progressText}>
                    {recap.rank_at_start} → {recap.rank_at_end}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Streak Section */}
        {recap.streak_days > 0 && (
          <View style={styles.section}>
            <View style={styles.streakCard}>
              <Flame size={28} color="#ff6b35" />
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{recap.streak_days} Day Streak</Text>
                <Text style={styles.streakLabel}>Keep it going!</Text>
              </View>
            </View>
          </View>
        )}

        {/* Motivational Message */}
        <View style={styles.motivationSection}>
          <Text style={styles.motivationText}>{motivationalMessage}</Text>
        </View>

        {/* View History Button */}
        <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
          <Text style={styles.historyButtonText}>View Past Recaps</Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}40` }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Engagement Row Component
interface EngagementRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function EngagementRow({ label, value, highlight = false }: EngagementRowProps) {
  return (
    <View style={[styles.engagementRow, highlight && styles.engagementRowHighlight]}>
      <Text style={styles.engagementLabel}>{label}</Text>
      <Text style={[styles.engagementValue, highlight && styles.engagementValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  headerClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: 'white',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  closeButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#050814',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerDates: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  heroLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: fontWeight.bold,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#00d4ff',
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  engagementCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  engagementRowHighlight: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderRadius: 12,
  },
  engagementLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  engagementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  engagementValueHighlight: {
    color: '#00d4ff',
  },
  verifiedCard: {
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  verifiedNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#00ff88',
  },
  verifiedLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  topPostCard: {
    backgroundColor: 'rgba(255,107,0,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topPostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topPostLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b00',
  },
  topPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topPostActionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  progressCardRank: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderColor: 'rgba(0,212,255,0.3)',
  },
  progressInfo: {
    marginLeft: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    gap: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff6b35',
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  motivationSection: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
    marginBottom: 24,
  },
  motivationText: {
    fontSize: 16,
    color: '#00ff88',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  historyButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
