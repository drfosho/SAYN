import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Shield, ShieldCheck, AlertTriangle, Clock, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserVerificationStats,
  getBadgeApplication,
  VerificationStats,
  BadgeApplication,
} from '@/lib/api/badgeVerification';

export default function BadgeVerificationScreen() {
  const { user, profile } = useAuth();
  const [userStats, setUserStats] = useState<VerificationStats | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<BadgeApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserBadgeData();
  }, [user]);

  const loadUserBadgeData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get verification stats
      const { data: stats } = await getUserVerificationStats(user.id);
      if (stats) {
        setUserStats(stats);
      }

      // Get any pending application
      const { data: application } = await getBadgeApplication(user.id);
      setApplicationStatus(application);
    } catch (error) {
      console.error('Error loading badge data:', error);
    } finally {
      setLoading(false);
    }
  };

  // If user is under review due to reports
  if ((profile as any)?.badge_application_status === 'under_review') {
    return <UnderReviewStatus onBack={() => router.back()} />;
  }

  // If user already has verified badge
  if ((profile as any)?.badge_verified) {
    return (
      <VerifiedBadgeStatus
        badgeType={(profile as any)?.badge_type}
        onBack={() => router.back()}
      />
    );
  }

  // If user has pending application
  if (
    applicationStatus?.status === 'pending' ||
    applicationStatus?.status === 'under_review'
  ) {
    return (
      <PendingApplicationStatus
        application={applicationStatus}
        onBack={() => router.back()}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Badge Verification</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
          <Text style={styles.loadingText}>Loading verification data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show badge selection flow
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Badge Verification</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro Section */}
        <View style={styles.introSection}>
          <Shield size={48} color="#00d4ff" strokeWidth={1.5} />
          <Text style={styles.introTitle}>Earn Your Badge</Text>
          <Text style={styles.introText}>
            SAYN values honesty above all else. Both Natural and Enhanced badges are
            badges of honor — they show you're transparent about your journey.
          </Text>
        </View>

        {/* Your Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Current Stats</Text>
          <View style={styles.statsGrid}>
            <StatItem
              label="Account Age"
              value={`${userStats?.account_age_days || 0} days`}
              requirement="30+ days"
              met={(userStats?.account_age_days || 0) >= 30}
            />
            <StatItem
              label="Verified Posts"
              value={String(userStats?.verified_posts || 0)}
              requirement="10+ posts"
              met={(userStats?.verified_posts || 0) >= 10}
            />
            <StatItem
              label="Verification Rate"
              value={`${userStats?.verification_rate || 0}%`}
              requirement="70%+"
              met={(userStats?.verification_rate || 0) >= 70}
            />
            <StatItem
              label="Community Reports"
              value={String(userStats?.report_count || 0)}
              requirement="0 reports"
              met={(userStats?.report_count || 0) === 0}
            />
          </View>
        </View>

        {/* Badge Options */}
        <View style={styles.badgeOptions}>
          <Text style={styles.sectionTitle}>Choose Your Path</Text>

          {/* Natural Badge Option */}
          <TouchableOpacity
            style={styles.badgeOption}
            onPress={() => {
              console.log('Navigating to Natural application');
              router.push('/badge-verification/natural');
            }}
          >
            <LinearGradient
              colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.02)']}
              style={styles.badgeOptionGradient}
            >
              <View style={styles.badgeOptionHeader}>
                <View style={[styles.badgeIcon, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
                  <ShieldCheck size={28} color="#00ff88" />
                </View>
                <View style={styles.badgeOptionInfo}>
                  <Text style={styles.badgeOptionTitle}>Verified Natural</Text>
                  <Text style={styles.badgeOptionSubtitle}>Drug-free athlete</Text>
                </View>
                <ChevronLeft
                  size={24}
                  color="rgba(255,255,255,0.4)"
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </View>

              <View style={styles.requirementsList}>
                <RequirementItem text="30+ days of verified photo uploads" />
                <RequirementItem text="Consistent, realistic progress tracked" />
                <RequirementItem text="Passed AI physique analysis" />
                <RequirementItem text="No sustained community reports" />
                <RequirementItem text="SAYN admin verification completed" />
              </View>

              <View style={styles.badgeOptionFooter}>
                <Text style={styles.xpBonus}>+10% XP Bonus on all activities</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Enhanced Badge Option */}
          <TouchableOpacity
            style={styles.badgeOption}
            onPress={() => {
              console.log('Navigating to Enhanced application');
              router.push('/badge-verification/enhanced');
            }}
          >
            <LinearGradient
              colors={['rgba(157, 78, 221, 0.1)', 'rgba(157, 78, 221, 0.02)']}
              style={styles.badgeOptionGradient}
            >
              <View style={styles.badgeOptionHeader}>
                <View style={[styles.badgeIcon, { backgroundColor: 'rgba(157, 78, 221, 0.2)' }]}>
                  <Shield size={28} color="#9D4EDD" />
                </View>
                <View style={styles.badgeOptionInfo}>
                  <Text style={styles.badgeOptionTitle}>Transparent Enhanced</Text>
                  <Text style={styles.badgeOptionSubtitle}>Open about enhancement use</Text>
                </View>
                <ChevronLeft
                  size={24}
                  color="rgba(255,255,255,0.4)"
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </View>

              <View style={styles.requirementsList}>
                <RequirementItem text="Self-disclosed enhancement use" />
                <RequirementItem text="Maintains verified photo uploads" />
                <RequirementItem text="Transparent about fitness journey" />
                <RequirementItem text="SAYN admin verification completed" />
              </View>

              <View style={styles.badgeOptionFooter}>
                <Text style={styles.honestBadge}>Honesty is respected</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Philosophy Section */}
        <View style={styles.philosophySection}>
          <Text style={styles.philosophyTitle}>Why Badges Matter</Text>
          <Text style={styles.philosophyText}>
            Fake natty culture hurts everyone. It creates unrealistic expectations and
            damages trust. SAYN rewards honesty — whether you're natural or enhanced,
            your transparency builds a healthier fitness community.
          </Text>
          <Text style={styles.philosophyText}>
            Both badges are equally respected. What matters is being real about YOUR journey.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: string;
  requirement: string;
  met: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, requirement, met }) => (
  <View style={styles.statItem}>
    <View style={styles.statHeader}>
      <Text style={styles.statLabel}>{label}</Text>
      {met ? <Check size={16} color="#00ff88" /> : <X size={16} color="rgba(255,255,255,0.3)" />}
    </View>
    <Text style={[styles.statValue, met && styles.statValueMet]}>{value}</Text>
    <Text style={styles.statRequirement}>{requirement}</Text>
  </View>
);

