# Persistent Login Implementation

## Overview
Users now stay logged in when they close and reopen the app. Session persistence is handled automatically by Supabase with AsyncStorage.

## How It Works

### 1. Session Storage
**File: `lib/supabase.ts`**

Sessions are stored in AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Persists sessions locally
    autoRefreshToken: true, // Auto-refresh expired tokens
    persistSession: true,   // Keep session across app restarts
  },
});
```

### 2. Auth State Management
**File: `contexts/AuthContext.tsx`**

On app launch, the AuthContext:
1. Checks for existing session using `supabase.auth.getSession()`
2. If session exists: Loads user profile and sets authenticated state
3. If no session: Sets unauthenticated state
4. Listens for auth state changes (login, logout, token refresh)

### 3. Initial Route Decision
**File: `app/index.tsx`**

The index screen checks auth state and routes users:

```typescript
if (!user) {
  // Not authenticated → Go to welcome screen
  router.replace('/auth/welcome');
} else if (user && !profile) {
  // Authenticated but no profile → Go to onboarding
  router.replace('/onboarding/profile-setup');
} else {
  // Authenticated with profile → Go to feed
  router.replace('/(tabs)');
}
```

### 4. Auth State Events

The app listens for these auth events:

- **SIGNED_IN**: User logs in → Load profile, navigate to feed
- **SIGNED_OUT**: User logs out → Clear state, navigate to welcome
- **TOKEN_REFRESHED**: Session token refreshed → Continue seamlessly
- **INITIAL_SESSION**: Existing session found → Restore user state

## User Experience Flow

### First Time User
1. Opens app → Sees loading screen
2. No session found → Redirected to welcome screen
3. Signs up → Session created and stored in AsyncStorage
4. Completes onboarding → Profile created
5. Navigated to feed

### Returning User (App Closed & Reopened)
1. Opens app → Sees loading screen
2. Session check runs in background
3. Session found → User state restored
4. Profile loaded → Navigated directly to feed
5. **No login required!**

### User Logs Out
1. User goes to Settings → Logs out
2. `supabase.auth.signOut()` called
3. Session cleared from AsyncStorage
4. State cleared in AuthContext
5. Navigated to welcome screen
6. Next time they open app → Must log in again

## Console Logs to Monitor

### On App Launch
```
🔧 AuthContext: Initializing...
🔑 AuthContext: Session check complete
✅ AuthContext: Found existing session for user: [user-id]
✅ AuthContext: Profile loaded, ready
🔐 Auth Check - Loading: false | User: [user-id] | Profile: [username]
✅ User authenticated with profile - Redirecting to feed
👤 Welcome back, [username]
```

### When Logging Out
```
🚪 User initiated logout from settings
🚪 AuthContext: Signing out...
✅ AuthContext: Sign out successful
🔔 AuthContext: Auth state changed - SIGNED_OUT
👋 AuthContext: User signed out
✅ Logout successful - Redirecting to welcome screen
```

### Token Refresh (Automatic)
```
🔔 AuthContext: Auth state changed - TOKEN_REFRESHED
🔄 AuthContext: Token refreshed
```

## Testing Checklist

### Test 1: Fresh Install
- [ ] Install app on device/simulator
- [ ] Should see welcome screen (not logged in)
- [ ] Create account
- [ ] Complete onboarding
- [ ] See feed

### Test 2: App Restart (Logged In)
- [ ] With user logged in, completely close app
- [ ] Reopen app
- [ ] Should see loading screen briefly
- [ ] Should go directly to feed (not login screen)
- [ ] User data should be loaded

### Test 3: Logout
- [ ] From feed, go to Settings
- [ ] Tap "Log Out"
- [ ] Confirm logout
- [ ] Should see welcome screen
- [ ] Close and reopen app
- [ ] Should still see welcome screen (not logged in)

### Test 4: Token Refresh
- [ ] Log in and stay in app for 1+ hour
- [ ] Session token should auto-refresh
- [ ] No interruption in user experience
- [ ] Check console for "TOKEN_REFRESHED" event

### Test 5: Multiple Devices
- [ ] Log in on Device A
- [ ] Log in on Device B (same account)
- [ ] Both devices should work independently
- [ ] Logout on Device A
- [ ] Device B should remain logged in

## Troubleshooting

### User Gets Logged Out Unexpectedly

**Check:**
1. Is AsyncStorage installed? (`@react-native-async-storage/async-storage`)
2. Is AsyncStorage configured in `lib/supabase.ts`?
3. Check console for session errors
4. Verify Supabase project settings (session timeout)

**Solution:**
- Default session timeout is 1 week
- Token auto-refresh happens before expiration
- If session expires, user must log in again

### App Always Shows Welcome Screen

**Check:**
1. Console logs - Is session being found?
2. Is profile being loaded successfully?
3. Network connectivity on device

**Solution:**
```
🔧 AuthContext: Initializing...
🔑 AuthContext: Session check complete
❌ AuthContext: No existing session found
```
If you see "No existing session found" but user should be logged in:
- Check if signOut() was called unexpectedly
- Verify AsyncStorage is working
- Check Supabase dashboard for active sessions

### Session Not Persisting Between Restarts

**Check:**
1. Verify AsyncStorage configuration in `lib/supabase.ts`
2. Check device/simulator storage permissions
3. Check for errors in console during session save

**Solution:**
- Ensure `persistSession: true` in Supabase config
- Reinstall app if storage is corrupted
- Clear app data and test fresh

## Security Notes

✅ **Secure:**
- Session tokens stored securely in AsyncStorage
- Tokens are encrypted by Supabase
- Auto-refresh prevents expired tokens
- Logout properly clears all session data

⚠️ **Important:**
- Don't log session tokens to console in production
- AsyncStorage is secure but not encrypted on all platforms
- For high-security apps, consider additional encryption
- Users can clear app data to force logout

## Additional Features

### Custom Session Timeout
To change session timeout, update Supabase project settings:
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Update "JWT expiry limit"
4. Default: 604800 seconds (7 days)

### Force Re-login
To force users to re-login:
```typescript
await supabase.auth.signOut();
router.replace('/auth/login');
```

### Check Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  console.log('Session expires:', new Date(session.expires_at * 1000));
}
```

## Summary

✅ **Persistent login is fully implemented**
✅ **Sessions stored in AsyncStorage**
✅ **Auto-refresh prevents expiration**
✅ **Returning users skip login screen**
✅ **Comprehensive logging for debugging**
✅ **Secure logout clears all data**

Users will stay logged in across app restarts until they explicitly log out or their session expires (7 days by default).
