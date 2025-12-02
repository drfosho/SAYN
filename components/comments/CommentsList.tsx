import React, { useState, RefObject } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Comment } from '@/lib/api/types';
import { CommentCard } from './CommentCard';
import { spacing, fontSize, fontWeight } from '@/constants';

interface CommentsListProps {
  comments: Comment[];
  currentUserId: string;
  onReply: (comment: Comment) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onPowerUp: (comment: Comment) => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  listRef?: RefObject<FlatList<any> | null>;
}

/**
 * CommentsList - Displays comments with nested replies
 * Shows parent comments and their replies (1 level deep)
 * Includes empty state and loading states
 */
export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onPowerUp,
  loading = false,
  refreshing = false,
  onRefresh,
  listRef,
}) => {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Check if comment can be edited (within 5 minutes)
  const canEdit = (comment: Comment): boolean => {
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
    return diffMinutes <= 5 && comment.user_id === currentUserId;
  };

  const renderComment = ({ item: comment }: { item: Comment }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments.has(comment.id);
    const visibleReplies = isExpanded ? comment.replies : comment.replies?.slice(0, 2);
    const hiddenRepliesCount =
      hasReplies && !isExpanded ? (comment.replies?.length || 0) - 2 : 0;

    return (
      <View>
        {/* Parent comment */}
        <CommentCard
          comment={comment}
          currentUserId={currentUserId}
          onReply={() => onReply(comment)}
          onEdit={() => onEdit(comment)}
          onDelete={() => onDelete(comment)}
          onPowerUp={() => onPowerUp(comment)}
          canEdit={canEdit(comment)}
        />

        {/* Replies */}
        {hasReplies && (
          <View style={styles.repliesContainer}>
            {visibleReplies?.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={() => {}} // No nested replies
                onEdit={() => onEdit(reply)}
                onDelete={() => onDelete(reply)}
                onPowerUp={() => onPowerUp(reply)}
                isReply
                canEdit={canEdit(reply)}
              />
            ))}

            {/* View more replies button */}
            {hiddenRepliesCount > 0 && (
              <TouchableOpacity
                onPress={() => toggleReplies(comment.id)}
                style={styles.viewMoreButton}
              >
                <Text style={styles.viewMoreText}>
                  View {hiddenRepliesCount} more {hiddenRepliesCount === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Hide replies button */}
            {isExpanded && (comment.replies?.length || 0) > 2 && (
              <TouchableOpacity
                onPress={() => toggleReplies(comment.id)}
                style={styles.viewMoreButton}
              >
                <Text style={styles.viewMoreText}>Hide replies</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />
      </View>
    );
  };

  // Empty state
  if (!loading && comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MessageCircle size={48} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No comments yet</Text>
        <Text style={styles.emptySubtext}>Be the first to comment</Text>
      </View>
    );
  }

  // Loading state
  if (loading && comments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>Loading comments...</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={comments}
      renderItem={renderComment}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      removeClippedSubviews={false} // Better for nested content
      maxToRenderPerBatch={10}
      windowSize={10}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 120, // Extra padding so last comment visible above input
  },
  repliesContainer: {
    // Replies are already indented in CommentCard
  },
  viewMoreButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base + spacing['2xl'] + spacing.md,
    marginTop: spacing.xs,
  },
  viewMoreText: {
    fontSize: fontSize.sm,
    color: '#00d4ff',
    fontWeight: fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: spacing.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.4)',
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.base,
  },
});
