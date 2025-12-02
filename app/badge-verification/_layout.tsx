import { Stack } from 'expo-router';

export default function BadgeVerificationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#050814' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="natural" />
      <Stack.Screen name="enhanced" />
    </Stack>
  );
}
