import { Tabs, router } from 'expo-router';
import React from 'react';
import { Zap, Trophy, PlusCircle, Search, User } from 'lucide-react-native';
import { layout, fontSize, fontWeight } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0e27',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.sm,
          fontWeight: fontWeight.semibold,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused, color }) => (
            <Zap
              size={layout.tabIconSize}
              color={color}
              strokeWidth={2.5}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Ranks',
          tabBarIcon: ({ focused, color }) => (
            <Trophy
              size={layout.tabIconSize}
              color={color}
              strokeWidth={2.5}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused, color }) => (
            <PlusCircle
              size={layout.tabIconSizeCenter}
              color={color}
              strokeWidth={2.5}
              fill={focused ? color : 'none'}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent navigation to create tab
            e.preventDefault();
            // Navigate to upload screen instead
            router.push('/upload');
          },
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => (
            <Search
              size={layout.tabIconSize}
              color={color}
              strokeWidth={2.5}
            />
          ),
        }}
      />

      {/* Hide other tabs but keep them mounted */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="ranks"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="achievements"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
