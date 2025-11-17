# Notifications System - Complete Implementation

## Overview

The SAYN Notifications System provides comprehensive real-time notifications for social interactions, achievements, and system messages. Users receive instant notifications when they gain followers, receive power-ups, level up, earn badges, and more.

## What Was Implemented

### ✅ **Database Layer** (`/supabase/migrations/notifications_system.sql`)

**Notifications Table:**
- `id` - Unique notification ID
- `user_id` - Recipient of the notification
- `type` - Notification type (follow, power_up, level_up, etc.)
- `title` - Notification headline
- `message` - Detailed notification message
- `actor_id` - User who triggered the notification (for social notifications)
- `related_id` - ID of related entity (post_id, user_id, etc.)
- `read` - Read/unread status
- `created_at` - Timestamp

**Notification Types:**
- `follow` - New follower
- `power_up` - Someone powered up your post
- `comment` - Comment on your post (future)
- `level_up` - Reached a new level
- `rank_up` - Promoted to new rank tier
- `streak_milestone` - Posting streak milestone (5, 10, 20, 30+ days)
- `badge_earned` - Natural/Enhanced badge awarded
- `badge_under_review` - Badge flagged for review
- `system` - System announcements and XP milestones
- `weekly_recap` - Weekly summary (future)

**Automatic Database Triggers:**

1. **Follow Notification** - Automatically created when:
   - A user follows another user
   - Triggered by INSERT on `follows` table
   - Message: "{username} started following you"

2. **Power-Up Notification** - Automatically created when:
   - A user powers up a post
   - Triggered by INSERT on `power_ups` table
   - Message: "{username} powered up your post"
   - Excludes self-power-ups

**Manual Notification Functions:**

Database RPC functions for manual notification creation:
- `notify_level_up(p_user_id, p_new_level)` - Level up notification
- `notify_rank_up(p_user_id, p_new_rank)` - Rank promotion notification
- `notify_streak_milestone(p_user_id, p_streak_days)` - Streak milestones
- `notify_badge_earned(p_user_id, p_badge_type, p_verified)` - Badge notifications
- `notify_badge_under_review(p_user_id)` - Badge review warning
- `check_xp_milestone(p_user_id, p_new_xp)` - XP milestone celebrations

**Notification Settings:**

Added to `profiles` table:
- `notification_settings` JSON column with toggles:
  - `power_ups` - Power-up notifications (default: true)
  - `followers` - Follow notifications (default: true)
  - `comments` - Comment notifications (default: true)
  - `achievements` - Level/rank/badge notifications (default: true)
  - `system` - System messages (default: true)

**Performance Indexes:**
- `idx_notifications_user_id` - User's notifications lookup
- `idx_notifications_read` - Unread notifications query
- `idx_notifications_created_at` - Recent notifications sorting
- `idx_notifications_type` - Filter by notification type
- `idx_notifications_user_unread` - Composite index for unread count

### ✅ **API Layer** (`/lib/api/notifications.ts`)

Complete notification API with TypeScript types:

**Core Functions:**
```typescript
getNotifications(userId, type?, limit)        // Fetch notifications with optional filtering
getUnreadCount(userId)                        // Get count of unread notifications
markAsRead(notificationId)                    // Mark single notification as read
markAllAsRead(userId)                         // Mark all notifications as read
createNotification(userId, type, title, ...)  // Create custom notification
deleteNotification(notificationId)            // Delete a notification
```

**Settings Functions:**
```typescript
getNotificationSettings(userId)               // Get user's notification preferences
updateNotificationSettings(userId, settings)  // Update notification toggles
```

**Real-Time Subscription:**
```typescript
subscribeToNotifications(userId, callback)    // Live notification feed
// Returns Supabase channel for cleanup
// Automatically fetches actor details
// Triggers callback on new notifications
```

