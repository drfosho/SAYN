import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

interface PowerUpData {
  count: number;
  poweredUpBy: Set<string>;
}

type PowerUpState = Map<string, PowerUpData>;

const CURRENT_USER_ID = 'me';

// Mock initial power up data
const initialPowerUps = new Map<string, PowerUpData>([
  ['1', { count: 9001, poweredUpBy: new Set(['user2', 'user3', 'user5']) }],
  ['2', { count: 8500, poweredUpBy: new Set(['user3', 'user4']) }],
  ['3', { count: 7200, poweredUpBy: new Set(['user2']) }],
]);

/**
 * Hook for managing Power Up state and interactions
 * Includes haptic feedback and toggle on/off functionality
 */
export const usePowerUp = () => {
  const [powerUps, setPowerUps] = useState<PowerUpState>(initialPowerUps);

  const getPowerUpCount = useCallback(
    (postId: string): number => {
      return powerUps.get(postId)?.count || 0;
    },
    [powerUps]
  );

  const isPoweredUpByUser = useCallback(
    (postId: string, userId: string = CURRENT_USER_ID): boolean => {
      return powerUps.get(postId)?.poweredUpBy.has(userId) || false;
    },
    [powerUps]
  );

  const getPoweredUpByList = useCallback(
    (postId: string): string[] => {
      const data = powerUps.get(postId);
      return data ? Array.from(data.poweredUpBy) : [];
    },
    [powerUps]
  );

  const powerUpPost = useCallback(
    async (postId: string, userId: string = CURRENT_USER_ID) => {
      // Trigger haptic feedback
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available on this platform
        console.log('Haptics not available');
      }

      setPowerUps((prev) => {
        const newState = new Map(prev);
        const existing = newState.get(postId) || { count: 0, poweredUpBy: new Set<string>() };

        if (!existing.poweredUpBy.has(userId)) {
          const newPoweredUpBy = new Set(existing.poweredUpBy);
          newPoweredUpBy.add(userId);

          newState.set(postId, {
            count: existing.count + 1,
            poweredUpBy: newPoweredUpBy,
          });
        }

        return newState;
      });
    },
    []
  );

  const unpowerUpPost = useCallback(
    async (postId: string, userId: string = CURRENT_USER_ID) => {
      // Trigger light haptic feedback
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }

      setPowerUps((prev) => {
        const newState = new Map(prev);
        const existing = newState.get(postId);

        if (existing && existing.poweredUpBy.has(userId)) {
          const newPoweredUpBy = new Set(existing.poweredUpBy);
          newPoweredUpBy.delete(userId);

          newState.set(postId, {
            count: Math.max(0, existing.count - 1),
            poweredUpBy: newPoweredUpBy,
          });
        }

        return newState;
      });
    },
    []
  );

  const togglePowerUp = useCallback(
    async (postId: string, userId: string = CURRENT_USER_ID) => {
      if (isPoweredUpByUser(postId, userId)) {
        await unpowerUpPost(postId, userId);
        return false; // Unpowered up
      } else {
        await powerUpPost(postId, userId);
        return true; // Powered up
      }
    },
    [isPoweredUpByUser, powerUpPost, unpowerUpPost]
  );

  return {
    getPowerUpCount,
    isPoweredUpByUser,
    getPoweredUpByList,
    powerUpPost,
    unpowerUpPost,
    togglePowerUp,
  };
};
