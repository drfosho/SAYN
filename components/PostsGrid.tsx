import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GRID_GAP = 4;
const ITEM_SIZE = (width - (GRID_GAP * 4)) / 3;

export interface GridPost {
  id: string;
  imageUrl?: string;
  isVerified: boolean;
  powerLevel: number;
}

interface PostsGridProps {
  posts: GridPost[];
  onPostPress?: (post: GridPost) => void;
}

/**
 * 3-column grid of user posts following SAYN aesthetic
 * Angular styling with verified badges
 */
export const PostsGrid: React.FC<PostsGridProps> = ({ posts, onPostPress }) => {
  if (posts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>POSTS</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Share your journey to start building power</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>POSTS</Text>
      <View style={styles.grid}>
        {posts.map((post, index) => (
          <GridItem
            key={post.id}
            post={post}
            onPress={() => onPostPress?.(post)}
          />
        ))}
      </View>
    </View>
  );
};

interface GridItemProps {
  post: GridPost;
  onPress?: () => void;
}

const GridItem: React.FC<GridItemProps> = ({ post, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.gridItem}>
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
      ) : (
        <View style={styles.textPostPlaceholder}>
          <Text style={styles.textPostIcon}>✏️</Text>
          <Text style={styles.textPostLabel}>TEXT POST</Text>
        </View>
      )}

      {/* Verified badge */}
      {post.isVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}

      {/* Power level indicator */}
      <View style={styles.powerIndicator}>
        <Text style={styles.powerText}>⚡ {post.powerLevel}</Text>
      </View>

      {/* Angular frame overlay */}
      <View style={styles.frameOverlay} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: GRID_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  textPostPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1f3a',
    gap: 4,
  },
  textPostIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  textPostLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00e5ff',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  verifiedIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  powerIndicator: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00e5ff',
  },
  powerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 0.5,
  },
  frameOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 4,
    pointerEvents: 'none',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
