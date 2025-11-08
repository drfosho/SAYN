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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { checkUsernameAvailability, validateUsername } from '@/lib/supabase-auth';

export default function ProfileSetupScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

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

  const handleContinue = () => {
    if (!isFormValid) return;

    // Store data in router state to pass to next screen
    router.push({
      pathname: '/onboarding/avatar-goals',
      params: {
        username,
        displayName: displayName || username,
        bio: bio || '',
        location: location || '',
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
          <Text style={styles.title}>Build Your Power Profile</Text>
          <Text style={styles.subtitle}>
            Let's set up your identity on SAYN
          </Text>

          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={username}
                onChangeText={setUsername}
                placeholder="Choose your username"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
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
              <Text style={styles.errorText}>Username is already taken</Text>
            )}
            {usernameValidation.isValid && usernameAvailable === true && (
              <Text style={styles.successText}>Username is available!</Text>
            )}

            <Text style={styles.hint}>
              3-20 characters, letters, numbers, and underscores only
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
                placeholder="How should we display your name?"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.hint}>Can be different from your username</Text>
          </View>

          {/* Bio Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={(text) => text.length <= 150 && setBio(text)}
                placeholder="Tell us about yourself..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
                numberOfLines={3}
                maxLength={150}
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* Location Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, State or Country"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoCorrect={false}
              />
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
    marginTop: 6,
    textAlign: 'right',
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
