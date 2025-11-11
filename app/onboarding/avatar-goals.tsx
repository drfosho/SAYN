import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const FITNESS_GOALS = [
  { id: 'build_muscle', label: 'Build Muscle', icon: '💪' },
  { id: 'lose_weight', label: 'Lose Weight', icon: '🔥' },
  { id: 'gain_strength', label: 'Gain Strength', icon: '⚡' },
  { id: 'improve_endurance', label: 'Improve Endurance', icon: '🏃' },
  { id: 'general_fitness', label: 'General Fitness', icon: '🎯' },
  { id: 'athletic_performance', label: 'Athletic Performance', icon: '🏆' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', subtitle: '< 1 year' },
  { id: 'intermediate', label: 'Intermediate', subtitle: '1-3 years' },
  { id: 'advanced', label: 'Advanced', subtitle: '3-5 years' },
  { id: 'expert', label: 'Expert', subtitle: '5+ years' },
];

export default function AvatarGoalsScreen() {
  const params = useLocalSearchParams();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);

  const isFormValid = selectedGoals.length >= 1 && selectedGoals.length <= 3 && experienceLevel;

  const pickImage = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleGoal = async (goalId: string) => {
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, goalId]);
      }
    }
  };

  const selectExperienceLevel = async (levelId: string) => {
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }
    setExperienceLevel(levelId);
  };

  const handleContinue = async () => {
    if (!isFormValid) return;

    // Haptic feedback on button press
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    router.push({
      pathname: '/onboarding/choose-path',
      params: {
        ...params,
        avatarUri: avatarUri || '',
        fitnessGoals: JSON.stringify(selectedGoals),
        experienceLevel,
      },
    });
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
              style={[styles.progressFill, { width: '66%' }]}
            />
          </View>
          <Text style={styles.progressText}>2 of 3</Text>
        </View>

        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00e5ff" />
        </Pressable>

        {/* Header */}
        <Text style={styles.title}>Show Your Power</Text>
        <Text style={styles.subtitle}>Add a photo and set your goals</Text>

        {/* Profile Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>

          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color="rgba(255, 255, 255, 0.3)" />
              </View>
            )}
          </View>

          <View style={styles.photoButtons}>
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                styles.photoButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="images" size={20} color="#00e5ff" />
              <Text style={styles.photoButtonText}>Choose Photo</Text>
            </Pressable>

            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                styles.photoButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="camera" size={20} color="#00e5ff" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </Pressable>
          </View>
        </View>

        {/* Fitness Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Fitness Goals <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>Select 1-3 goals</Text>

          <View style={styles.goalsGrid}>
            {FITNESS_GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  style={({ pressed }) => [
                    styles.goalPill,
                    isSelected && styles.goalPillSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text
                    style={[
                      styles.goalLabel,
                      isSelected && styles.goalLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#00e5ff" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {selectedGoals.length > 0 && (
            <Text style={styles.goalCount}>
              {selectedGoals.length} of 3 selected
            </Text>
          )}
        </View>

        {/* Experience Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Experience Level <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.levelsContainer}>
            {EXPERIENCE_LEVELS.map((level) => {
              const isSelected = experienceLevel === level.id;
              return (
                <Pressable
                  key={level.id}
                  onPress={() => selectExperienceLevel(level.id)}
                  style={({ pressed }) => [
                    styles.levelCard,
                    isSelected && styles.levelCardSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <View style={styles.levelContent}>
                    <Text
                      style={[
                        styles.levelLabel,
                        isSelected && styles.levelLabelSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#00e5ff" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={handleContinue}
          disabled={!isFormValid}
          style={({ pressed }) => [
            styles.buttonWrapper,
            pressed && styles.buttonPressed,
            !isFormValid && styles.buttonDisabled,
          ]}
        >
          <LinearGradient
            colors={isFormValid ? ['#00e5ff', '#ff00ff'] : ['#333', '#555']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  required: {
    color: '#ff4444',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00e5ff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00e5ff',
  },
  goalsGrid: {
    gap: 12,
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalPillSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  goalIcon: {
    fontSize: 24,
  },
  goalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  goalLabelSelected: {
    color: '#ffffff',
  },
  goalCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  levelsContainer: {
    gap: 12,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelCardSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  levelContent: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  levelLabelSelected: {
    color: '#ffffff',
  },
  levelSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
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
