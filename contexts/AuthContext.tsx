import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/supabase-auth';

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
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Initialize auth state
  useEffect(() => {
    console.log('🔧 AuthContext: Initializing...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔑 AuthContext: Session check complete');

      if (session?.user) {
        console.log('✅ AuthContext: Found existing session for user:', session.user.id);
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => {
          console.log('✅ AuthContext: Profile loaded, ready');
          setLoading(false);
        });
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
    } = supabase.auth.onAuthStateChange((event, session) => {
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
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      console.log('🔧 AuthContext: Cleanup - Unsubscribing from auth changes');
      subscription.unsubscribe();
    };
  }, []);

  // Sign out
  const signOut = async () => {
    console.log('🚪 AuthContext: Signing out...');
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
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
    loading,
    signOut,
    refreshProfile,
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
