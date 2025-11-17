import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BadgeDisplay } from './BadgeDisplay';

interface BadgeStatusCardProps {
  badgeType: 'natural' | 'enhanced' | 'under_review' | null;
  badgeVerified: boolean;
  verificationDate: string | null;
  accountAgeDays: number;
}

export default function BadgeStatusCard({
  badgeType,
  badgeVerified,
  verificationDate,
  accountAgeDays,
}: BadgeStatusCardProps) {
  const getStatusInfo = () => {
    if (!badgeType) {
      return {
        title: 'No Badge',
        subtitle: 'Apply for Natural or Enhanced badge verification',
        color: '#6b7280',
        action: 'Apply Now',
        canApply: accountAgeDays >= 30,
      };
    }

    if (badgeType === 'under_review') {
      return {
        title: 'Badge Under Review',
        subtitle: 'Your badge is currently being reviewed due to community reports',
        color: '#FFD700',
        action: null,
        canApply: false,
      };
    }

    if (!badgeVerified) {
      return {
        title: `Unverified ${badgeType === 'natural' ? 'Natural' : 'Enhanced'} Badge`,
        subtitle: 'Complete verification to earn your permanent badge',
        color: badgeType === 'natural' ? '#00ff88' : '#9D4EDD',
        action: 'Verify Now',
        canApply: accountAgeDays >= 30,
      };
    }

    const formattedDate = verificationDate
      ? new Date(verificationDate).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : 'Recently';

    return {
      title: `Verified ${badgeType === 'natural' ? 'Natural' : 'Enhanced'} Badge`,
      subtitle: `Verified since ${formattedDate}`,
      color: badgeType === 'natural' ? '#00ff88' : '#9D4EDD',
      action: 'Update Badge',
      canApply: true,
    };
  };

  const statusInfo = getStatusInfo();

  const handlePress = () => {
    if (statusInfo.action) {
      router.push('/badge-application');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!statusInfo.canApply}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={
          badgeVerified
            ? [`${statusInfo.color}33`, `${statusInfo.color}11`]
            : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Left side - Badge icon */}
        <View style={styles.leftSection}>
          {badgeType && badgeType !== 'under_review' ? (
            <View style={[styles.badgeContainer, !badgeVerified && styles.badgeUnverified]}>
              <BadgeDisplay badgeType={badgeType} size="small" />
              {!badgeVerified && (
                <View style={styles.unverifiedOverlay}>
                  <Ionicons name="lock-closed" size={12} color="#ffa500" />
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: `${statusInfo.color}22` }]}>
              <Ionicons
                name={badgeType === 'under_review' ? 'alert-circle' : 'shield'}
                size={28}
                color={statusInfo.color}
              />
            </View>
          )}
        </View>

        {/* Middle section - Info */}
        <View style={styles.middleSection}>
          <Text style={styles.title}>{statusInfo.title}</Text>
          <Text style={styles.subtitle}>{statusInfo.subtitle}</Text>

          {/* Status indicators */}
          <View style={styles.indicators}>
            {badgeVerified && (
              <View style={[styles.indicator, { backgroundColor: `${statusInfo.color}22` }]}>
                <Ionicons name="checkmark-circle" size={14} color={statusInfo.color} />
                <Text style={[styles.indicatorText, { color: statusInfo.color }]}>Verified</Text>
              </View>
            )}

            {!badgeVerified && badgeType && badgeType !== 'under_review' && (
              <View style={styles.indicator}>
                <Ionicons name="time" size={14} color="#ffa500" />
                <Text style={[styles.indicatorText, { color: '#ffa500' }]}>Unverified</Text>
              </View>
            )}

            {badgeType === 'natural' && badgeVerified && (
              <View style={[styles.indicator, { backgroundColor: 'rgba(0, 229, 255, 0.15)' }]}>
                <Ionicons name="trending-up" size={14} color="#00e5ff" />
                <Text style={[styles.indicatorText, { color: '#00e5ff' }]}>+10% XP</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right section - Action */}
        {statusInfo.action && statusInfo.canApply && (
          <View style={styles.rightSection}>
            <View style={[styles.actionButton, { borderColor: statusInfo.color }]}>
              <Ionicons name="chevron-forward" size={20} color={statusInfo.color} />
            </View>
          </View>
        )}

        {/* Not eligible yet message */}
        {statusInfo.action && !statusInfo.canApply && (
          <View style={styles.rightSection}>
            <Text style={styles.notEligibleText}>
              {30 - accountAgeDays} days remaining
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pressed: {
    opacity: 0.7,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  leftSection: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'relative',
  },
  badgeUnverified: {
    opacity: 0.5,
  },
  unverifiedOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffa500',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notEligibleText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
});
