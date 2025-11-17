import React, { useRef } from 'react';
import { FlatList, StyleSheet, View, Text, RefreshControl } from 'react-native';
import { LeaderboardEntry } from '@/lib/api/leaderboard';
import LeaderboardCard from './LeaderboardCard';
import PodiumDisplay from './PodiumDisplay';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  leaderboardType: 'all_time' | 'weekly' | 'streaks' | 'verified';
  refreshing: boolean;
  onRefresh: () => void;
  userPosition?: number;
  scrollToPosition?: (position: number) => void;
}

export default function LeaderboardList({
  entries,
  leaderboardType,
  refreshing,
  onRefresh,
  userPosition,
  scrollToPosition,
}: LeaderboardListProps) {
  const flatListRef = useRef<FlatList>(null);

  // Expose scroll method
  React.useImperativeHandle(scrollToPosition as any, () => ({
    scrollToPosition: (position: number) => {
      // Find index (accounting for podium header)
      const index = entries.findIndex((e) => e.position === position);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index: index + 1, // +1 for header
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
  }));

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={styles.emptyTitle}>No Rankings Yet</Text>
        <Text style={styles.emptySubtitle}>
          {leaderboardType === 'weekly' && 'Be the first to earn XP this week!'}
          {leaderboardType === 'streaks' && 'Start posting daily to build a streak!'}
          {leaderboardType === 'verified' &&
            'Get verified posts to appear on this leaderboard!'}
          {leaderboardType === 'all_time' && 'Start earning XP to climb the ranks!'}
        </Text>
      </View>
    );
  }

  const topThree = entries.slice(0, 3);
  const restOfList = entries.slice(3);

  return (
    <FlatList
      ref={flatListRef}
      data={[{ type: 'podium' }, ...restOfList.map((e) => ({ type: 'card', entry: e }))]}
      keyExtractor={(item, index) =>
        item.type === 'podium' ? 'podium' : `card-${item.entry?.id || index}`
      }
      renderItem={({ item }) => {
        if (item.type === 'podium') {
          return <PodiumDisplay entries={topThree} leaderboardType={leaderboardType} />;
        }
        return <LeaderboardCard entry={item.entry!} leaderboardType={leaderboardType} />;
      }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00e5ff"
          colors={['#00e5ff']}
        />
      }
      onScrollToIndexFailed={(info) => {
        // Handle scroll failure gracefully
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.5,
          });
        });
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100, // Space for user position footer
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