// Requirement Item Component
interface RequirementItemProps {
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ text }) => (
  <View style={styles.requirementItem}>
    <View style={styles.requirementDot} />
    <Text style={styles.requirementText}>{text}</Text>
  </View>
);

// Under Review Status Component
const UnderReviewStatus: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Badge Status</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.statusContent}>
        <View style={styles.iconContainer}>
          <AlertTriangle size={64} color="#FFD700" strokeWidth={1.5} />
        </View>

        <Text style={styles.statusTitle}>Verification Pending</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's happening?</Text>
          <Text style={styles.infoText}>• Community reports are being investigated</Text>
          <Text style={styles.infoText}>• SAYN admin review is in progress</Text>
          <Text style={styles.infoText}>• Status will update once review is complete</Text>
        </View>

        <View style={styles.noteCard}>
          <Clock size={20} color="rgba(255,255,255,0.5)" />
          <Text style={styles.noteText}>
            Reviews typically take 3-5 business days. You can continue using SAYN
            normally during this time.
          </Text>
        </View>

        <Text style={styles.reassurance}>
          If you believe this review was triggered in error, continue posting verified
          content to demonstrate your authenticity.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Verified Badge Status Component
const VerifiedBadgeStatus: React.FC<{ badgeType?: string; onBack: () => void }> = ({
  badgeType,
  onBack,
}) => {
  const isNatural = badgeType === 'natural';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Badge</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.statusContent}>
        <View
          style={[
            styles.verifiedIconContainer,
            { backgroundColor: isNatural ? 'rgba(0, 255, 136, 0.2)' : 'rgba(157, 78, 221, 0.2)' },
          ]}
        >
          {isNatural ? (
            <ShieldCheck size={64} color="#00ff88" strokeWidth={1.5} />
          ) : (
            <Shield size={64} color="#9D4EDD" strokeWidth={1.5} />
          )}
        </View>

        <Text style={styles.statusTitle}>
          {isNatural ? 'Verified Natural' : 'Transparent Enhanced'}
        </Text>
        <Text style={styles.verifiedSubtitle}>Badge Verified</Text>

        <View style={styles.verifiedInfoCard}>
          <Text style={styles.verifiedInfoText}>
            {isNatural
              ? 'You have been verified as a natural athlete. Your +10% XP bonus is active on all activities.'
              : 'You have been verified as transparent about your enhanced journey. Your honesty is respected by the community.'}
          </Text>
        </View>

        <Text style={styles.verifiedNote}>
          Keep posting verified content to maintain your badge status. Community reports
          may trigger a review.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Pending Application Status Component
