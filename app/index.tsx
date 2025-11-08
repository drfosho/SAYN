import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated - go to welcome screen
      router.replace('/auth/welcome');
    } else if (user && !profile) {
      // Authenticated but no profile - go to onboarding
      router.replace('/onboarding/profile-setup');
    } else {
      // Authenticated and has profile - go to main app
      router.replace('/(tabs)');
    }
  }, [user, profile, loading]);

  // Show loading state
  return (
    <LinearGradient
      colors={['#050814', '#0d1128', '#1a1f3a']}
      style={styles.container}
    >
      <ActivityIndicator size="large" color="#00e5ff" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
