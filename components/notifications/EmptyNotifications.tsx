import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyNotificationsProps {
  type?: 'all' | 'social' | 'achievements';
}

export default function EmptyNotifications({ type = 'all' }: EmptyNotificationsProps) {
  const getMessage = () => {
    switch (type) {
      case 'social':
        return {
          emoji: '👥',
          title: 'No Social Notifications',
          subtitle: 'Follows, power-ups, and comments will appear here',
        };
      case 'achievements':
        return {
          emoji: '🏆',
          title: 'No Achievement Notifications',
          subtitle: 'Level ups, rank ups, and badges will appear here',
        };
      case 'all':
      default:
        return {
          emoji: '🔔',
          title: 'No Notifications Yet',
          subtitle: 'Stay active and you\'ll start getting notifications!',
        };
    }
  };

  const message = getMessage();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{message.emoji}</Text>
      </View>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.subtitle}>{message.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
