import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { Notification } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

export default function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'follow':
        return '👥';
      case 'power_up':
        return '⚡';
      case 'comment':
        return '💬';
      case 'level_up':
        return '🎯';
      case 'rank_up':
        return '👑';
      case 'streak_milestone':
        return '🔥';
      case 'badge_earned':
        return '🏅';
      case 'badge_under_review':
        return '⚠️';
      case 'weekly_recap':
        return '📊';
      case 'system':
      default:
        return '🔔';
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'follow':
        if (notification.actor_id) {
          router.push(`/profile/${notification.actor_id}`);
        }
        break;
      case 'power_up':
      case 'comment':
        if (notification.related_id) {
          router.push(`/post/${notification.related_id}`);
        }
        break;
      case 'level_up':
      case 'rank_up':
      case 'streak_milestone':
      case 'badge_earned':
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <Pressable
      style={[styles.container, !notification.read && styles.unread]}
      onPress={handlePress}
    >
      {/* Unread Indicator */}
      {!notification.read && <View style={styles.unreadDot} />}

      {/* Icon or Avatar */}
      <View style={styles.iconContainer}>
        {notification.actor?.avatar_url ? (
          <Image
            source={{ uri: notification.actor.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{getNotificationIcon()}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {notification.title}
        </Text>
        {notification.message && (
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        )}
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {/* Badge for actor if they have one */}
      {notification.actor?.badge_type && notification.actor?.badge_verified && (
        <View style={styles.actorBadge}>
          <Text style={styles.badgeEmoji}>
            {notification.actor.badge_type === 'natural' ? '🌿' : '💊'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#0a0f1e',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
    position: 'relative',
  },
  unread: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: 12,
    marginLeft: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
  },
  actorBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  badgeEmoji: {
    fontSize: 20,
  },
});
