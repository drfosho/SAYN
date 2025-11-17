import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import {
  searchUsers,
  searchPosts,
  searchCoaches,
  getRecommendedUsers,
  getTrendingPosts,
  UserSearchResult,
  PostSearchResult,
  CoachSearchResult,
  RecommendedUser,
} from '@/lib/api/search';
import SearchBar from '@/components/search/SearchBar';
import UserSearchCard from '@/components/search/UserSearchCard';
import PostSearchCard from '@/components/search/PostSearchCard';
import RecommendedUserCard from '@/components/discover/RecommendedUserCard';

type SearchTab = 'discover' | 'users' | 'posts' | 'coaches';

export default function SearchScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SearchTab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Search results
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
  const [coachResults, setCoachSearchResult] = useState<CoachSearchResult[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<PostSearchResult[]>([]);

  // Debounce timer
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  // Load discover feed on mount
  useEffect(() => {
    if (user?.id) {
      loadDiscoverFeed();
    }
  }, [user?.id]);

  // Handle search query changes with debounce
  useEffect(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    if (searchQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300); // 300ms debounce
      setSearchTimer(timer);
    } else {
      // Clear results when query is empty
      setUserResults([]);
      setPostResults([]);
      setCoachSearchResult([]);
    }

    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    };
  }, [searchQuery, activeTab]);

  const loadDiscoverFeed = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [recommended, trending] = await Promise.all([
        getRecommendedUsers(user.id, 30),
        getTrendingPosts(20),
      ]);

      if (recommended.data) {
        setRecommendedUsers(recommended.data);
      }
      if (trending.data) {
        setTrendingPosts(trending.data);
      }
    } catch (error) {
      console.error('Error loading discover feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const userRes = await searchUsers(searchQuery, {}, user?.id);
          if (userRes.data) {
            setUserResults(userRes.data);
          }
          break;

        case 'posts':
          const postRes = await searchPosts(searchQuery);
          if (postRes.data) {
            setPostResults(postRes.data);
          }
          break;

        case 'coaches':
          const coachRes = await searchCoaches(searchQuery);
          if (coachRes.data) {
            setCoachSearchResult(coachRes.data);
          }
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else if (activeTab === 'discover') {
      loadDiscoverFeed();
    }
  }, [searchQuery, activeTab]);

  const renderTabButton = (tab: SearchTab, label: string, emoji: string) => {
    const isActive = activeTab === tab;
    return (
      <Pressable
        onPress={() => setActiveTab(tab)}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
      >
        {isActive ? (
          <LinearGradient
            colors={['#00e5ff', '#ff00ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tabGradient}
          >
            <Text style={styles.tabEmoji}>{emoji}</Text>
            <Text style={styles.tabLabelActive}>{label}</Text>
          </LinearGradient>
        ) : (
          <>
            <Text style={styles.tabEmoji}>{emoji}</Text>
            <Text style={styles.tabLabel}>{label}</Text>
          </>
        )}
      </Pressable>
    );
  };

  const renderContent = () => {
    if (loading && (searchQuery.trim() || activeTab === 'discover')) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
          <Text style={styles.loadingText}>
            {searchQuery.trim() ? 'Searching...' : 'Loading recommendations...'}
          </Text>
        </View>
      );
    }

    // Discover tab (no search query)
    if (activeTab === 'discover' && !searchQuery.trim()) {
      return (
        <FlatList
          ListHeaderComponent={() => (
            <>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <Text style={styles.sectionSubtitle}>
                Users you might want to follow based on your profile
              </Text>
            </>
          )}
          data={recommendedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecommendedUserCard
              user={item}
              currentUserId={user?.id}
              onFollowChange={loadDiscoverFeed}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start following users and posting to get personalized recommendations!
              </Text>
            </View>
          )}
        />
      );
    }

    // Search results
    if (searchQuery.trim()) {
      switch (activeTab) {
        case 'users':
        case 'discover': // Default to users when searching
          return (
            <FlatList
              data={userResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserSearchCard
                  user={item}
                  currentUserId={user?.id}
                  onFollowChange={performSearch}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>😔</Text>
                  <Text style={styles.emptyTitle}>No Users Found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try different search terms or filters
                  </Text>
                </View>
              )}
            />
          );

        case 'posts':
          return (
            <FlatList
              data={postResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PostSearchCard post={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📝</Text>
                  <Text style={styles.emptyTitle}>No Posts Found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try different keywords or filters
                  </Text>
                </View>
              )}
            />
          );

        case 'coaches':
          return (
            <FlatList
              data={coachResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserSearchCard
                  user={item}
                  currentUserId={user?.id}
                  onFollowChange={performSearch}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🏅</Text>
                  <Text style={styles.emptyTitle}>No Coaches Found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try different search terms or browse all coaches
                  </Text>
                </View>
              )}
            />
          );
      }
    }

    // No search query, not on discover tab
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>Start Searching</Text>
        <Text style={styles.emptySubtitle}>
          Enter a username, keyword, or search for coaches
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0e27', '#0a0e27']} style={styles.background}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users, coaches, posts..."
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {renderTabButton('discover', 'Discover', '✨')}
          {renderTabButton('users', 'Users', '👥')}
          {renderTabButton('posts', 'Posts', '📝')}
          {renderTabButton('coaches', 'Coaches', '🏅')}
        </View>

        {/* Content */}
        {renderContent()}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButtonActive: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabLabelActive: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