**Helper Functions:**
```typescript
notifyLevelUp(userId, newLevel)              // Send level up notification
notifyRankUp(userId, newRank)                // Send rank up notification
notifyStreakMilestone(userId, streakDays)    // Send streak milestone notification
notifyBadgeEarned(userId, badgeType, verified) // Send badge notification
notifyBadgeUnderReview(userId)               // Send badge review notification
checkXPMilestone(userId, newXP)              // Check and notify XP milestones
```

### ✅ **UI Components** (`/components/notifications/`)

**NotificationCard.tsx** - Individual notification display:
- Shows actor avatar or type-specific icon
- Displays notification title and message
- Shows time ago (e.g., "2h ago")
- Unread indicator (blue dot)
- Badge display if actor has verified badge
- Tap to navigate to related content:
  - Follow → Actor's profile
  - Power-up → Post detail
  - Level/Rank/Badge → User's own profile
- Visual distinction for unread notifications

**NotificationBell.tsx** - Bell icon with live unread count:
- Real-time unread count badge
- Displays count up to 99+
- Automatically updates when new notifications arrive
- Pink badge with count (#ff0080)
- Used in tab navigation
- Subscribes to real-time notifications

**EmptyNotifications.tsx** - Empty state component:
- Different messages for each tab type
- "No Notifications Yet" for all tab
- "No Social Notifications" for social tab
- "No Achievement Notifications" for achievements tab
- Helpful subtitle text explaining what will appear

### ✅ **Notifications Screen** (`/app/(tabs)/notifications.tsx`)

Complete tab-based notification interface:

**3 Tabs:**

1. **All Tab** (Default)
   - Shows all notification types
   - Mixed feed of social + achievements + system
   - Most recent first

2. **Social Tab**
   - Follows, power-ups, comments
   - Only social interactions
   - Great for community engagement

3. **Achievements Tab**
   - Level ups, rank ups, badges, streaks
   - Personal progress notifications
   - Motivational milestone tracking

**Features:**
- Pull-to-refresh to reload notifications
- Real-time updates via Supabase subscriptions
- "Mark all read" button (only shows if unread exist)
- Automatic mark as read on tap
- Loading states
- Empty states for each tab
- Smooth scrolling with FlatList
- Header with title and actions

**Navigation:**
- Accessible via bell icon in tab bar
- Tab label: "Alerts"
- Position: 4th tab (after Create, before Search)

### ✅ **XP System Integration**

Notifications automatically trigger when:

**Level Up** (`lib/api/xp.ts:304`):
- Detected in `awardXP()` function
- Calls `notifyLevelUp(userId, newLevel)`
- Message: "You reached Level {X}!"

**Rank Up** (`lib/api/xp.ts:310`):
- Detected in `awardXP()` function
- Calls `notifyRankUp(userId, newRank)`
- Message: "You are now a {Rank}!"
- Ranks: Rookie → Warrior → Titan → Superhuman → God Tier

**XP Milestones** (`lib/api/xp.ts:314`):
- Checked after every XP award
- Calls `checkXPMilestone(userId, newXP)`
- Milestones: 1,000 | 5,000 | 10,000 | 25,000 | 50,000 | 100,000 XP
- Message: "You've earned {X} total XP! 🎯"

**Streak Milestones** (`lib/api/xp.ts:183`):
- Checked in `updatePostStreak()` function
- Calls `notifyStreakMilestone(userId, streakDays)`
- Milestones: 5 | 10 | 20 | 30 | 50 | 100 | 200 | 365 days
- Message: "{X} day streak - keep it going! 🔥"

### ✅ **Badge System Integration**

Notifications trigger during badge verification:

**Badge Selection** - When user selects Natural or Enhanced:
- Calls `notifyBadgeEarned(userId, badgeType, false)`
- Message: "You selected the {Badge} badge. Complete verification to make it permanent!"

**Badge Verification** - When badge is verified:
- Calls `notifyBadgeEarned(userId, badgeType, true)`
- Message: "Your {Badge} badge has been verified!"

**Badge Under Review** - When community reports trigger review:
- Calls `notifyBadgeUnderReview(userId)`
- Message: "Your badge is currently under review due to community reports. We'll update you soon."

### ✅ **Real-Time Updates**

**Supabase Channels:**
- Subscribe to `notifications` table INSERT events
- Filter by `user_id=eq.{userId}`
- Automatically fetch actor profile details
- Trigger callback with complete notification object
- Used in:
  - NotificationBell component (unread count updates)
  - Notifications screen (live feed updates)

**Subscription Cleanup:**
- Components unsubscribe on unmount
- Prevents memory leaks
- Channel cleanup handled by React useEffect

## Notification Flow Examples

### Follow Notification
```
1. User A follows User B
2. Database trigger fires on follows table INSERT
3. create_follow_notification() executes
4. Notification created for User B
5. Real-time event sent to User B's subscribed clients
6. NotificationBell badge increments
7. User B taps bell icon → sees "User A started following you"
8. Taps notification → navigates to User A's profile
```

### Level Up Notification
```
1. User posts a photo
2. awardPostXP() called
3. User gains 150 XP
4. checkLevelUp() detects Level 5 → Level 6
5. notifyLevelUp(userId, 6) called
6. Database function creates notification
7. Real-time event fires
8. User sees "Level Up! You reached Level 6!"
9. Taps notification → goes to own profile
```

### Power-Up Notification
```
1. User A powers up User B's post
2. Database trigger fires on power_ups table INSERT
3. create_power_up_notification() executes
4. Notification created for User B (post owner)
5. Message: "User A powered up your post"
6. Real-time event sent to User B
7. User B taps notification → navigates to post detail
```

## Notification Settings

Users can control which notifications they receive:

**Default Settings:**
```json
{
  "power_ups": true,
  "followers": true,
  "comments": true,
  "achievements": true,
  "system": true
}
```

**To Update Settings:**
```typescript
import { updateNotificationSettings } from '@/lib/api/notifications';

// Disable power-up notifications
await updateNotificationSettings(userId, {
  power_ups: false
});
```

**Future Settings Screen:**
- Toggle switches for each category
- "Mute all" option
- Push notification toggles (when implemented)
- Email notification preferences

## Files Created

```
/supabase/migrations/notifications_system.sql
/lib/api/notifications.ts
/components/notifications/NotificationCard.tsx
/components/notifications/NotificationBell.tsx
/components/notifications/EmptyNotifications.tsx
/app/(tabs)/notifications.tsx
/NOTIFICATIONS_SYSTEM.md (this file)
```

## Files Modified

```
/lib/api/index.ts - Added notifications export
/lib/api/xp.ts - Added notification calls for level/rank/streak/XP milestones
/app/(tabs)/_layout.tsx - Added notifications tab with bell icon
```

## Testing Checklist

### Setup
- [ ] Run SQL migration in Supabase SQL Editor
- [ ] Verify `notifications` table created
- [ ] Check database triggers exist
- [ ] Confirm indexes created

### Navigation
- [ ] See bell icon (🔔) in bottom tab bar
- [ ] Tab labeled "Alerts"
- [ ] Tap bell → navigates to notifications screen
- [ ] See 3 tabs: All, Social, Achievements

### Follow Notifications
- [ ] User A follows User B
- [ ] User B receives notification immediately
- [ ] Notification shows User A's avatar
- [ ] Message: "{username} started following you"
- [ ] Tap notification → goes to User A's profile
- [ ] Notification marked as read after tap

### Power-Up Notifications
- [ ] User A powers up User B's post
- [ ] User B receives notification
- [ ] Message: "{username} powered up your post"
- [ ] Tap notification → goes to post detail
- [ ] User powering up own post → no notification

### Level Up Notifications
- [ ] User gains enough XP to level up
- [ ] Notification appears: "Level Up!"
- [ ] Shows new level number
- [ ] Tap → goes to own profile

### Rank Up Notifications
- [ ] User reaches rank threshold
- [ ] Notification appears: "Rank Up!"
- [ ] Shows new rank tier (Warrior, Titan, etc.)
- [ ] Tap → goes to own profile

### Streak Milestone Notifications
- [ ] User posts for 5 consecutive days
- [ ] Notification: "5 day streak - keep it going! 🔥"
- [ ] Also triggers at 10, 20, 30, 50, 100, 200, 365 days

### XP Milestone Notifications
- [ ] User reaches 1,000 total XP
- [ ] Notification: "You've earned 1,000 total XP! 🎯"
- [ ] Also triggers at 5K, 10K, 25K, 50K, 100K XP

### Badge Notifications
- [ ] User selects Natural badge
- [ ] Notification: "You selected the Natural badge..."
- [ ] After verification, new notification
- [ ] If reported, "under review" notification

### Real-Time Updates
- [ ] Open notifications screen
- [ ] Another user follows you (test with 2 accounts)
- [ ] New notification appears instantly
- [ ] Bell badge count increments
- [ ] No need to refresh

### Unread Count
- [ ] Bell shows no badge when all read
- [ ] New notification → badge appears with count
- [ ] Badge shows "99+" if count > 99
- [ ] Tap notification → count decrements
- [ ] "Mark all read" → badge disappears

### Tab Filtering
- [ ] All tab shows all notification types
- [ ] Social tab shows only follows, power-ups, comments
- [ ] Achievements tab shows only level/rank/badge/streak
- [ ] Empty states show for tabs with no notifications

### Pull-to-Refresh
- [ ] Pull down on notifications list
- [ ] Loading spinner appears
- [ ] List refreshes with latest notifications
- [ ] Works on all tabs

### Navigation
- [ ] Tap follow notification → user profile loads
- [ ] Tap power-up notification → post detail loads
- [ ] Tap achievement notification → own profile loads
- [ ] Back button returns to notifications

## Performance Metrics

**Target Performance:**
- Notification creation: <100ms
- Real-time delivery: <500ms
- Unread count query: <50ms
- Notification list load: <300ms
- Mark as read: <100ms

**Database Optimization:**
- All critical fields indexed
- Composite index for unread queries
- Efficient real-time filtering
- Automatic cleanup recommended (archive old notifications after 90 days)

## Future Enhancements

### Push Notifications
- [ ] Expo push notifications integration
- [ ] Save push tokens to profiles.push_token
- [ ] Send notifications even when app is closed
- [ ] Notification permissions request
- [ ] Deep linking from push notifications

### Advanced Features
- [ ] Notification grouping ("User A and 5 others followed you")
- [ ] Comment notifications (when comments system is built)
- [ ] Weekly recap notifications
- [ ] Achievement unlock animations
- [ ] Notification sounds/haptics
- [ ] In-app notification toasts
- [ ] Notification history archive
- [ ] Bulk actions (delete all, mark all unread)
- [ ] Notification preferences per category

### Analytics
- [ ] Track notification open rates
- [ ] Most engaging notification types
- [ ] Optimal notification timing
- [ ] User engagement metrics

## Important Notes

1. **Real-time subscriptions are automatic** - No manual setup needed, components handle it
2. **Database triggers are passive** - Notifications created automatically on follows/power-ups
3. **Manual triggers for achievements** - XP system calls notification functions directly
4. **Unread count is live** - Bell badge updates instantly via real-time subscription
5. **Navigation is context-aware** - Each notification type navigates to relevant screen
6. **Settings are future-ready** - Infrastructure in place for granular control
7. **Performance is optimized** - Indexed queries and efficient real-time filtering

## Troubleshooting

**Notifications not appearing:**
- Check Supabase SQL migration ran successfully
- Verify database triggers exist
- Ensure user is authenticated
- Check real-time subscription in network tab

**Bell count not updating:**
- Verify NotificationBell component is subscribed
- Check user ID is correct
- Look for subscription errors in console

**Notifications not marked as read:**
- Verify markAsRead function is called on tap
- Check notification ID is valid
- Ensure database UPDATE permissions exist

**Real-time not working:**
- Confirm Supabase Realtime is enabled
- Check channel subscription status
- Verify filter matches user ID format
- Look for WebSocket connection in network tab

---

**Built for engagement and motivation.**
**SAYN - Stay Connected**
