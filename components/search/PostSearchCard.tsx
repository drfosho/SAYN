import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PostSearchResult } from '@/lib/api/search';
import { POST_TYPE_CONFIGS } from '@/lib/types/xp';

interface PostSearchCardProps {
  post: PostSearchResult;
}

export default function PostSearchCard({ post }: PostSearchCardProps) {
  const handlePress = () => {
    router.push(`/profile/${post.profiles?.username}`);
  };

  const postTypeConfig = POST_TYPE_CONFIGS.find((c) => c.type === post.post_type);
  const isVerified = post.verification_status === 'verified';

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.05)', 'rgba(255, 0, 128, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Post Image */}
        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        )}

        {/* Post Info */}
        <View style={styles.postInfo}>
          {/* User */}
          <View style={styles.userRow}>
            <Text style={styles.username}>@{post.profiles?.username}</Text>
            <Text style={styles.timeAgo}>{timeAgo(post.created_at)}</Text>
          </View>

          {/* Caption */}
          {post.caption && (
            <Text style={styles.caption} numberOfLines={3}>
              {post.caption}
            </Text>
          )}

          {/* Badges and Stats */}
          <View style={styles.footer}>
            <View style={styles.badges}>
              {postTypeConfig && (
                <View style={[styles.badge, { backgroundColor: `${postTypeConfig.color}22` }]}>
                  <Text style={styles.badgeEmoji}>{postTypeConfig.icon}</Text>
                  <Text style={[styles.badgeText, { color: postTypeConfig.color }]}>
                    {postTypeConfig.label}
                  </Text>
                </View>
              )}

              {isVerified && (
                <View style={[styles.badge, { backgroundColor: 'rgba(0, 255, 136, 0.15)' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#00ff88" />
                  <Text style={[styles.badgeText, { color: '#00ff88' }]}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.stats}>
              <Ionicons name="flash" size={16} color="#00e5ff" />
              <Text style={styles.statText}>{post.power_count}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1a1f3a',
  },
  postInfo: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00e5ff',
  },
  timeAgo: {
    fontSize: 11,
    color: '#6b7280',
  },
  caption: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
