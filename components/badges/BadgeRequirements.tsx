import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BadgeEligibility, BadgeType } from '@/lib/api/badges';

interface BadgeRequirementsProps {
  eligibility: BadgeEligibility | null;
  badgeType: BadgeType;
}

export default function BadgeRequirements({ eligibility, badgeType }: BadgeRequirementsProps) {
  if (!eligibility) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking eligibility...</Text>
      </View>
    );
  }

  const requirementItems = Object.entries(eligibility.requirements).map(([key, req]) => ({
    key,
    ...req,
  }));

  const badgeColor = badgeType === 'natural' ? '#00ff88' : '#9D4EDD';
  const badgeName = badgeType === 'natural' ? 'Natural' : 'Enhanced';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{badgeName} Badge Requirements</Text>
        {eligibility.eligible ? (
          <View style={styles.eligibleBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
            <Text style={styles.eligibleText}>All requirements met!</Text>
          </View>
        ) : (
          <View style={styles.notEligibleBadge}>
            <Ionicons name="time" size={24} color="#ffa500" />
            <Text style={styles.notEligibleText}>Keep grinding!</Text>
          </View>
        )}
      </View>

      {/* Requirements List */}
      <View style={styles.requirementsList}>
        {requirementItems.map((req, index) => {
          const isMet = req.met;
          return (
            <View key={req.key} style={styles.requirementItem}>
              <LinearGradient
                colors={
                  isMet
                    ? ['rgba(0, 255, 136, 0.2)', 'rgba(0, 229, 255, 0.1)']
                    : ['rgba(255, 165, 0, 0.1)', 'rgba(255, 165, 0, 0.05)']
                }
                style={styles.requirementGradient}
              >
                {/* Icon */}
                <View style={[styles.iconContainer, isMet && styles.iconContainerMet]}>
                  {isMet ? (
                    <Ionicons name="checkmark" size={20} color="#00ff88" />
                  ) : (
                    <Ionicons name="close" size={20} color="#ffa500" />
                  )}
                </View>

                {/* Content */}
                <View style={styles.requirementContent}>
                  <Text style={styles.requirementLabel}>{formatLabel(req.key)}</Text>
                  <View style={styles.requirementProgress}>
                    <Text style={[styles.requirementCurrent, isMet && styles.requirementCurrentMet]}>
                      {req.current}
                    </Text>
                    <Text style={styles.requirementDivider}>/</Text>
                    <Text style={styles.requirementRequired}>{req.required}</Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.statusContainer}>
                  {isMet ? (
                    <View style={styles.metBadge}>
                      <Text style={styles.metText}>✓ Met</Text>
                    </View>
                  ) : (
                    <View style={styles.unmetBadge}>
                      <Text style={styles.unmetText}>Pending</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </View>

      {/* Overall Status */}
      <View style={styles.overallStatus}>
        {eligibility.eligible ? (
          <LinearGradient colors={['#00ff88', '#00e5ff']} style={styles.statusGradient}>
            <Ionicons name="shield-checkmark" size={32} color="#000" />
            <Text style={styles.statusTitle}>Ready for Verification!</Text>
            <Text style={styles.statusSubtitle}>You meet all requirements</Text>
          </LinearGradient>
        ) : (
          <View style={styles.statusPending}>
            <Ionicons name="hourglass" size={32} color="#ffa500" />
            <Text style={styles.statusTitlePending}>Not Eligible Yet</Text>
            <Text style={styles.statusSubtitlePending}>
              Complete the pending requirements to apply
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    account_age_days: 'Account Age',
    verified_posts: 'Verified Posts',
    total_posts: 'Total Posts',
    verification_rate: 'Verification Rate',
    consistency: 'Consistency',
    clean_standing: 'Clean Standing',
  };
  return labels[key] || key;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    padding: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
  },
  eligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  eligibleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff88',
  },
  notEligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffa500',
  },
  notEligibleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffa500',
  },
  requirementsList: {
    gap: 12,
    marginBottom: 24,
  },
  requirementItem: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  requirementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerMet: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  requirementContent: {
    flex: 1,
  },
  requirementLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  requirementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requirementCurrent: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffa500',
  },
  requirementCurrentMet: {
    color: '#00ff88',
  },
  requirementDivider: {
    fontSize: 14,
    color: '#6b7280',
  },
  requirementRequired: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  statusContainer: {},
  metBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00ff88',
  },
  unmetBadge: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unmetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffa500',
  },
  overallStatus: {
    marginTop: 8,
  },
  statusGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  statusPending: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginTop: 12,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
  statusTitlePending: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 12,
  },
  statusSubtitlePending: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
