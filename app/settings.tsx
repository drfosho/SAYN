import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { updatePassword, validatePassword } from '@/lib/supabase-auth';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 User initiated logout from settings');
              await signOut();
              console.log('✅ Logout successful - Redirecting to welcome screen');
              router.replace('/auth/welcome');
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert('Logged Out', 'You have been logged out successfully');
              }, 500);
            } catch (error: any) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type DELETE to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion
                    Alert.alert(
                      'Contact Support',
                      'Please contact support@sayn.app to complete account deletion.'
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      Alert.alert('Invalid Password', 'Password must meet all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords Don\'t Match', 'Please make sure passwords match');
      return;
    }

    setChangingPassword(true);

    const { error } = await updatePassword(newPassword);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Password updated successfully');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }

    setChangingPassword(false);
  };

  return (
    <LinearGradient
      colors={['#050814', '#0d1128', '#1a1f3a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00e5ff" />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Email */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="mail" size={20} color="#00e5ff" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Username */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="person" size={20} color="#00e5ff" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Username</Text>
                <Text style={styles.settingValue}>@{profile?.username}</Text>
              </View>
            </View>
          </View>

          {/* Change Password */}
          {!showChangePassword ? (
            <Pressable
              onPress={() => setShowChangePassword(true)}
              style={({ pressed }) => [
                styles.settingItem,
                styles.pressable,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.settingContent}>
                <Ionicons name="key" size={20} color="#00e5ff" />
                <Text style={styles.settingLabel}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </Pressable>
          ) : (
            <View style={styles.changePasswordContainer}>
              <Text style={styles.changePasswordTitle}>Change Password</Text>

              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry
                autoCapitalize="none"
              />

              <View style={styles.passwordButtons}>
                <Pressable
                  onPress={() => {
                    setShowChangePassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                  style={({ pressed }) => [
                    styles.saveButtonWrapper,
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={['#00e5ff', '#ff00ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButton}
                  >
                    {changingPassword ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Update</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <Pressable
            onPress={() => router.push(`/profile/${user?.id}`)}
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="person-circle" size={20} color="#00e5ff" />
              <Text style={styles.settingLabel}>View Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>

          <Pressable
            onPress={() => {
              // TODO: Navigate to edit profile screen
              Alert.alert('Coming Soon', 'Profile editing will be available soon');
            }}
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="create" size={20} color="#00e5ff" />
              <Text style={styles.settingLabel}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>

          <Pressable
            onPress={() => router.push('/weekly-recap')}
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="calendar" size={20} color="#00e5ff" />
              <Text style={styles.settingLabel}>Weekly Recap</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="document-text" size={20} color="#00e5ff" />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="shield-checkmark" size={20} color="#00e5ff" />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="information-circle" size={20} color="#00e5ff" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingValue}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="log-out" size={20} color="#ffa500" />
              <Text style={[styles.settingLabel, styles.logoutText]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.settingItem,
              styles.pressable,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.settingContent}>
              <Ionicons name="trash" size={20} color="#ff4444" />
              <Text style={[styles.settingLabel, styles.deleteText]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  dangerTitle: {
    color: '#ff4444',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pressable: {
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  pressed: {
    opacity: 0.7,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  logoutText: {
    color: '#ffa500',
  },
  deleteText: {
    color: '#ff4444',
  },
  changePasswordContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  changePasswordTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 12,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButtonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButton: {
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
