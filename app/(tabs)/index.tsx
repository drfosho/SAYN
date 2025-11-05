import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PostCard, Post } from '@/components/PostCard';
import { StatusBar } from 'expo-status-bar';

// Mock data for the feed
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'GokuFitness',
    level: 95, // God Tier
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    content: 'Just hit a new PR on deadlifts! 500lbs feels like unlocking a new transformation. Who else is pushing their limits today? 💪⚡',
    powerLevel: 9001,
  },
  {
    id: '2',
    username: 'VegetaPride',
    level: 75, // Superhuman
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    content: 'Finished my morning routine: 100 push-ups, 100 sit-ups, 100 squats, and a 10km run. The prince of all workouts never skips a day!',
    powerLevel: 8500,
  },
  {
    id: '3',
    username: 'BulmaTech',
    level: 45, // Titan
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    content: 'New workout tracking tech just dropped! Built an AI that analyzes your power level based on form and intensity. Beta testers wanted! 🚀',
    powerLevel: 7200,
  },
];

export default function SAYNFeedScreen() {
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        {/* Angular container with metallic gradient matching logo */}
        <LinearGradient
          colors={['#00e5ff', '#00b8d4', '#ff6b9d', '#ff4081']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.titleGradient}
        >
          {/* Inner gradient for metallic depth */}
          <View style={styles.titleInner}>
            <Text style={styles.title}>SAYN</Text>
          </View>
        </LinearGradient>
      </View>
      <Pressable
        style={styles.profileButton}
        onPress={() => router.push('/profile/me')}
      >
        <View style={styles.profileIcon}>
          <Text style={styles.profileEmoji}>👤</Text>
        </View>
        {/* Power level indicator badge */}
        <View style={styles.powerBadge}>
          <Text style={styles.powerBadgeText}>99</Text>
        </View>
      </Pressable>
    </View>
  );

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <PostCard post={item} index={index} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#050814', '#050814']}
        style={styles.background}
      >
        {renderHeader()}
        <FlatList
          data={MOCK_POSTS}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814', // Darker background
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
  },
  logoContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  titleGradient: {
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#000000',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
    // Angular, slanted appearance like the logo
    transform: [{ skewX: '-5deg' }],
  },
  titleInner: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 8,
    // Multiple text shadows for metallic depth effect
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    // Angular, italic style matching the logo
    fontStyle: 'italic',
  },
  profileButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, // Thicker border
    borderColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  profileIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 26,
  },
  powerBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff0080',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 3, // Thicker border
    borderColor: '#000000',
    minWidth: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  powerBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
});
