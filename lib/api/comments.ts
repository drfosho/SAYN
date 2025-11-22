import { supabase } from '../supabase';
import { Comment, CommentCreate, CommentUpdate, CommentPowerUp, ApiResponse } from './types';
import { awardXP } from './xp';
import { createNotification } from './notifications';

/**
 * Get comments for a post with nested replies
 * Returns hierarchical structure with parent comments and their replies
 */
export async function getComments(
  postId: string,
  userId?: string
): Promise<ApiResponse<Comment[]>> {
  try {
    // Fetch all comments for the post (both parent and replies)
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          rank,
          level,
          badge_type,
          is_verified_coach
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!commentsData) {
      return { data: [], error: null };
    }

    // If userId provided, check which comments user has powered up
    let userPowerUps: Set<string> = new Set();
    if (userId) {
      const { data: powerUpsData } = await supabase
        .from('comment_power_ups')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', commentsData.map(c => c.id));

      if (powerUpsData) {
        userPowerUps = new Set(powerUpsData.map(p => p.comment_id));
      }
    }

    // Separate parent comments and replies
    const parentComments: Comment[] = [];
    const repliesMap: { [key: string]: Comment[] } = {};

    commentsData.forEach((comment: any) => {
      const commentWithPowerStatus = {
        ...comment,
        user_has_powered: userPowerUps.has(comment.id),
        replies: [],
      };

      if (comment.parent_comment_id === null) {
        // Parent comment
        parentComments.push(commentWithPowerStatus);
      } else {
        // Reply - add to replies map
        if (!repliesMap[comment.parent_comment_id]) {
          repliesMap[comment.parent_comment_id] = [];
        }
        repliesMap[comment.parent_comment_id].push(commentWithPowerStatus);
      }
    });

    // Attach replies to parent comments
    parentComments.forEach(parent => {
      parent.replies = repliesMap[parent.id] || [];
      parent.reply_count = parent.replies.length;
    });

    return { data: parentComments, error: null };
  } catch (error: any) {
    console.error('Get comments error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create a new comment
 * Awards +2 XP to commenter
 * Creates notification for post owner (if not self-comment)
 */
export async function createComment(
  commentData: CommentCreate
): Promise<ApiResponse<Comment>> {
  try {
    // Validate text length
    if (!commentData.text || commentData.text.trim().length === 0) {
      return { data: null, error: 'Comment text cannot be empty' };
    }

    if (commentData.text.length > 500) {
      return { data: null, error: 'Comment text cannot exceed 500 characters' };
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: commentData.post_id,
        user_id: commentData.user_id,
        parent_comment_id: commentData.parent_comment_id || null,
        text: commentData.text.trim(),
      })
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          rank,
          level,
          badge_type,
          is_verified_coach
        )
      `)
      .single();

    if (error) throw error;

    // Award XP for commenting (+2 XP for engagement)
    try {
      await awardXP(commentData.user_id, 2, 'comment', comment.id);
    } catch (xpError) {
      console.warn('Failed to award XP for comment:', xpError);
    }

    // Create notification
    try {
      if (commentData.parent_comment_id) {
        // Reply to comment - notify parent comment owner
        const { data: parentComment } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', commentData.parent_comment_id)
          .single();

        if (parentComment && parentComment.user_id !== commentData.user_id) {
          await createNotification({
            user_id: parentComment.user_id,
            type: 'comment_reply',
            title: 'New Reply',
            message: `${comment.profiles?.username || 'Someone'} replied to your comment`,
            related_post_id: commentData.post_id,
            related_comment_id: comment.id,
            from_user_id: commentData.user_id,
          });
        }
      } else {
        // Top-level comment - notify post owner
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', commentData.post_id)
          .single();

        if (post && post.user_id !== commentData.user_id) {
          await createNotification({
            user_id: post.user_id,
            type: 'comment',
            title: 'New Comment',
            message: `${comment.profiles?.username || 'Someone'} commented on your post`,
            related_post_id: commentData.post_id,
            related_comment_id: comment.id,
            from_user_id: commentData.user_id,
          });
        }
      }
    } catch (notifError) {
      console.warn('Failed to create notification for comment:', notifError);
    }

    return { data: comment, error: null };
  } catch (error: any) {
    console.error('Create comment error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update a comment (edit)
 * Only allowed within 5 minutes of posting
 */
export async function updateComment(
  commentId: string,
  userId: string,
  updateData: CommentUpdate
): Promise<ApiResponse<Comment>> {
  try {
    // Validate text length
    if (!updateData.text || updateData.text.trim().length === 0) {
      return { data: null, error: 'Comment text cannot be empty' };
    }

    if (updateData.text.length > 500) {
      return { data: null, error: 'Comment text cannot exceed 500 characters' };
    }

    // Check if comment exists and belongs to user
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('created_at, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;

    if (existingComment.user_id !== userId) {
      return { data: null, error: 'You can only edit your own comments' };
    }

    // Check if within 5 minute edit window
    const createdAt = new Date(existingComment.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;

    if (diffMinutes > 5) {
      return { data: null, error: 'Comments can only be edited within 5 minutes of posting' };
    }

    // Update comment
    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        text: updateData.text.trim(),
        edited: true,
      })
      .eq('id', commentId)
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          rank,
          level,
          badge_type,
          is_verified_coach
        )
      `)
      .single();

    if (error) throw error;

    return { data: comment, error: null };
  } catch (error: any) {
    console.error('Update comment error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete a comment and all its replies
 */
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<ApiResponse<boolean>> {
  try {
    // Check if comment exists and belongs to user
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, parent_comment_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;

    if (existingComment.user_id !== userId) {
      return { data: null, error: 'You can only delete your own comments' };
    }

    // Delete all replies first (cascading delete)
    const { error: repliesError } = await supabase
      .from('comments')
      .delete()
      .eq('parent_comment_id', commentId);

    if (repliesError) throw repliesError;

    // Delete the comment itself
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Power up a comment
 * Shares daily limit with post power ups (10 per day)
 * Awards +1 XP to comment owner and +1 XP to power up giver
 */
export async function powerUpComment(
  userId: string,
  commentId: string
): Promise<ApiResponse<CommentPowerUp>> {
  try {
    // Check daily power ups remaining
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_power_ups_remaining')
      .eq('id', userId)
      .single();

    if (!profile || profile.daily_power_ups_remaining <= 0) {
      return { data: null, error: 'No power ups remaining today' };
    }

    // Insert power up
    const { data: powerUp, error } = await supabase
      .from('comment_power_ups')
      .insert({
        user_id: userId,
        comment_id: commentId,
      })
      .select()
      .single();

    if (error) {
      // Check if already powered up
      if (error.code === '23505') {
        return { data: null, error: 'Already powered up this comment' };
      }
      throw error;
    }

    // Increment the power count on the comment
    // First get current count
    const { data: currentComment } = await supabase
      .from('comments')
      .select('power_count')
      .eq('id', commentId)
      .single();

    const newCount = (currentComment?.power_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('comments')
      .update({ power_count: newCount })
      .eq('id', commentId);

    if (updateError) throw updateError;

    // Decrement user's daily power ups remaining
    const { error: decrementError } = await supabase
      .from('profiles')
      .update({ daily_power_ups_remaining: profile.daily_power_ups_remaining - 1 })
      .eq('id', userId);

    if (decrementError) throw decrementError;

    // Award XP to comment owner (+1 XP)
    try {
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (comment && comment.user_id !== userId) {
        await awardXP(comment.user_id, 1, 'comment_power_up', commentId);

        // Create notification for comment owner
        const { data: post } = await supabase
          .from('comments')
          .select('post_id')
          .eq('id', commentId)
          .single();

        if (post) {
          await createNotification({
            user_id: comment.user_id,
            type: 'comment_power_up',
            title: 'Comment Powered Up!',
            message: 'Someone powered up your comment',
            related_post_id: post.post_id,
            related_comment_id: commentId,
            from_user_id: userId,
          });
        }
      }

      // Award XP to power up giver (+1 XP for being supportive)
      await awardXP(userId, 1, 'give_comment_power_up', commentId);
    } catch (xpError) {
      console.warn('Failed to award XP for comment power up:', xpError);
    }

    return { data: powerUp, error: null };
  } catch (error: any) {
    console.error('Power up comment error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Remove power up from a comment
 */
export async function unPowerUpComment(
  userId: string,
  commentId: string
): Promise<ApiResponse<boolean>> {
  try {
    // Delete power up
    const { error } = await supabase
      .from('comment_power_ups')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId);

    if (error) throw error;

    // Decrement the power count on the comment
    // First get current count
    const { data: currentComment } = await supabase
      .from('comments')
      .select('power_count')
      .eq('id', commentId)
      .single();

    const newCount = Math.max((currentComment?.power_count || 0) - 1, 0);

    const { error: updateError } = await supabase
      .from('comments')
      .update({ power_count: newCount })
      .eq('id', commentId);

    if (updateError) throw updateError;

    // Increment user's daily power ups remaining
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_power_ups_remaining')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ daily_power_ups_remaining: profile.daily_power_ups_remaining + 1 })
        .eq('id', userId);
    }

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Un-power up comment error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Toggle power up on a comment
 */
export async function toggleCommentPowerUp(
  userId: string,
  commentId: string
): Promise<ApiResponse<{ isPoweredUp: boolean }>> {
  try {
    // Check if already powered up
    const { data: existingPowerUp } = await supabase
      .from('comment_power_ups')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle();

    if (existingPowerUp) {
      // Already powered up, so remove it
      await unPowerUpComment(userId, commentId);
      return { data: { isPoweredUp: false }, error: null };
    } else {
      // Not powered up, so add it
      const result = await powerUpComment(userId, commentId);
      if (result.error) {
        return { data: null, error: result.error };
      }
      return { data: { isPoweredUp: true }, error: null };
    }
  } catch (error: any) {
    console.error('Toggle comment power up error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: string): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('parent_comment_id', null);

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error: any) {
    console.error('Get comment count error:', error);
    return { data: null, error: error.message };
  }
}
