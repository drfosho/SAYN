import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyRecap, getUserRecaps } from '@/lib/api/weeklyRecap';
import { spacing, fontSize, fontWeight } from '@/constants';

export default function RecapHistoryScreen() {
  const { user } = useAuth();
  const [recaps, setRecaps] = useState<WeeklyRecap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecaps();
  }, [user]);

  const loadRecaps = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserRecaps(user.id);
      setRecaps(data);
    } catch (error) {
      console.error('Error loading recaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewRecap = (recap: WeeklyRecap) => {
    router.push(`/weekly-recap?id=${recap.id}`);
  };

  // Calculate trend compared to previous recap
  const getTrend = (current: WeeklyRecap, index: number): 'up' | 'down' | 'same' => {
    const previous = recaps[index + 1];
    if (!previous) return 'same';

    const currentScore = current.xp_earned + current.total_posts * 100;
    const previousScore = previous.xp_earned + previous.total_posts * 100;

    if (currentScore > previousScore) return 'up';
    if (currentScore < previousScore) return 'down';
    return 'same';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Past Recaps</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Recaps</Text>
        <View style={styles.headerSpacer} />
      </View>

      {recaps.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No Recaps Yet</Text>
          <Text style={styles.emptySubtext}>
            Your weekly recaps will appear here after your first week of activity.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Banner */}
          <View style={styles.summaryBanner}>
            <Text style={styles.summaryLabel}>Total Weeks Tracked</Text>
            <Text style={styles.summaryValue}>{recaps.length}</Text>
          </View>

          {/* Recap List */}
          <View style={styles.recapList}>
            {recaps.map((recap, index) => (
              <RecapCard
                key={recap.id}
                recap={recap}
                trend={getTrend(recap, index)}
                onPress={() => handleViewRecap(recap)}
                isLatest={index === 0}
              />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

interface RecapCardProps {
  recap: WeeklyRecap;
  trend: 'up' | 'down' | 'same';
  onPress: () => void;
  isLatest: boolean;
}

function RecapCard({ recap, trend, onPress, isLatest }: RecapCardProps) {
  const weekStart = new Date(recap.week_start_date);
  const weekEnd = new Date(recap.week_end_date);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#00ff88' : trend === 'down' ? '#ff6b6b' : 'rgba(255,255,255,0.4)';

  return (
    <TouchableOpacity
      style={[styles.recapCard, isLatest && styles.recapCardLatest]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.recapCardContent}>
        {/* Date Range */}
        <View style={styles.recapDates}>
          <Calendar size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.recapDateText}>
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          {isLatest && (
            <View style={styles.latestBadge}>
              <Text style={styles.latestBadgeText}>Latest</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.recapStats}>
          <View style={styles.recapStat}>
            <Text style={styles.recapStatValue}>{recap.xp_earned.toLocaleString()}</Text>
            <Text style={styles.recapStatLabel}>XP</Text>
          </View>
          <View style={styles.recapStatDivider} />
          <View style={styles.recapStat}>
            <Text style={styles.recapStatValue}>{recap.total_posts}</Text>
            <Text style={styles.recapStatLabel}>Posts</Text>
          </View>
          <View style={styles.recapStatDivider} />
          <View style={styles.recapStat}>
            <Text style={styles.recapStatValue}>{recap.power_ups_received}</Text>
            <Text style={styles.recapStatLabel}>Power Ups</Text>
          </View>
          <View style={styles.recapStatDivider} />
          <View style={styles.recapStat}>
            <Text style={styles.recapStatValue}>{recap.new_followers}</Text>
            <Text style={styles.recapStatLabel}>Followers</Text>
          </View>
        </View>
      </View>

      {/* Right Side */}
      <View style={styles.recapCardRight}>
        <TrendIcon size={20} color={trendColor} />
        <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  summaryBanner: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: '#00d4ff',
  },
  recapList: {
    gap: spacing.md,
  },
  recapCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  recapCardLatest: {
    borderColor: 'rgba(0,212,255,0.3)',
    backgroundColor: 'rgba(0,212,255,0.05)',
  },
  recapCardContent: {
    flex: 1,
  },
  recapDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  recapDateText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  latestBadge: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#050814',
    textTransform: 'uppercase',
  },
  recapStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recapStat: {
    flex: 1,
    alignItems: 'center',
  },
  recapStatValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  recapStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  recapStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  recapCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
  },
});
