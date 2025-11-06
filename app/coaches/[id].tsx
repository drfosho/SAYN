import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ClientTransformation } from '@/components/coach/ClientTransformation';
import { CoachReviews } from '@/components/coach/CoachReviews';
import { RECOGNIZED_CERTIFICATIONS, SPECIALIZATIONS, TRAINING_TYPES } from '@/constants/coachCertifications';

const { width } = Dimensions.get('window');

// Mock full coach data
const MOCK_COACH_DATA: Record<string, any> = {
  '1': {
    id: '1',
    username: 'MarcusTheCoach',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    name: 'Marcus "The Tank" Johnson',
    level: 78,
    bio: 'Elite strength coach specializing in powerlifting and athletic performance. Former collegiate athlete, now helping others unlock their true potential.',
    location: 'Los Angeles, CA',
    badge: 'natural' as const,
    isVerifiedCoach: true,
    yearsExperience: 8,
    certifications: ['NASM', 'CSCS', 'NSCA'],
    specializations: ['strength', 'powerlifting', 'sports'],
    trainingTypes: ['one_on_one', 'online', 'in_person'],
    trainingPhilosophy: 'Progressive overload with perfect form. Build strength that lasts a lifetime, not just for show.',
    location_full: 'Los Angeles, CA',
    timezone: 'PST',
    responseTime: 'Within 24 hours',
    priceRange: '$250-500/month',
    totalClients: 250,
    averageRetention: 18, // months
    successRate: 94, // percentage
    rating: 4.9,
    clientTransformations: [
      {
        id: '1',
        clientName: 'Jake M.',
        beforeImageUrl: 'https://picsum.photos/seed/trans1/400/600',
        afterImageUrl: 'https://picsum.photos/seed/trans2/400/600',
        timePeriod: '16 weeks',
        results: 'Deadlift from 315lbs to 495lbs. Added 25lbs of muscle.',
        isVerified: true,
      },
      {
        id: '2',
        clientName: 'Sarah K.',
        beforeImageUrl: 'https://picsum.photos/seed/trans3/400/600',
        afterImageUrl: 'https://picsum.photos/seed/trans4/400/600',
        timePeriod: '12 weeks',
        results: 'Total body recomp. Lost 18lbs fat, gained lean muscle.',
        isVerified: true,
      },
      {
        id: '3',
        clientName: 'David L.',
        beforeImageUrl: 'https://picsum.photos/seed/trans5/400/600',
        afterImageUrl: 'https://picsum.photos/seed/trans6/400/600',
        timePeriod: '20 weeks',
        results: 'Squat from 225lbs to 405lbs. Total strength transformation.',
        isVerified: true,
      },
    ],
    reviews: [
      {
        id: '1',
        clientName: 'Jake Morrison',
        clientAvatar: 'https://i.pravatar.cc/150?img=15',
        rating: 5,
        review: 'Marcus completely transformed my approach to training. His programming is scientific, his coaching is motivating, and the results speak for themselves. Best investment I ever made.',
        date: new Date('2024-09-15'),
        verified: true,
      },
      {
        id: '2',
        clientName: 'Sarah Kim',
        clientAvatar: 'https://i.pravatar.cc/150?img=27',
        rating: 5,
        review: 'I tried 5 different trainers before finding Marcus. He actually understands biomechanics and adapts the program to YOUR body. No cookie-cutter BS. Highly recommend!',
        date: new Date('2024-08-22'),
        verified: true,
      },
      {
        id: '3',
        clientName: 'David Lopez',
        clientAvatar: 'https://i.pravatar.cc/150?img=51',
        rating: 5,
        review: 'Been training with Marcus for over a year. Hit PRs I never thought possible. His knowledge of strength training is unmatched. Worth every penny.',
        date: new Date('2024-07-10'),
        verified: true,
      },
    ],
  },
};

