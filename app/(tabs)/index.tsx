import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PostCard, Post } from '@/components/PostCard';
import { StatusBar } from 'expo-status-bar';

// Mock data for the feed
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'GokuFitness',
    rank: 'SUPER SAIYAN',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    content: 'Just hit a new PR on deadlifts! 500lbs feels like unlocking a new transformation. Who else is pushing their limits today? 💪⚡',
    powerLevel: 9001,
  },
  {
    id: '2',
    username: 'VegetaPride',
    rank: 'ELITE WARRIOR',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    content: 'Finished my morning routine: 100 push-ups, 100 sit-ups, 100 squats, and a 10km run. The prince of all workouts never skips a day!',
    powerLevel: 8500,
  },
  {
    id: '3',
    username: 'BulmaTech',
    rank: 'GENIUS',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    content: 'New workout tracking tech just dropped! Built an AI that analyzes your power level based on form and intensity. Beta testers wanted! 🚀',
    powerLevel: 7200,
  },
];

export default function PowerFeedScreen() {
  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#00d4ff', '#ff0099']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.titleGradient}
      >
        <Text style={styles.title}>POWER FEED</Text>
      </LinearGradient>
      <Pressable style={styles.profileButton}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileEmoji}>👤</Text>
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
        colors={['#0a0e27', '#0a0e27']}
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
    backgroundColor: '#0a0e27',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  titleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  profileIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
});
