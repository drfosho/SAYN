import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  Notification,
  NotificationType,
} from '@/lib/api/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  filterByType: (type: NotificationType | null) => void;
  activeFilter: NotificationType | null;
}

const PAGE_SIZE = 20;

/**
 * Hook for managing notifications state and interactions
 * Includes real-time subscription for new notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotificationType | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (type?: NotificationType | null, append = false) => {
    if (!user) return;

    if (!append) {
      setLoading(true);
    }

    try {
      const offset = append ? notifications.length : 0;
      const { data, error: fetchError } = await getNotifications(
        user.id,
        type || undefined,
        PAGE_SIZE
      );

      if (fetchError) {
        throw new Error(fetchError);
      }

      if (data) {
        if (append) {
          setNotifications(prev => [...prev, ...data]);
        } else {
          setNotifications(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, notifications.length]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: countError } = await getUnreadCount(user.id);
      if (!countError && data !== null) {
        setUnreadCount(data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user]);

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToNotifications(user.id, (newNotification) => {
      console.log('New notification received:', newNotification);

      // Add new notification to the top of the list
      setNotifications(prev => [newNotification, ...prev]);

      // Increment unread count
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Mark a single notification as read
  const markRead = useCallback(async (notificationId: string) => {
    const { error: markError } = await markAsRead(notificationId);

    if (!markError) {
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );

      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    if (!user) return;

    const { error: markError } = await markAllAsRead(user.id);

    if (!markError) {
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, [user]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await fetchNotifications(activeFilter);
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount, activeFilter]);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(activeFilter, true);
  }, [fetchNotifications, hasMore, loading, activeFilter]);

  // Filter by notification type
  const filterByType = useCallback((type: NotificationType | null) => {
    setActiveFilter(type);
    fetchNotifications(type);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    refresh,
    loadMore,
    hasMore,
    filterByType,
    activeFilter,
  };
}

/**
 * Lightweight hook for just the unread count (for NotificationBell)
 */
export function useUnreadNotificationCount(): number {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await getUnreadCount(user.id);
      if (!error && data !== null) {
        setUnreadCount(data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  // Subscribe to real-time notifications for count updates
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToNotifications(user.id, () => {
      // Increment unread count when new notification arrives
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Refresh count periodically (every 30 seconds) as a fallback
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return unreadCount;
}
