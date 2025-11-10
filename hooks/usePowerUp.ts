import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { togglePowerUp as apiTogglePowerUp } from '@/lib/api/powerups';

interface PowerUpData {
  count: number;
  isPoweredUp: boolean;
}

type PowerUpState = Map<string, PowerUpData>;

/**
 * Hook for managing Power Up state and interactions with real database
 * Includes haptic feedback and toggle on/off functionality
 */
export const usePowerUp = () => {
  const { user } = useAuth();
  const [powerUps, setPowerUps] = useState<PowerUpState>(new Map());

  // Initialize power up data for a post (called from feed)
  const initializePowerUp = useCallback((postId: string, count: number, isPoweredUp: boolean) => {
    setPowerUps((prev) => {
      const newState = new Map(prev);
      newState.set(postId, { count, isPoweredUp });
      return newState;
    });
  }, []);

  const getPowerUpCount = useCallback(
    (postId: string): number => {
      return powerUps.get(postId)?.count || 0;
    },
    [powerUps]
  );

  const isPoweredUpByUser = useCallback(
    (postId: string): boolean => {
      return powerUps.get(postId)?.isPoweredUp || false;
    },
    [powerUps]
  );

  const togglePowerUp = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) {
        console.log('❌ No user logged in, cannot power up');
        return false;
      }

      const currentState = powerUps.get(postId);
      const wasPoweredUp = currentState?.isPoweredUp || false;

      // Optimistic update
      setPowerUps((prev) => {
        const newState = new Map(prev);
        const existing = newState.get(postId) || { count: 0, isPoweredUp: false };

        newState.set(postId, {
          count: wasPoweredUp ? existing.count - 1 : existing.count + 1,
          isPoweredUp: !wasPoweredUp,
        });

        return newState;
      });

      // Trigger haptic feedback
      try {
        await Haptics.impactAsync(
          wasPoweredUp
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium
        );
      } catch (error) {
        console.log('Haptics not available');
      }

      // Call API
      console.log(`🔄 ${wasPoweredUp ? 'Unpowering' : 'Powering'} post ${postId}...`);
      const { data, error } = await apiTogglePowerUp(user.id, postId);

      if (error) {
        console.error('❌ Power up failed:', error);
        // Revert optimistic update on error
        setPowerUps((prev) => {
          const newState = new Map(prev);
          if (currentState) {
            newState.set(postId, currentState);
          }
          return newState;
        });
        return wasPoweredUp;
      }

      console.log(`✅ Power up ${wasPoweredUp ? 'removed' : 'added'} successfully`);

      // Confirm the state from server (count already updated optimistically)
      if (data) {
        setPowerUps((prev) => {
          const newState = new Map(prev);
          const existing = newState.get(postId);
          if (existing) {
            newState.set(postId, {
              count: existing.count, // Keep optimistic count
              isPoweredUp: data.isPoweredUp, // Use server confirmation
            });
          }
          return newState;
        });
      }

      return data?.isPoweredUp || false;
    },
    [user, powerUps]
  );

  return {
    initializePowerUp,
    getPowerUpCount,
    isPoweredUpByUser,
    togglePowerUp,
  };
};