export default function CoachProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showAllTransformations, setShowAllTransformations] = useState(false);

  const coach = MOCK_COACH_DATA[id || '1'] || MOCK_COACH_DATA['1'];

  const handleBack = () => {
    router.back();
  };

  const handleContactCoach = () => {
    Alert.alert(
      'Contact Coach',
      `Start a conversation with ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Message',
          onPress: () => {
            Alert.alert('Success!', 'Message sent to coach. They typically respond within 24 hours.');
          },
        },
      ]
    );
  };

  const getCertificationLabels = () => {
    return coach.certifications
      .map((id: string) => RECOGNIZED_CERTIFICATIONS.find((c) => c.id === id)?.label || id)
      .join(', ');
  };

  const getSpecializationLabels = () => {
    return coach.specializations
      .map((id: string) => SPECIALIZATIONS.find((s) => s.id === id)?.label || id)
      .join(', ');
  };

  const getTrainingTypeLabels = () => {
    return coach.trainingTypes
      .map((id: string) => TRAINING_TYPES.find((t) => t.id === id)?.label || id)
      .join(', ');
  };

  const displayedTransformations = showAllTransformations
    ? coach.clientTransformations
    : coach.clientTransformations.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader
          avatarUrl={coach.avatarUrl}
          username={coach.username}
          level={coach.level}
          bio={coach.bio}
          location={coach.location}
          badge={coach.badge}
          isVerifiedCoach={coach.isVerifiedCoach}
          onBack={handleBack}
          isOwnProfile={false}
        />

        {/* Verified Coach Badge Indicator */}
        <View style={styles.coachBadgeSection}>
          <LinearGradient
            colors={['#FFB800', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.coachBadgeGradient}
          >
            <Text style={styles.coachBadgeText}>✓ VERIFIED COACH</Text>
          </LinearGradient>
        </View>

        {/* Contact Button */}
        <View style={styles.contactSection}>
          <Pressable onPress={handleContactCoach} style={styles.contactButton}>
            <LinearGradient
              colors={['#00e5ff', '#ff0080']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactButtonGradient}
            >
              <Text style={styles.contactButtonText}>💬 CONTACT COACH</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Credentials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CREDENTIALS & EXPERIENCE</Text>
          <View style={styles.credentialsCard}>
            <InfoRow label="Certifications" value={getCertificationLabels()} />
            <InfoRow label="Years Experience" value={`${coach.yearsExperience} years`} />
            <InfoRow label="Specializations" value={getSpecializationLabels()} />
            <InfoRow label="Training Philosophy" value={coach.trainingPhilosophy} multiline />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COACH STATS</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Total Clients" value={`${coach.totalClients}+`} />
            <StatCard label="Avg Retention" value={`${coach.averageRetention}mo`} />
            <StatCard label="Success Rate" value={`${coach.successRate}%`} />
            <StatCard label="Years Coaching" value={`${coach.yearsExperience}+`} />
          </View>
        </View>

        {/* Coaching Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COACHING INFO</Text>
          <View style={styles.credentialsCard}>
            <InfoRow label="Training Types" value={getTrainingTypeLabels()} />
            <InfoRow label="Price Range" value={coach.priceRange} />
            <InfoRow label="Location" value={coach.location_full} />
            <InfoRow label="Response Time" value={coach.responseTime} />
          </View>
        </View>

        {/* Client Transformations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT TRANSFORMATIONS</Text>
          <Text style={styles.sectionSubtitle}>
            All transformations are AI-verified
          </Text>
          <View style={styles.transformationsGrid}>
            {displayedTransformations.map((transformation: any) => (
              <ClientTransformation
                key={transformation.id}
                transformation={transformation}
                onPress={() => console.log('View transformation:', transformation.id)}
              />
            ))}
          </View>
          {coach.clientTransformations.length > 4 && !showAllTransformations && (
            <Pressable
              onPress={() => setShowAllTransformations(true)}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>
                SHOW ALL {coach.clientTransformations.length} TRANSFORMATIONS
              </Text>
            </Pressable>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REVIEWS & TESTIMONIALS</Text>
          <CoachReviews reviews={coach.reviews} averageRating={coach.rating} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow: React.FC<{ label: string; value: string; multiline?: boolean }> = ({
  label,
  value,
  multiline,
}) => (
  <View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>
      {value}
    </Text>
  </View>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statCard}>
    <LinearGradient
      colors={['#0d1128', '#050814']}
      style={styles.statCardGradient}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  scrollView: {
    flex: 1,
  },
  coachBadgeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  coachBadgeGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000000',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  coachBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contactButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  contactButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFB800',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  credentialsCard: {
    backgroundColor: '#0d1128',
    borderRadius: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00e5ff',
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  infoValueMultiline: {
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 64) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFB800',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  transformationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  showMoreButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00e5ff',
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
  },
});
