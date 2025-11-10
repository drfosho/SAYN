// Database types for Supabase tables

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  rank: string;
  level: number;
  xp: number;
  power_points: number;
  streak_days: number;
  badge_type: 'natural' | 'enhanced' | 'under_review' | null;
  is_verified_coach: boolean;
  fitness_goals: string[] | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  verification_requested: boolean;
  power_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
  user_has_powered?: boolean;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PowerUp {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  earned_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Update types
export interface ProfileUpdate {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  fitness_goals?: string[];
  experience_level?: string;
  badge_type?: 'natural' | 'enhanced' | 'under_review' | null;
}

export interface PostCreate {
  user_id: string;
  image_url?: string;
  caption?: string;
  verification_requested?: boolean;
}

export interface PostUpdate {
  caption?: string;
  verification_requested?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected' | null;
}
