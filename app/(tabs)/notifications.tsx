import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  Notification,
  NotificationType,
} from '@/lib/api/notifications';
import NotificationCard from '@/components/notifications/NotificationCard';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

type TabType = 'all' | 'social' | 'achievements';

const SOCIAL_TYPES: NotificationType[] = ['follow', 'power_up', 'comment'];
const ACHIEVEMENT_TYPES: NotificationType[] = [
  'level_up',
  'rank_up',
  'streak_milestone',
  'badge_earned',
];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscribe to real-time notifications
    const channel = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, activeTab]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await getNotifications(user.id, undefined, 100);
    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    const { data } = await markAllAsRead(user.id);
    if (data) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'social':
        return notifications.filter((n) => SOCIAL_TYPES.includes(n.type));
      case 'achievements':
        return notifications.filter((n) => ACHIEVEMENT_TYPES.includes(n.type));
      case 'all':
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {hasUnread && (
          <Pressable onPress={handleMarkAllRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
          {activeTab === 'all' && <View style={styles.tabIndicator} />}
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'social' && styles.activeTab]}
          onPress={() => setActiveTab('social')}
        >
          <Text style={[styles.tabText, activeTab === 'social' && styles.activeTabText]}>
            Social
          </Text>
          {activeTab === 'social' && <View style={styles.tabIndicator} />}
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text
            style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}
          >
            Achievements
          </Text>
          {activeTab === 'achievements' && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <EmptyNotifications
          type={activeTab === 'all' ? 'all' : activeTab === 'social' ? 'social' : 'achievements'}
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard notification={item} onPress={handleNotificationPress} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00e5ff"
              colors={['#00e5ff']}
            />
          }
          contentContainerStyle={
            filteredNotifications.length === 0 && styles.emptyListContent
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: '#00e5ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00e5ff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#00e5ff',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});
