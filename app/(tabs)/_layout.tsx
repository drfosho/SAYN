import { Tabs, router } from 'expo-router';
import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticTab } from '@/components/haptic-tab';
import NotificationBell from '@/components/notifications/NotificationBell';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={[styles.tabIcon, { color }]}>{emoji}</Text>;
}

// Custom center upload button
function UploadButton() {
  return (
    <Pressable
      onPress={() => router.push('/upload')}
      style={styles.uploadButtonWrapper}
    >
      <LinearGradient
        colors={['#00e5ff', '#ff0080']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.uploadButton}
      >
        <Text style={styles.uploadButtonIcon}>➕</Text>
      </LinearGradient>
      <View style={styles.uploadButtonGlow} />
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00e5ff', // Updated to new electric cyan
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#050814', // Darker background
          borderTopColor: 'rgba(0, 229, 255, 0.3)', // Stronger cyan
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700', // Bolder weight
          letterSpacing: 0.5,
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
          title: '',
          tabBarIcon: () => <UploadButton />,
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={() => router.push('/upload')}
              style={styles.createTabButton}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Coaches',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏅" color={color} />,
          href: '/coaches',
        }}
      />
      <Tabs.Screen
        name="ranks"
        options={{
          title: 'Ranks',
          tabBarIcon: ({ color }) => <TabIcon emoji="👑" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 28,
  },
  createTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonWrapper: {
    position: 'relative',
    marginTop: -20, // Elevate above tab bar
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'visible',
  },
  uploadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
  },
  uploadButtonIcon: {
    fontSize: 32,
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  uploadButtonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 38,
    backgroundColor: '#00e5ff',
    opacity: 0.4,
    zIndex: -1,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
});
