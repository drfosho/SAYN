import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { VerifiedCoachBadge } from '../badges/VerifiedCoachBadge';
import { SPECIALIZATIONS } from '@/constants/coachCertifications';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CoachCardProps {
  id: string;
  avatarUrl: string;
  name: string;
  certifications: string[];
  specializations: string[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  totalClients: number;
  onPress: (id: string) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={styles.star}>
        {i <= rating ? '★' : '☆'}
      </Text>
    );
  }
  return <View style={styles.starsContainer}>{stars}</View>;
};

export const CoachCard: React.FC<CoachCardProps> = ({
  id,
  avatarUrl,
  name,
  certifications,
  specializations,
  rating,
  reviewCount,
  yearsExperience,
  totalClients,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  };

  // Get specialization labels
  const specializationLabels = specializations
    .slice(0, 3)
    .map((id) => SPECIALIZATIONS.find((s) => s.id === id)?.label || id);

  return (
    <AnimatedPressable
      onPress={() => onPress(id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <LinearGradient
        colors={['#0d1128', '#050814', '#0d1128']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {/* Avatar with Coach Badge */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.coachBadge}>
              <VerifiedCoachBadge size="small" />
            </View>
          </View>

          {/* Name and Certifications */}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.certifications}>
              {certifications.slice(0, 2).map((cert, index) => (
                <View key={index} style={styles.certBadge}>
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
              {certifications.length > 2 && (
                <Text style={styles.certMore}>+{certifications.length - 2}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingSection}>
          <StarRating rating={Math.round(rating)} />
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} ({reviewCount} reviews)
          </Text>
        </View>

        {/* Specializations */}
        <View style={styles.specializationsSection}>
          {specializationLabels.map((label, index) => (
            <View key={index} style={styles.specializationTag}>
              <Text style={styles.specializationText}>{label}</Text>
            </View>
          ))}
          {specializations.length > 3 && (
            <View style={styles.specializationTag}>
              <Text style={styles.specializationText}>+{specializations.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalClients}+</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{yearsExperience}+</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
        </View>

        {/* View Profile Button */}
        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={['#FFB800', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>VIEW PROFILE</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 4,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#000000',
  },
  coachBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  certifications: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  certBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  certText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFB800',
    letterSpacing: 0.5,
  },
  certMore: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 184, 0, 0.7)',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
    color: '#FFB800',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  specializationsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  specializationTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00e5ff',
  },
  specializationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 0.5,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 184, 0, 0.2)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255, 184, 0, 0.3)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFB800',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  buttonContainer: {
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
  button: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
});
