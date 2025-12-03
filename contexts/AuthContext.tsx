import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/supabase-auth';
import { recordDailyLogin, StreakData } from '@/lib/api/streaks';
import { initializeDailyChallenges } from '@/lib/api/challenges';
import {
  shouldShowWeeklyRecap,
  hasUnviewedRecap,
  generateWeeklyRecap,
} from '@/lib/api/weeklyRecap';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string;
  fitness_goals: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  athlete_type: 'natural' | 'enhanced' | 'prefer_not_to_say' | null;
  level: number;
  xp: number;
  total_power_ups: number;
  streak_days: number;
  badge: 'natural' | 'enhanced' | 'under_review' | null;
  created_at: string;
  followers_count?: number;
  following_count?: number;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  streakData: StreakData | null;
  hasUnviewedWeeklyRecap: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshStreakData: () => Promise<void>;
  checkWeeklyRecap: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  streakData: null,
  hasUnviewedWeeklyRecap: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshStreakData: async () => {},
  checkWeeklyRecap: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [hasUnviewedWeeklyRecap, setHasUnviewedWeeklyRecap] = useState(false);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const lastLoginDate = useRef<string | null>(null);
  const lastRecapCheck = useRef<string | null>(null);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    const { data, error } = await getUserProfile(userId);
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    setProfile(data);
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Record daily login and update streak
  const recordLogin = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Only record login once per day
    if (lastLoginDate.current === today) {
      return;
    }

    console.log('📅 Recording daily login...');
    const result = await recordDailyLogin(userId);

    if (result.success && result.streakData) {
      setStreakData(result.streakData);
      lastLoginDate.current = today;

      if (result.milestoneAchieved) {
        console.log(`🏆 Streak milestone achieved: ${result.milestoneAchieved.label}`);
      }
    }

    // Initialize daily challenges
    await initializeDailyChallenges(userId);
  };

  // Refresh streak data
  const refreshStreakData = async () => {
    if (user) {
      const { getUserStreakData } = await import('@/lib/api/streaks');
      const data = await getUserStreakData(user.id);
      if (data) {
        setStreakData(data);
      }
    }
  };

  // Check for weekly recap (internal helper that takes userId)
  const checkWeeklyRecapForUser = async (userId: string): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];

    // Only check once per day
    if (lastRecapCheck.current === today) {
      return hasUnviewedWeeklyRecap;
    }

    try {
      // Check if it's Monday (day to show recap)
      if (shouldShowWeeklyRecap()) {
        // Generate recap if needed (will not duplicate)
        await generateWeeklyRecap(userId);
      }

      // Check for unviewed recaps
      const hasUnviewed = await hasUnviewedRecap(userId);
      setHasUnviewedWeeklyRecap(hasUnviewed);
      lastRecapCheck.current = today;

      if (hasUnviewed) {
        console.log('📊 User has unviewed weekly recap');
      }

      return hasUnviewed;
    } catch (error) {
      console.error('Error checking weekly recap:', error);
      return false;
    }
  };

  // Public check function that uses current user
  const checkWeeklyRecap = async (): Promise<boolean> => {
    if (!user) return false;
    return checkWeeklyRecapForUser(user.id);
  };

  // Initialize auth state
  useEffect(() => {
    console.log('🔧 AuthContext: Initializing...');

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔑 AuthContext: Session check complete');

      if (session?.user) {
        console.log('✅ AuthContext: Found existing session for user:', session.user.id);
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
        // Record daily login
        await recordLogin(session.user.id);
        // Check for weekly recap
        await checkWeeklyRecapForUser(session.user.id);
        console.log('✅ AuthContext: Profile loaded, ready');
        setLoading(false);
      } else {
        console.log('❌ AuthContext: No existing session found');
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Auth state changed -', event);

      if (event === 'SIGNED_IN') {
        console.log('✅ AuthContext: User signed in:', session?.user?.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 AuthContext: User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 AuthContext: Token refreshed');
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
        // Record login on sign in
        if (event === 'SIGNED_IN') {
          await recordLogin(session.user.id);
        }
      } else {
        setProfile(null);
        setStreakData(null);
      }
    });

    return () => {
      console.log('🔧 AuthContext: Cleanup - Unsubscribing from auth changes');
      subscription.unsubscribe();
    };
  }, []);

  // Listen for app state changes to record login when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        user
      ) {
        console.log('📱 App came to foreground, checking daily login...');
        await recordLogin(user.id);
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Sign out
  const signOut = async () => {
    console.log('🚪 AuthContext: Signing out...');
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setStreakData(null);
      setHasUnviewedWeeklyRecap(false);
      lastLoginDate.current = null;
      lastRecapCheck.current = null;
      console.log('✅ AuthContext: Sign out successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Sign out error:', error.message);
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile,
    streakData,
    hasUnviewedWeeklyRecap,
    loading,
    signOut,
    refreshProfile,
    refreshStreakData,
    checkWeeklyRecap,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
