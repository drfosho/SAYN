import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0a0e27', '#0a0e27']}
        style={styles.background}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>➕</Text>
          <Text style={styles.title}>CREATE POST</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});
