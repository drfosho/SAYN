import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, uploadAvatar, deleteAvatar } from '@/lib/api/profiles';
import AvatarPicker from '@/components/profile/AvatarPicker';
import UsernameInput from '@/components/profile/UsernameInput';
import GoalsSelector from '@/components/profile/GoalsSelector';
import ExperienceSelector from '@/components/profile/ExperienceSelector';
import { Picker } from '@react-native-picker/picker';

const US_CITIES = [
  'Prefer not to say',
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'San Francisco, CA',
  'Charlotte, NC',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Boston, MA',
  'Nashville, TN',
  'Portland, OR',
  'Las Vegas, NV',
  'Miami, FL',
  'Atlanta, GA',
];

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();

  // Form state
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || 'Prefer not to say');
  const [fitnessGoals, setFitnessGoals] = useState<string[]>(profile?.fitness_goals || []);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>(profile?.experience_level || 'beginner');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes whenever form values update
  useEffect(() => {
    if (!profile) return;

    const changed =
      username !== profile.username ||
      displayName !== (profile.display_name || '') ||
      bio !== (profile.bio || '') ||
      location !== (profile.location || 'Prefer not to say') ||
      JSON.stringify(fitnessGoals) !== JSON.stringify(profile.fitness_goals || []) ||
      experienceLevel !== (profile.experience_level || 'beginner') ||
      newAvatarUri !== null ||
      removeAvatar;

    setHasChanges(changed);
  }, [username, displayName, bio, location, fitnessGoals, experienceLevel, newAvatarUri, removeAvatar, profile]);

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const validateForm = (): string | null => {
    // Username validation
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be 20 characters or less';
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return 'Username can only contain lowercase letters, numbers, and underscores';
    }

    // Display name validation
    if (displayName && displayName.length > 50) {
      return 'Display name must be 50 characters or less';
    }

    // Bio validation
    if (bio.length > 150) {
      return 'Bio must be 150 characters or less';
    }

    // Fitness goals validation
    if (fitnessGoals.length === 0) {
      return 'Please select at least one fitness goal';
    }
    if (fitnessGoals.length > 3) {
      return 'Please select no more than 3 fitness goals';
    }

    return null;
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    // Confirm username change if applicable
    if (username !== profile.username) {
      Alert.alert(
        'Change Username?',
        `Changing your username to "${username}" will affect how others find you. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change Username',
            onPress: () => performSave(),
          },
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = async () => {
    if (!user || !profile) return;

    setSaving(true);

    try {
      let avatarUrl: string | null | undefined = profile.avatar_url;

      // Handle avatar changes
      if (removeAvatar) {
        // Remove avatar
        if (profile.avatar_url) {
          await deleteAvatar(profile.avatar_url);
        }
        avatarUrl = undefined;
      } else if (newAvatarUri) {
        // Upload new avatar
        console.log('📤 Uploading new avatar...');
        const { data: uploadedUrl, error: uploadError } = await uploadAvatar(user!.id, newAvatarUri);

        if (uploadError) {
          throw new Error(`Failed to upload avatar: ${uploadError}`);
        }

        // Delete old avatar if exists
        if (profile.avatar_url && uploadedUrl) {
          await deleteAvatar(profile.avatar_url);
        }

        avatarUrl = uploadedUrl || undefined;
        console.log('✅ Avatar uploaded successfully');
      }

      // Update profile
      console.log('💾 Updating profile...');
      const { data, error } = await updateProfile(user!.id, {
        username: username.toLowerCase(),
        display_name: displayName || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl,
        location: location === 'Prefer not to say' ? undefined : location,
        fitness_goals: fitnessGoals,
        experience_level: experienceLevel,
      });

      if (error) {
        throw new Error(error);
      }

      console.log('✅ Profile updated successfully');

      // Refresh profile in auth context
      await refreshProfile();

      // Show success message
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelected = (uri: string) => {
    setNewAvatarUri(uri);
    setRemoveAvatar(false);
  };

  const handleRemoveImage = () => {
    setNewAvatarUri(null);
    setRemoveAvatar(true);
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>

        <Pressable
          onPress={handleSave}
          disabled={!hasChanges || saving}
          style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      {/* Form */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Section 1: Profile Picture */}
          <AvatarPicker
            currentAvatarUrl={profile.avatar_url}
            onImageSelected={handleImageSelected}
            onRemoveImage={handleRemoveImage}
            username={username}
          />

          {/* Section 2: Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BASIC INFO</Text>

            <UsernameInput
              value={username}
              onChange={setUsername}
              currentUserId={user!.id}
              originalUsername={profile.username}
            />

            {/* Display Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Display Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your display name"
                placeholderTextColor="#6b7280"
                maxLength={50}
              />
            </View>

            {/* Bio */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Share your fitness journey..."
                placeholderTextColor="#6b7280"
                multiline
                maxLength={150}
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCounter}>{bio.length} / 150</Text>
            </View>
          </View>

          {/* Section 3: Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LOCATION</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>City</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={location}
                  onValueChange={(value) => setLocation(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {US_CITIES.map((city) => (
                    <Picker.Item key={city} label={city} value={city} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Section 4: Fitness Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FITNESS INFO</Text>

            <GoalsSelector
              selectedGoals={fitnessGoals}
              onChange={setFitnessGoals}
              maxSelections={3}
            />

            <ExperienceSelector
              selectedLevel={experienceLevel}
              onChange={(level) => setExperienceLevel(level as 'beginner' | 'intermediate' | 'advanced' | 'expert')}
            />
          </View>

          {/* Section 5: Badge Status (View Only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BADGE STATUS</Text>

            <View style={styles.badgeStatus}>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeLabel}>Current Badge:</Text>
                <Text style={styles.badgeValue}>
                  {profile.badge ? profile.badge.charAt(0).toUpperCase() + profile.badge.slice(1) : 'None'}
                </Text>
              </View>

              <View style={styles.badgeRow}>
                <Text style={styles.badgeLabel}>Status:</Text>
                <Text style={styles.badgeValue}>
                  {profile.badge === 'under_review' ? 'Under Review' : profile.badge ? 'Active' : 'N/A'}
                </Text>
              </View>

              <Pressable
                style={styles.badgeButton}
                onPress={() => router.push('/badge-application')}
              >
                <Text style={styles.badgeButtonText}>
                  {profile.badge ? 'Update Badge' : 'Apply for Badge Verification'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Section 6: Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

            <Pressable
              style={styles.settingsLink}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsLinkText}>Change Password</Text>
              <Text style={styles.settingsLinkIcon}>›</Text>
            </Pressable>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#00e5ff',
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#1a1f3a',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  saveButtonTextDisabled: {
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 2,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#1a1f3a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 16,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 6,
  },
  pickerWrapper: {
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#1a1f3a',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  picker: {
    color: '#ffffff',
  },
  pickerItem: {
    color: '#ffffff',
    fontSize: 15,
  },
  badgeStatus: {
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#1a1f3a',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  badgeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  badgeVerified: {
    color: '#00ff88',
  },
  badgeButton: {
    backgroundColor: '#00e5ff',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badgeButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  settingsLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#1a1f3a',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  settingsLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsLinkIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00e5ff',
  },
});
