import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signUp, validateEmail, validatePassword } from '@/lib/supabase-auth';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Email validation
  const isEmailValid = validateEmail(email);
  const showEmailError = emailTouched && !isEmailValid && email.length > 0;

  // Password validation
  const passwordValidation = validatePassword(password);
  const showPasswordRequirements = passwordTouched && password.length > 0;

  // Confirm password validation
  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatch =
    confirmPassword.length > 0 && !passwordsMatch;

  // Form is valid
  const isFormValid =
    fullName.trim().length >= 2 &&
    isEmailValid &&
    passwordValidation.isValid &&
    passwordsMatch &&
    agreedToTerms;

  const handleSignUp = async () => {
    if (!isFormValid) return;

    setLoading(true);

    try {
      console.log('📝 Starting sign up process...');
      const { data, error } = await signUp({
        email,
        password,
        username: email.split('@')[0], // Temporary username from email
      });

      if (error) {
        console.error('❌ Sign up failed:', error);
        Alert.alert('Sign Up Failed', error);
        return;
      }

      if (!data?.user) {
        console.error('❌ No user data returned from sign up');
        Alert.alert('Sign Up Failed', 'Could not create account. Please try again.');
        return;
      }

      console.log('✅ Sign up successful!');
      console.log('User ID:', data.user.id);
      console.log('Session:', data.session ? 'Active' : 'No session');

      // Check if email confirmation is required
      if (!data.session) {
        console.log('⚠️ Email confirmation may be required');
        Alert.alert(
          'Check Your Email',
          'Please check your email to confirm your account, then log in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
        return;
      }

      // Success - navigate to onboarding with full name
      console.log('📱 Navigating to profile setup...');
      router.replace({
        pathname: '/onboarding/profile-setup',
        params: {
          fullName: fullName.trim(),
        },
      });
    } catch (error: any) {
      console.error('❌ Exception during sign up:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
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
          {/* Header */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#00e5ff" />
          </Pressable>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join the revolution. Start your journey.
          </Text>

          {/* Full Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {fullName.length > 0 && fullName.trim().length < 2 && (
              <Text style={styles.errorText}>
                Please enter your full name
              </Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                placeholder="your.email@example.com"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {showEmailError && (
              <Text style={styles.errorText}>
                Please enter a valid email
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={password}
                onChangeText={setPassword}
                onBlur={() => setPasswordTouched(true)}
                placeholder="Create a strong password"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </Pressable>
            </View>

            {/* Password Requirements */}
            {showPasswordRequirements && (
              <View style={styles.requirementsContainer}>
                <RequirementItem
                  met={passwordValidation.requirements.minLength}
                  text="8+ characters"
                />
                <RequirementItem
                  met={passwordValidation.requirements.hasUppercase}
                  text="1 uppercase letter"
                />
                <RequirementItem
                  met={passwordValidation.requirements.hasNumber}
                  text="1 number"
                />
              </View>
            )}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </Pressable>
            </View>
            {showPasswordMismatch && (
              <Text style={styles.errorText}>Passwords don't match</Text>
            )}
          </View>

          {/* Terms Checkbox */}
          <Pressable
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.checkboxContainer}
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxChecked,
              ]}
            >
              {agreedToTerms && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </Pressable>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={!isFormValid || loading}
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && styles.buttonPressed,
              (!isFormValid || loading) && styles.buttonDisabled,
            ]}
          >
            <LinearGradient
              colors={
                isFormValid && !loading
                  ? ['#00e5ff', '#ff00ff']
                  : ['#333', '#555']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={met ? '#00ff88' : '#ff4444'}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
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
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 32,
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
  iconButton: {
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
  requirementsContainer: {
    marginTop: 12,
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  requirementMet: {
    color: '#00ff88',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00e5ff',
    borderColor: '#00e5ff',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  link: {
    color: '#00e5ff',
    fontWeight: '600',
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loginLink: {
    fontSize: 14,
    color: '#00e5ff',
    fontWeight: '700',
  },
});
