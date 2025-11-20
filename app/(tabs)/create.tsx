import { useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Create tab - Immediately redirects to upload screen
 * This tab acts as a navigation trigger to the upload flow
 */
export default function CreateScreen() {
  // Navigate to upload screen when this tab is focused
  useFocusEffect(() => {
    router.push('/upload');
  });

  // Show loading indicator while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00d4ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
