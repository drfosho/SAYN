import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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
  return (
    <ThemeProvider value={SAYNTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
