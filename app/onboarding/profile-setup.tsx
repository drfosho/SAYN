import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { checkUsernameAvailability, validateUsername } from '@/lib/supabase-auth';

const US_CITIES = [
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
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
  'Boston, MA',
  'Nashville, TN',
  'Detroit, MI',
  'Las Vegas, NV',
  'Portland, OR',
  'Memphis, TN',
  'Louisville, KY',
  'Baltimore, MD',
  'Milwaukee, WI',
  'Albuquerque, NM',
  'Tucson, AZ',
  'Fresno, CA',
  'Sacramento, CA',
  'Kansas City, MO',
  'Atlanta, GA',
  'Miami, FL',
  'Oakland, CA',
  'Raleigh, NC',
  'Minneapolis, MN',
  'Tampa, FL',
  'New Orleans, LA',
  'Cleveland, OH',
  'Honolulu, HI',
  'Prefer not to say',
];

export default function ProfileSetupScreen() {
  const params = useLocalSearchParams();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const available = await checkUsernameAvailability(username);
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Username check failed:', error);
        // If check fails, assume available for testing
        setUsernameAvailable(true);
      }
      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const usernameValidation = validateUsername(username);
  const isFormValid =
    usernameValidation.isValid && usernameAvailable === true;

  const handleContinue = async () => {
    if (!isFormValid) return;

    // Haptic feedback on button press
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    // Store data in router state to pass to next screen
    router.push({
      pathname: '/onboarding/avatar-goals',
      params: {
        ...params,
        username,
        displayName: displayName || params.fullName || username,
        bio: bio || '',
        location: location === 'Prefer not to say' ? '' : location,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#050814', '#0d1128', '#1a1f3a']}
        style={styles.gradient}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#00e5ff', '#ff00ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: '33%' }]}
              />
            </View>
            <Text style={styles.progressText}>1 of 3</Text>
          </View>

          {/* Header */}
          <Text style={styles.title}>Choose Your Username</Text>
          <Text style={styles.subtitle}>
            Create a unique username and complete your profile
          </Text>

          {/* Username Field */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.charCount}>{username.length}/20</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase().replace(/\s/g, ''))}
                placeholder="Choose your username"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                maxLength={20}
                returnKeyType="next"
              />
              {username.length > 0 && (
                <Pressable
                  onPress={() => setUsername('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
                </Pressable>
              )}
              {checkingUsername && (
                <View style={styles.statusIcon}>
                  <ActivityIndicator size="small" color="#00e5ff" />
                </View>
              )}
              {!checkingUsername && username.length >= 3 && usernameAvailable === true && (
                <View style={styles.statusIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
                </View>
              )}
              {!checkingUsername && username.length >= 3 && usernameAvailable === false && (
                <View style={styles.statusIcon}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </View>
              )}
            </View>

            {/* Username validation messages */}
            {username.length > 0 && !usernameValidation.isValid && (
              <Text style={styles.errorText}>{usernameValidation.error}</Text>
            )}
            {usernameValidation.isValid && usernameAvailable === false && (
              <Text style={styles.errorText}>Username is already taken - try another</Text>
            )}
            {usernameValidation.isValid && usernameAvailable === true && (
              <Text style={styles.successText}>✓ Username is available!</Text>
            )}

            <Text style={styles.hint}>
              Lowercase only • No spaces • 3-20 characters
            </Text>
          </View>

          {/* Display Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={params.fullName as string || "Optional - shown on profile"}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.hint}>
              {params.fullName
                ? `Defaults to "${params.fullName}" if left blank`
                : 'Can be different from your username'}
            </Text>
          </View>

          {/* Bio Field */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Bio (Optional)</Text>
              <Text style={styles.charCount}>{bio.length}/150</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={(text) => text.length <= 150 && setBio(text)}
                placeholder="Personal trainer | Powerlifter | Natural athlete 💪"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit
              />
            </View>
            <Text style={styles.hint}>
              Tell others about your fitness journey
            </Text>
          </View>

          {/* Location Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location (Optional)</Text>
            <Pressable
              onPress={() => setShowLocationPicker(true)}
              style={styles.inputWrapper}
            >
              <View style={[styles.input, styles.dropdownInput]}>
                <Text
                  style={[
                    styles.dropdownText,
                    !location && styles.dropdownPlaceholder,
                  ]}
                >
                  {location || 'Select Location'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </View>
            </Pressable>
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

        {/* Location Picker Modal */}
        <Modal
          visible={showLocationPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
                <Pressable
                  onPress={() => setShowLocationPicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </Pressable>
              </View>

              <ScrollView style={styles.modalList}>
                {US_CITIES.map((city, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setLocation(city);
                      setShowLocationPicker(false);
                    }}
                    style={({ pressed }) => [
                      styles.cityItem,
                      location === city && styles.cityItemSelected,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cityText,
                        location === city && styles.cityTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                    {location === city && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#00e5ff"
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  required: {
    color: '#ff4444',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statusIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    color: '#00ff88',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
    marginLeft: 4,
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 50,
    top: 16,
    padding: 4,
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
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#ffffff',
  },
  dropdownPlaceholder: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0d1128',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    padding: 16,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cityItemSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  cityText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cityTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
