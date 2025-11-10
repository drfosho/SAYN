import { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, profile, loading } = useAuth();
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    console.log('🔐 Auth Check - Loading:', loading, '| User:', user?.id || 'none', '| Profile:', profile?.username || 'none');

    if (loading) {
      console.log('⏳ Checking authentication...');
      return;
    }

    if (!user) {
      // Not authenticated - go to welcome screen
      console.log('❌ No user found - Redirecting to welcome screen');
      router.replace('/auth/welcome');
    } else if (user && !profile) {
      // Authenticated but no profile - go to onboarding
      console.log('⚠️ User authenticated but no profile - Redirecting to onboarding');
      router.replace('/onboarding/profile-setup');
    } else {
      // Authenticated and has profile - go to main app
      console.log('✅ User authenticated with profile - Redirecting to feed');
      console.log('👤 Welcome back,', profile?.username || profile?.display_name);
      router.replace('/(tabs)');
    }
  }, [user, profile, loading]);

  const handleLoadingComplete = useCallback(() => {
    setLoadingComplete(true);
  }, []);

  // Show loading screen while checking auth
  return <LoadingScreen onReady={handleLoadingComplete} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
