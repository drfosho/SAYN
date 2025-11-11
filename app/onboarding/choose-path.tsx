import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createUserProfile, getCurrentUser } from '@/lib/supabase-auth';
import { uploadAvatar } from '@/lib/api/storage';
import { compressAvatar } from '@/utils/imageCompression';

type AthleteType = 'natural' | 'enhanced' | 'prefer_not_to_say';

const ATHLETE_TYPES = [
  {
    id: 'natural' as AthleteType,
    title: 'Natural Athlete',
    description: 'Training drug-free',
    icon: 'checkmark-circle',
    colors: ['#00ff88', '#00e5ff'],
  },
  {
    id: 'enhanced' as AthleteType,
    title: 'Enhanced Athlete',
    description: 'Open about enhancement use',
    icon: 'star',
    colors: ['#ff00ff', '#ffa500'],
  },
  {
    id: 'prefer_not_to_say' as AthleteType,
    title: 'Prefer Not to Say',
    description: "I'll decide later",
    icon: 'help-circle',
    colors: ['#666', '#999'],
  },
];

export default function ChoosePathScreen() {
  const params = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState<AthleteType | null>(null);
  const [loading, setLoading] = useState(false);

  const selectAthleteType = async (type: AthleteType) => {
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }
    setSelectedType(type);
  };

  const handleComplete = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an athlete type');
      return;
    }

    // Haptic feedback on button press
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    setLoading(true);

    try {
      // Get current user from Supabase
      console.log('🔐 Getting current user...');
      const { user, error: userError } = await getCurrentUser();

      if (userError || !user) {
        console.error('❌ User not found:', userError);
        Alert.alert(
          'Authentication Error',
          'Could not find your account. Please try logging in again.'
        );
        setLoading(false);
        return;
      }

      console.log('🚀 Starting profile creation...');
      console.log('User ID:', user.id);
      console.log('Username:', params.username);

      let avatarUrl = '';

      // Upload avatar if provided
      if (params.avatarUri && params.avatarUri !== '') {
        console.log('📸 Uploading avatar...');
        try {
          // Compress the image first
          const compressedUri = await compressAvatar(params.avatarUri as string);

          // Upload to Supabase storage
          const { data: uploadedUrl, error: uploadError } = await uploadAvatar(
            user.id,
            compressedUri
          );

          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            Alert.alert(
              'Avatar Upload Failed',
              'We couldn\'t upload your profile picture, but we\'ll continue with profile creation. You can add it later.',
              [{ text: 'Continue' }]
            );
          } else if (uploadedUrl) {
            avatarUrl = uploadedUrl;
            console.log('✅ Avatar uploaded successfully:', avatarUrl);
          }
        } catch (uploadError: any) {
          console.error('Avatar upload exception:', uploadError);
          Alert.alert(
            'Avatar Upload Failed',
            'We couldn\'t upload your profile picture, but we\'ll continue with profile creation.',
            [{ text: 'Continue' }]
          );
        }
      }

      // Parse fitness goals from params
      const fitnessGoals = params.fitnessGoals
        ? JSON.parse(params.fitnessGoals as string)
        : [];

      console.log('💾 Creating profile in database...');

      // Create user profile
      const { data, error } = await createUserProfile(user.id, {
        username: params.username as string,
        displayName: params.displayName as string,
        bio: params.bio as string,
        location: params.location as string,
        avatarUrl: avatarUrl,
        fitnessGoals,
        experienceLevel: params.experienceLevel as any,
        athleteType: selectedType === 'prefer_not_to_say' ? null : selectedType,
      });

      if (error) {
        console.error('❌ Profile creation error:', error);

        // Check for specific errors
        if (error.includes('already exists') || error.includes('duplicate')) {
          Alert.alert(
            'Username Taken',
            'This username is already taken. Please go back and choose a different one.'
          );
        } else if (error.includes('network') || error.includes('connection')) {
          Alert.alert(
            'Connection Error',
            'Please check your internet connection and try again.'
          );
        } else {
          Alert.alert(
            'Profile Creation Failed',
            error || 'Something went wrong. Please try again.'
          );
        }
        return;
      }

      console.log('✅ Profile created successfully!');
      console.log('Profile data:', data);

      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to main app (feed)
      console.log('📱 Navigating to main app...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('❌ Exception during profile creation:', error);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#050814', '#0d1128', '#1a1f3a']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#00e5ff', '#ff00ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '100%' }]}
            />
          </View>
          <Text style={styles.progressText}>3 of 3</Text>
        </View>

        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00e5ff" />
        </Pressable>

        {/* Header */}
        <Text style={styles.title}>Natural or Enhanced?</Text>
        <Text style={styles.subtitle}>
          SAYN values honesty above all else. Both paths are respected equally.
          This helps us show you relevant content and connect you with your
          community.
        </Text>

        {/* Athlete Type Cards */}
        <View style={styles.cardsContainer}>
          {ATHLETE_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <Pressable
                key={type.id}
                onPress={() => selectAthleteType(type.id)}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? type.colors
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={32}
                        color={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'}
                      />
                    </View>

                    <Text
                      style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}
                    >
                      {type.title}
                    </Text>

                    <Text style={styles.cardDescription}>{type.description}</Text>

                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons name="information-circle" size={20} color="#00e5ff" />
          <Text style={styles.disclaimer}>
            You can change this later. This is about transparency, not judgment.
          </Text>
        </View>

        {/* Complete Setup Button */}
        <Pressable
          onPress={handleComplete}
          disabled={!selectedType || loading}
          style={({ pressed }) => [
            styles.buttonWrapper,
            pressed && styles.buttonPressed,
            (!selectedType || loading) && styles.buttonDisabled,
          ]}
        >
          <LinearGradient
            colors={
              selectedType && !loading ? ['#00e5ff', '#ff00ff'] : ['#333', '#555']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.buttonText}>Creating Profile...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>Complete Setup</Text>
                <Ionicons name="rocket" size={20} color="#ffffff" />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardSelected: {
    borderColor: 'transparent',
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardGradient: {
    padding: 24,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardTitleSelected: {
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    marginBottom: 32,
  },
  disclaimer: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