const PendingApplicationStatus: React.FC<{
  application: BadgeApplication;
  onBack: () => void;
}> = ({ application, onBack }) => {
  const isNatural = application.badge_type_requested === 'natural';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.statusContent}>
        <View style={styles.pendingIconContainer}>
          <Clock size={64} color="#00d4ff" strokeWidth={1.5} />
        </View>

        <Text style={styles.statusTitle}>Application Pending</Text>
        <Text style={styles.pendingSubtitle}>
          {isNatural ? 'Verified Natural' : 'Transparent Enhanced'}
        </Text>

        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotComplete]} />
            <Text style={styles.timelineText}>Application Submitted</Text>
            <Check size={16} color="#00ff88" />
          </View>
          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                application.status === 'under_review' && styles.timelineDotActive,
              ]}
            />
            <Text style={styles.timelineText}>Admin Review</Text>
            {application.status === 'under_review' && (
              <ActivityIndicator size="small" color="#00d4ff" />
            )}
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <Text style={styles.timelineText}>Verification Complete</Text>
          </View>
        </View>

        <Text style={styles.pendingNote}>
          Your application was submitted on{' '}
          {new Date(application.created_at).toLocaleDateString()}. Reviews typically
          take 3-5 business days.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginTop: 16,
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statValueMet: {
    color: '#00ff88',
  },
  statRequirement: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  badgeOptions: {
    marginBottom: 24,
  },
  badgeOption: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeOptionGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  badgeOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  badgeOptionInfo: {
    flex: 1,
  },
  badgeOptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  badgeOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  requirementsList: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginRight: 12,
  },
  requirementText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  badgeOptionFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  xpBonus: {
    fontSize: 13,
    color: '#00ff88',
    fontWeight: '600',
  },
  honestBadge: {
    fontSize: 13,
    color: '#9D4EDD',
    fontWeight: '600',
  },
  philosophySection: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  philosophyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00d4ff',
    marginBottom: 12,
  },
  philosophyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: 12,
  },
  // Status screens
  statusContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    marginBottom: 24,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  reassurance: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Verified status
  verifiedIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifiedSubtitle: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '600',
    marginBottom: 24,
  },
  verifiedInfoCard: {
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
    marginBottom: 24,
    width: '100%',
  },
  verifiedInfoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    textAlign: 'center',
  },
  verifiedNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  // Pending status
  pendingIconContainer: {
    marginBottom: 24,
  },
  pendingSubtitle: {
    fontSize: 16,
    color: '#00d4ff',
    fontWeight: '600',
    marginBottom: 32,
  },
  timelineCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timelineDotComplete: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  timelineDotActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  timelineText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  pendingNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
