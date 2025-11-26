import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { PostCard, Post } from '@/components/PostCard';
import { TextPostCard, TextPost } from '@/components/TextPostCard';
import { SAYNLogo } from '@/components/brand';
import NotificationBell from '@/components/notifications/NotificationBell';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts } from '@/lib/api/posts';
import type { Post as DBPost } from '@/lib/api/types';

export default function SAYNFeedScreen() {
  const { user, profile, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from database
  const fetchPosts = async (isRefreshing = false) => {
    if (!user) return;

    console.log('🔄 Fetching posts from database...');
    console.log('Current User ID:', user.id);

    if (!isRefreshing) {
      setLoading(true);
    }

    try {
      const { data, error: postsError } = await getPosts(20, 0, user.id);

      if (postsError) {
        console.error('❌ Error fetching posts:', postsError);
        setError(postsError);
        return;
      }

      console.log('✅ Fetched posts:', data?.length || 0);

      // Map database posts to PostCard format
      const mappedPosts: Post[] = (data || []).map((dbPost) => ({
        id: dbPost.id,
        username: dbPost.profiles?.username || 'Unknown User',
        level: dbPost.profiles?.level || 1,
        avatarUrl: dbPost.profiles?.avatar_url || 'https://via.placeholder.com/150',
        imageUrl: dbPost.image_url || undefined,
        content: dbPost.caption || '',
        powerLevel: dbPost.power_count,
        isPoweredUp: dbPost.user_has_powered || false,
        badge: dbPost.profiles?.badge_type || undefined,
        postType: dbPost.post_type || undefined,
        commentCount: dbPost.comment_count || 0,
      }));

      setPosts(mappedPosts);
      setError(null);
    } catch (err: any) {
      console.error('❌ Exception fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load posts on mount and when user changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts();
    }
  }, [user, authLoading]);

  // Refresh feed when screen gains focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      if (user && !authLoading) {
        console.log('🔄 Screen focused, refreshing feed...');
        fetchPosts(true);
      }
    }, [user, authLoading])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <SAYNLogo size="small" withGlow={false} />
      </View>
      <View style={styles.headerRight}>
        {/* Notification Bell */}
        <Pressable
          style={styles.notificationButton}
          onPress={() => router.push('/(tabs)/notifications')}
        >
          <NotificationBell />
        </Pressable>
        {/* Profile Button */}
        <Pressable
          style={styles.profileButton}
          onPress={() => {
            if (profile?.id) {
              router.push(`/profile/${profile.id}`);
            }
          }}
        >
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileIcon}>
              <Text style={styles.profileEmoji}>
                {profile?.username?.charAt(0)?.toUpperCase() || '👤'}
              </Text>
            </View>
          )}
          {/* User level badge */}
          {profile?.level && (
            <View style={styles.powerBadge}>
              <Text style={styles.powerBadgeText}>{profile.level}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderPost = ({ item, index }: { item: Post; index: number }) => {
    // Text posts don't have images - render TextPostCard
    if (!item.imageUrl) {
      const textPost: TextPost = {
        id: item.id,
        username: item.username,
        level: item.level,
        avatarUrl: item.avatarUrl,
        content: item.content,
        powerLevel: item.powerLevel,
        isPoweredUp: item.isPoweredUp,
        commentCount: item.commentCount,
      };
      return <TextPostCard post={textPost} index={index} />;
    }

    // Image posts - render PostCard
    return <PostCard post={item} index={index} />;
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#050814', '#050814']}
          style={styles.background}
        >
          {renderHeader()}
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00e5ff" />
            <Text style={styles.loadingText}>Loading feed...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#050814', '#050814']}
          style={styles.background}
        >
          {renderHeader()}
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Please log in to see posts</Text>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#050814', '#050814']}
          style={styles.background}
        >
          {renderHeader()}
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Error loading posts</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => fetchPosts()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#050814', '#050814']}
          style={styles.background}
        >
          {renderHeader()}
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your fitness journey!
            </Text>
            <Pressable
              style={styles.createButton}
              onPress={() => router.push('/upload')}
            >
              <Text style={styles.createButtonText}>Create Post</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#050814', '#050814']}
        style={styles.background}
      >
        {renderHeader()}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00e5ff"
              colors={['#00e5ff']}
            />
          }
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#00e5ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  retryButton: {
    backgroundColor: '#00e5ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  createButton: {
    backgroundColor: '#00e5ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
