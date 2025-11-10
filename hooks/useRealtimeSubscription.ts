import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Subscribe to real-time changes on a table
 */
export function useRealtimeSubscription(
  table: string,
  event: RealtimeEvent,
  callback: (payload: any) => void,
  filter?: { column: string; value: string }
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const subscribe = async () => {
      let channelBuilder = supabase
        .channel(`${table}_${event}`)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
          },
          callback
        );

      channel = channelBuilder.subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [table, event, filter?.column, filter?.value]);
}

/**
 * Subscribe to new posts in the feed
 */
export function useNewPostsSubscription(onNewPost: (post: any) => void) {
  useRealtimeSubscription('posts', 'INSERT', (payload) => {
    onNewPost(payload.new);
  });
}

/**
 * Subscribe to power ups on a specific post
 */
export function usePostPowerUpsSubscription(postId: string, onPowerUpChange: () => void) {
  useRealtimeSubscription(
    'power_ups',
    '*',
    () => {
      onPowerUpChange();
    },
    { column: 'post_id', value: postId }
  );
}

/**
 * Subscribe to new followers
 */
export function useNewFollowersSubscription(userId: string, onNewFollower: (follower: any) => void) {
  useRealtimeSubscription(
    'follows',
    'INSERT',
    (payload) => {
      if (payload.new.following_id === userId) {
        onNewFollower(payload.new);
      }
    },
    { column: 'following_id', value: userId }
  );
}

/**
 * Subscribe to profile updates
 */
export function useProfileUpdatesSubscription(userId: string, onUpdate: (profile: any) => void) {
  useRealtimeSubscription(
    'profiles',
    'UPDATE',
    (payload) => {
      onUpdate(payload.new);
    },
    { column: 'id', value: userId }
  );
}
