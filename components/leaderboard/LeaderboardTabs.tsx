import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardType } from '@/lib/api/leaderboard';

interface Tab {
  id: LeaderboardType;
  label: string;
  emoji: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'all_time',
    label: 'All Time',
    emoji: '⚡',
    description: 'Top users by total XP',
  },
  {
    id: 'weekly',
    label: 'This Week',
    emoji: '🔥',
    description: 'Most XP gained this week',
  },
  {
    id: 'streaks',
    label: 'Streaks',
    emoji: '💪',
    description: 'Longest posting streaks',
  },
  {
    id: 'verified',
    label: 'Verified',
    emoji: '✓',
    description: 'Highest verification rate',
  },
];

interface LeaderboardTabsProps {
  activeTab: LeaderboardType;
  onTabChange: (tab: LeaderboardType) => void;
}

export default function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable key={tab.id} onPress={() => onTabChange(tab.id)} style={styles.tabWrapper}>
              {isActive ? (
                <LinearGradient
                  colors={['#00e5ff', '#ff0080']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeTab}
                >
                  <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                  <Text style={styles.activeTabLabel}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                  <Text style={styles.inactiveTabLabel}>{tab.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Active tab description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {TABS.find((t) => t.id === activeTab)?.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabWrapper: {
    marginBottom: 12,
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  tabEmoji: {
    fontSize: 18,
  },
  activeTabLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  inactiveTabLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  description: {
    fontSize: 13,
    color: '#00e5ff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
