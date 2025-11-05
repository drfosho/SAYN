import { Tabs } from 'expo-router';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={[styles.tabIcon, { color }]}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#0a0e27',
          borderTopColor: 'rgba(0, 212, 255, 0.2)',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚡" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏆" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <TabIcon emoji="➕" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <TabIcon emoji="👥" color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color }) => <TabIcon emoji="⭐" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 28,
  },
});
