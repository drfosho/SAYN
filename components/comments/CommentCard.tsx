import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Zap, MessageCircle, Edit2, Trash2 } from 'lucide-react-native';
import { Comment } from '@/lib/api/types';
import { RankBadge } from '../RankBadge';
import { getRankForLevel } from '@/constants/ranks';
import { layout, spacing, fontSize, fontWeight } from '@/constants';

interface CommentCardProps {
  comment: Comment;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPowerUp: () => void;
  currentUserId: string;
  isReply?: boolean;
  canEdit?: boolean; // Only if within 5 minutes
}

/**
 * CommentCard - Individual comment display
 * Shows comment text, author, rank, time, and action buttons
 */
export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onPowerUp,
  currentUserId,
  isReply = false,
  canEdit = false,
}) => {
  const isOwnComment = comment.user_id === currentUserId;
  const profile = comment.profiles;
  const rank = profile ? getRankForLevel(profile.level) : null;

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: false });

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      comment.replies && comment.replies.length > 0
        ? 'This comment has replies. Delete anyway?'
        : 'Delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      {/* Avatar and content */}
      <View style={styles.row}>
        {/* Avatar */}
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {profile?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}

        {/* Comment content */}
        <View style={styles.content}>
          {/* Header: Username, badge, time */}
          <View style={styles.header}>
            <Text style={styles.username}>{profile?.username || 'Unknown'}</Text>
            <Text style={styles.dot}>•</Text>
            {rank && (
              <View style={styles.badgeContainer}>
                <RankBadge rank={rank} size="small" showLabel={false} animate={false} />
              </View>
            )}
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{timeAgo}</Text>
          </View>

          {/* Comment text */}
          <Text style={styles.text}>{comment.text}</Text>
          {comment.edited && <Text style={styles.editedLabel}>Edited</Text>}

          {/* Actions row */}
          <View style={styles.actions}>
            {/* Power up button */}
            <TouchableOpacity
              onPress={onPowerUp}
              style={[
                styles.actionButton,
                comment.user_has_powered && styles.actionButtonActive,
              ]}
            >
              <Zap
                size={14}
                color={comment.user_has_powered ? '#00d4ff' : 'rgba(255,255,255,0.5)'}
                fill={comment.user_has_powered ? '#00d4ff' : 'none'}
              />
              {comment.power_count > 0 && (
                <Text
                  style={[
                    styles.actionText,
                    comment.user_has_powered && styles.actionTextActive,
                  ]}
                >
                  {comment.power_count}
                </Text>
              )}
            </TouchableOpacity>

            {/* Reply button (not shown on replies to keep it 1 level deep) */}
            {!isReply && (
              <TouchableOpacity onPress={onReply} style={styles.actionButton}>
                <MessageCircle size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            )}

            {/* Edit button (only own comments, within 5 min) */}
            {isOwnComment && canEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Edit2 size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}

            {/* Delete button (only own comments) */}
            {isOwnComment && (
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Trash2 size={14} color="rgba(255,100,100,0.7)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  replyContainer: {
    paddingLeft: spacing.base + layout.avatarXs + spacing.md, // Indent replies
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: layout.avatarXs,
    height: layout.avatarXs,
    borderRadius: layout.avatarXs / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#0a0e27',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  dot: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.3)',
  },
  badgeContainer: {
    marginTop: -2,
  },
  time: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  text: {
    fontSize: fontSize.md,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.xs,
  },
  editedLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  actionButtonActive: {
    // Power up active state
  },
  actionText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: fontWeight.semibold,
  },
  actionTextActive: {
    color: '#00d4ff',
  },
});
