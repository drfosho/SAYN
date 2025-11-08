import { supabase } from './supabase';
import { Alert } from 'react-native';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ProfileSetupData {
  username: string;
  displayName?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  fitnessGoals?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  athleteType?: 'natural' | 'enhanced' | 'prefer_not_to_say' | null;
}

// Sign up a new user
export async function signUp(data: SignUpData) {
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
        },
      },
    });

    if (signUpError) throw signUpError;

    return { data: authData, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { data: null, error: error.message };
  }
}

// Log in an existing user
export async function login(data: LoginData) {
  try {
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (loginError) throw loginError;

    return { data: authData, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    return { data: null, error: error.message };
  }
}

// Log out current user
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { error: error.message };
  }
}

// Send password reset email
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'sayn://reset-password',
    });

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { error: error.message };
  }
}

// Update user password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error('Update password error:', error);
    return { error: error.message };
  }
}

// Get current session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    console.error('Get session error:', error);
    return { session: null, error: error.message };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return { user: null, error: error.message };
  }
}

// Check if username is available
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned - username is available
      console.log(`✅ Username "${username}" is available`);
      return true;
    }

    if (error) {
      // If table doesn't exist or other database error, assume username is available
      // This allows testing before database setup
      console.warn(`⚠️ Username check skipped - database not set up yet. Allowing "${username}"`);
      console.warn('Run SQL scripts in SUPABASE_SETUP.md to enable username checking');
      return true;
    }

    // Username exists
    console.log(`❌ Username "${username}" is already taken`);
    return false;
  } catch (error: any) {
    console.error('Check username error:', error);
    // On any error (like table not existing), assume available for testing
    console.warn(`⚠️ Username check failed - allowing "${username}" for testing`);
    return true;
  }
}

// Create user profile after signup
export async function createUserProfile(userId: string, profileData: ProfileSetupData) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          username: profileData.username,
          display_name: profileData.displayName || profileData.username,
          bio: profileData.bio || '',
          location: profileData.location || '',
          avatar_url: profileData.avatarUrl || '',
          fitness_goals: profileData.fitnessGoals || [],
          experience_level: profileData.experienceLevel || 'beginner',
          athlete_type: profileData.athleteType || null,
          level: 1,
          xp: 0,
          total_power_ups: 0,
          streak_days: 0,
          badge: null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Create profile error:', error);
      // If table doesn't exist, log warning but don't fail
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.warn('⚠️ Database tables not set up yet. Run the SQL scripts in SUPABASE_SETUP.md');
        // Return mock success for testing
        return {
          data: { id: userId, username: profileData.username, ...profileData },
          error: null
        };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Create profile error:', error);
    return { data: null, error: error.message };
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If table doesn't exist, return null (will trigger onboarding)
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.warn('⚠️ Database tables not set up yet. Profile will be null.');
        return { data: null, error: null };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get profile error:', error);
    return { data: null, error: error.message };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<ProfileSetupData>) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        display_name: updates.displayName,
        bio: updates.bio,
        location: updates.location,
        avatar_url: updates.avatarUrl,
        fitness_goals: updates.fitnessGoals,
        experience_level: updates.experienceLevel,
        athlete_type: updates.athleteType,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { data: null, error: error.message };
  }
}

// Delete user account
export async function deleteAccount() {
  try {
    // This requires RLS policies and potentially a database function
    // For now, we'll just sign out and let the backend handle cleanup
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    Alert.alert(
      'Account Deletion',
      'Please contact support to complete account deletion. You have been logged out.',
    );

    return { error: null };
  } catch (error: any) {
    console.error('Delete account error:', error);
    return { error: error.message };
  }
}

// Password validation
export function validatePassword(password: string): {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
  };
} {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isValid = requirements.minLength && requirements.hasUppercase && requirements.hasNumber;

  return { isValid, requirements };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Username validation
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or less' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
}
