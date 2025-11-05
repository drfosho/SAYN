import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  Image,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FollowButton } from '@/components/FollowButton';
import { useFollow } from '@/hooks/useFollow';

interface User {
  id: string;
  username: string;
  avatarUrl: string;
  rank: string;
}

// Mock followers data
const MOCK_FOLLOWERS: User[] = [
  {
    id: 'user2',
    username: 'VegetaPride',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    rank: 'ELITE WARRIOR',
  },
  {
    id: 'user3',
    username: 'BulmaTech',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    rank: 'GENIUS',
  },
  {
    id: 'user4',
    username: 'PiccoloZen',
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
    rank: 'WARRIOR',
  },
  {
    id: 'user5',
    username: 'KrillinStrong',
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
    rank: 'FIGHTER',
  },
  {
    id: 'user6',
    username: 'TrunksFuture',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    rank: 'SUPER SAIYAN',
  },
];

export default function FollowersScreen() {
  const { isFollowing, toggleFollow } = useFollow();

  const renderUser = ({ item }: { item: User }) => (
    <Pressable
      style={styles.userCard}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      <LinearGradient
        colors={['#0d1128', '#1a1f3a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.rank}>{item.rank}</Text>
        </View>

        {/* Follow button */}
        <View style={styles.followButtonContainer}>
          <FollowButton
            isFollowing={isFollowing(item.id)}
            onPress={() => toggleFollow(item.id)}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <LinearGradient
            colors={['#ff0080', '#ff4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>←</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.headerTitle}>FOLLOWERS</Text>
        <View style={styles.backButton} />
      </View>

      {/* Followers list */}
      <FlatList
        data={MOCK_FOLLOWERS}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  userCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  rank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
  },
  followButtonContainer: {
    width: 120,
  },
});
