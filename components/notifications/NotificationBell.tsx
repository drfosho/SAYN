import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getUnreadCount, subscribeToNotifications } from '@/lib/api/notifications';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial unread count
    loadUnreadCount();

    // Subscribe to real-time notifications
    const channel = subscribeToNotifications(user.id, () => {
      // New notification received, refresh count
      loadUnreadCount();
    });

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    const { data } = await getUnreadCount(user.id);
    if (data !== null) {
      setUnreadCount(data);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bell}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bell: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff0080',
    borderWidth: 2,
    borderColor: '#050814',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
});
