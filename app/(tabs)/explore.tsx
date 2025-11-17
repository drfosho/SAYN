import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import {
  LeaderboardType,
  getAllTimeLeaderboard,
  getWeeklyLeaderboard,
  getStreakLeaderboard,
  getVerifiedLeaderboard,
  getUserLeaderboardPosition,
  LeaderboardEntry,
} from '@/lib/api/leaderboard';
import LeaderboardTabs from '@/components/leaderboard/LeaderboardTabs';
import LeaderboardList from '@/components/leaderboard/LeaderboardList';
import UserPosition from '@/components/leaderboard/UserPosition';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<number>(0);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load leaderboard data
  const loadLeaderboard = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      }

      try {
        let result;

        switch (activeTab) {
          case 'all_time':
            result = await getAllTimeLeaderboard(100);
            break;
          case 'weekly':
            result = await getWeeklyLeaderboard(100);
            break;
          case 'streaks':
            result = await getStreakLeaderboard(100);
            break;
          case 'verified':
            result = await getVerifiedLeaderboard(100);
            break;
        }

        if (result.data) {
          setEntries(result.data);
        } else {
          setEntries([]);
        }

        // Get user's position if logged in
        if (user?.id) {
          const positionResult = await getUserLeaderboardPosition(user.id, activeTab);
          if (positionResult.data) {
            setUserPosition(positionResult.data.position);
            setUserEntry(positionResult.data.entry);
          } else {
            setUserPosition(0);
            setUserEntry(null);
          }
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setEntries([]);
      } finally {
        setRefreshing(false);
      }
    },
    [activeTab, user?.id]
  );

  // Load on mount and when tab changes
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Handle tab change
  const handleTabChange = (tab: LeaderboardType) => {
    setActiveTab(tab);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadLeaderboard(true);
  };

  // Scroll to user's position
  const scrollToUserPosition = () => {
    // This will be handled by LeaderboardList
    // For now, just a placeholder
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0e27', '#0a0e27']} style={styles.background}>
        {/* Header with tabs */}
        <LeaderboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Leaderboard list */}
        <View style={styles.listContainer}>
          <LeaderboardList
            entries={entries}
            leaderboardType={activeTab}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            userPosition={userPosition}
          />
        </View>

        {/* User position footer */}
        {user && (
          <UserPosition
            position={userPosition}
            entry={userEntry}
            leaderboardType={activeTab}
            onPress={scrollToUserPosition}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  background: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});
