import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface PowerUpCounterProps {
  remaining: number;
  total?: number;
  compact?: boolean;
}

export function PowerUpCounter({
  remaining,
  total = 10,
  compact = false,
}: PowerUpCounterProps) {
  const percentage = (remaining / total) * 100;

  // Color based on remaining power-ups
  const getColor = () => {
    if (percentage >= 70) return '#00ff88';
    if (percentage >= 40) return '#ffa500';
    return '#ff4444';
  };

  const color = getColor();

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(remaining === 0 ? 0.9 : 1) }],
  }));

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, scaleStyle]}>
        <Ionicons name="flash" size={16} color={color} />
        <Text style={[styles.compactText, { color }]}>
          {remaining}/{total}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, scaleStyle]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="flash" size={20} color={color} />
          <Text style={styles.title}>Daily Power-Ups</Text>
        </View>
        <Text style={[styles.count, { color }]}>
          {remaining}/{total}
        </Text>
      </View>

      {/* Power-up dots visualization */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index < remaining
                    ? color
                    : 'rgba(255, 255, 255, 0.1)',
              },
            ]}
          />
        ))}
      </View>

      {remaining === 0 && (
        <Text style={styles.depleted}>
          Out of Power-Ups! Resets at midnight
        </Text>
      )}

      {remaining > 0 && remaining <= 3 && (
        <Text style={styles.warning}>Running low! Use wisely</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactText: {
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  count: {
    fontSize: 20,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  depleted: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ff4444',
    marginTop: 12,
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffa500',
    marginTop: 12,
    textAlign: 'center',
  },
});
