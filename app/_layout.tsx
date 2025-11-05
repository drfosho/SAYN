import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { LoadingScreen } from '@/components/LoadingScreen';

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync();

// Custom dark theme for SAYN - Intense, powerful aesthetic
const SAYNTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#00e5ff', // More electric cyan
    background: '#050814', // Deeper black
    card: '#0d1128', // Darker blue-black
    text: '#ffffff',
    border: 'rgba(0, 229, 255, 0.3)', // Stronger cyan border
  },
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const fadeOpacity = useSharedValue(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Load any resources or data here
        // For now, we'll just wait for fonts/assets to load naturally
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleLoadingComplete = useCallback(() => {
    // Fade out the loading screen
    fadeOpacity.value = withTiming(
      0,
      {
        duration: 300,
        easing: Easing.out(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(setShowLoading)(false);
        }
      }
    );
  }, []);

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={SAYNTheme}>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />

        {/* Loading Screen Overlay */}
        {showLoading && (
          <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
            <LoadingScreen onReady={handleLoadingComplete} />
          </Animated.View>
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});
