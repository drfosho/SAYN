import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Custom dark theme for Power Feed
const PowerFeedTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#00d4ff',
    background: '#0a0e27',
    card: '#1a1f3a',
    text: '#ffffff',
    border: 'rgba(0, 212, 255, 0.2)',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={PowerFeedTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
