import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { checkUsernameAvailability } from '@/lib/api/profiles';

interface UsernameInputProps {
  value: string;
  onChange: (username: string) => void;
  currentUserId: string;
  originalUsername: string;
  error?: string;
}

export default function UsernameInput({
  value,
  onChange,
  currentUserId,
  originalUsername,
  error,
}: UsernameInputProps) {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when value changes
    setIsAvailable(null);
    setValidationError(null);

    // If username is same as original, skip check
    if (value.toLowerCase() === originalUsername.toLowerCase()) {
      setIsAvailable(true);
      return;
    }

    // Validate format
    if (value.length === 0) {
      setValidationError('Username is required');
      return;
    }

    if (value.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }

    if (value.length > 20) {
      setValidationError('Username must be 20 characters or less');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(value)) {
      setValidationError('Username can only contain lowercase letters, numbers, and underscores');
      return;
    }

    // Debounce username availability check
    const timeoutId = setTimeout(async () => {
      setChecking(true);
      const { data, error } = await checkUsernameAvailability(value, currentUserId);
      setChecking(false);

      if (error) {
        setValidationError('Error checking username');
      } else {
        setIsAvailable(data || false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, currentUserId, originalUsername]);

  const handleChange = (text: string) => {
    // Auto-convert to lowercase and remove invalid characters
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    onChange(cleaned);
  };

  const showSuccess = !validationError && !checking && isAvailable === true;
  const showError = !checking && (validationError || isAvailable === false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, showError && styles.inputWrapperError, showSuccess && styles.inputWrapperSuccess]}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={handleChange}
            placeholder="username"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />

          <View style={styles.indicator}>
            {checking ? (
              <ActivityIndicator size="small" color="#00e5ff" />
            ) : showSuccess ? (
              <Text style={styles.successIcon}>✓</Text>
            ) : showError ? (
              <Text style={styles.errorIcon}>✗</Text>
            ) : null}
          </View>
        </View>

        {showError && (
          <Text style={styles.errorText}>
            {validationError || 'Username is already taken'}
          </Text>
        )}

        {showSuccess && value.toLowerCase() !== originalUsername.toLowerCase() && (
          <Text style={styles.successText}>Username is available</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputContainer: {
    gap: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#1a1f3a',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  inputWrapperError: {
    borderColor: '#ff4444',
  },
  inputWrapperSuccess: {
    borderColor: '#00ff88',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    paddingVertical: 16,
  },
  indicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: '900',
  },
  errorIcon: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: '900',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff4444',
    paddingLeft: 4,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00ff88',
    paddingLeft: 4,
  },
});
