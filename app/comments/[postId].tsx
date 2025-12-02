import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentPowerUp,
  Comment,
} from '@/lib/api';
import { CommentsList } from '@/components/comments/CommentsList';
import { CommentInput } from '@/components/comments/CommentInput';
import { layout, spacing, fontSize, fontWeight } from '@/constants';

/**
 * Comments Screen - Full-screen modal for viewing and posting comments
 * Shows post thumbnail, comments list, and input bar
 */
export default function CommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user, profile } = useAuth();
  const flatListRef = useRef<FlatList<any>>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reply/Edit state
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  // Post data (for display at top)
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    loadComments();
    loadPost();
  }, [postId]);

  // Auto-scroll when entering reply or edit mode
  useEffect(() => {
    if (replyingTo || editingComment) {
      // Small delay to let keyboard animation start
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [replyingTo, editingComment]);

  const loadPost = async () => {
    try {
      // Import here to avoid circular dependency
      const { getPost } = await import('@/lib/api');
      const { data } = await getPost(postId);
      if (data) {
        setPost(data);
      }
    } catch (error) {
      console.error('Load post error:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await getComments(postId, user?.id);

      if (error) {
        console.error('Load comments error:', error);
        Alert.alert('Error', 'Failed to load comments');
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Load comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadComments();
    setRefreshing(false);
  };

  const handleSubmitComment = async (text: string) => {
    if (!user || !profile) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    try {
      setSubmitting(true);

      if (editingComment) {
        // Edit mode
        const { data, error } = await updateComment(editingComment.id, user.id, { text });

        if (error) {
          Alert.alert('Error', error);
          return;
        }

        // Update comment in list
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === editingComment.id) {
              return data!;
            }
            // Check replies too
            if (c.replies) {
              c.replies = c.replies.map((r) => (r.id === editingComment.id ? data! : r));
            }
            return c;
          })
        );

        setEditingComment(null);
      } else {
        // Create mode
        const { data, error } = await createComment({
          post_id: postId,
          user_id: user.id,
          parent_comment_id: replyingTo?.id,
          text,
        });

        if (error) {
          Alert.alert('Error', error);
          return;
        }

        // Add new comment to list
        if (replyingTo) {
          // Add as reply
          setComments((prev) =>
            prev.map((c) => {
              if (c.id === replyingTo.id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), data!],
                  reply_count: (c.reply_count || 0) + 1,
                };
              }
              return c;
            })
          );
          setReplyingTo(null);
        } else {
          // Add as parent comment
          setComments((prev) => [...prev, { ...data!, replies: [] }]);
          // Scroll to new comment
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }

      // Dismiss keyboard after sending
      Keyboard.dismiss();
    } catch (error) {
      console.error('Submit comment error:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleDelete = async (comment: Comment) => {
    if (!user) return;

    try {
      const { error } = await deleteComment(comment.id, user.id);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      // Remove comment from list
      if (comment.parent_comment_id) {
        // Remove reply
        setComments((prev) =>
          prev.map((c) => {
            if (c.replies) {
              c.replies = c.replies.filter((r) => r.id !== comment.id);
              c.reply_count = c.replies.length;
            }
            return c;
          })
        );
      } else {
        // Remove parent comment
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handlePowerUp = async (comment: Comment) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to power up comments');
      return;
    }

    try {
      const { data, error } = await toggleCommentPowerUp(user.id, comment.id);

      if (error) {
        if (error.includes('No power ups remaining')) {
          Alert.alert('Out of Power Ups!', 'You\'ve used all your power ups today. Come back tomorrow!');
        } else {
          Alert.alert('Error', error);
        }
        return;
      }

      // Update comment power count and user_has_powered status
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === comment.id) {
            return {
              ...c,
              user_has_powered: data?.isPoweredUp || false,
              power_count: c.power_count + (data?.isPoweredUp ? 1 : -1),
            };
          }
          // Check replies too
          if (c.replies) {
            c.replies = c.replies.map((r) =>
              r.id === comment.id
                ? {
                    ...r,
                    user_has_powered: data?.isPoweredUp || false,
                    power_count: r.power_count + (data?.isPoweredUp ? 1 : -1),
                  }
                : r
            );
          }
          return c;
        })
      );

      // Show success feedback when powering up (not un-powering)
      if (data?.isPoweredUp) {
        Alert.alert(
          '⚡ Powered Up!',
          `You powered up ${comment.profiles?.username || 'this'}'s comment`,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Power up comment error:', error);
      Alert.alert('Error', 'Failed to power up comment');
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  // Handle input focus - scroll to bottom
  const handleInputFocus = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Post preview */}
        {post && (
          <View style={styles.postPreview}>
            {post.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
            )}
            <View style={styles.postInfo}>
              <Text style={styles.postUsername}>@{post.profiles?.username || 'Unknown'}</Text>
              {post.caption && (
                <Text style={styles.postCaption} numberOfLines={2}>
                  {post.caption}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Comments list - takes remaining space */}
        <View style={styles.commentsContainer}>
          <CommentsList
            comments={comments}
            currentUserId={user.id}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPowerUp={handlePowerUp}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            listRef={flatListRef}
          />
        </View>

        {/* Comment input - fixed at bottom */}
        <CommentInput
          currentUser={profile}
          onSubmit={handleSubmitComment}
          replyingTo={replyingTo?.profiles?.username || null}
          onCancelReply={handleCancelReply}
          editingText={editingComment?.text || null}
          onCancelEdit={handleCancelEdit}
          autoFocus={!!replyingTo || !!editingComment}
          onFocus={handleInputFocus}
          disabled={submitting}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  closeButton: {
    padding: spacing.sm,
  },
  postPreview: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  postImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postUsername: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#00d4ff',
    marginBottom: spacing.xs,
  },
  postCaption: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  commentsContainer: {
    flex: 1,
  },
});
