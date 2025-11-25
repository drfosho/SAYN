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
  badge_verified: boolean;
  badge_application_date: string | null;
  badge_verification_date: string | null;
  badge_questionnaire_data: Record<string, any> | null;
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
  post_type: 'daily_check_in' | 'progress_update' | 'peak_condition' | 'just_sharing' | null;
  verification_status: 'verified' | 'not_verified' | null;
  verification_requested: boolean;
  verification_confidence: number | null;
  verification_details: Record<string, any> | null;
  comparison_enabled: boolean;
  comparison_previous_post_id: string | null;
  comparison_feedback: string | null;
  text_category: string | null;
  power_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
  user_has_powered?: boolean;
  comparison_previous_post?: Post; // Joined previous post for comparisons
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
  username?: string;
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
  post_type?: 'daily_check_in' | 'progress_update' | 'peak_condition' | 'just_sharing';
  verification_requested?: boolean;
  comparison_enabled?: boolean;
  comparison_previous_post_id?: string;
  comparison_feedback?: string;
  text_category?: string;
}

export interface PostUpdate {
  caption?: string;
  verification_requested?: boolean;
  verification_status?: 'verified' | 'not_verified' | null;
  verification_confidence?: number | null;
  verification_details?: Record<string, any> | null;
  comparison_enabled?: boolean;
  comparison_previous_post_id?: string;
  comparison_feedback?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  text: string;
  power_count: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  // Joined data
  profiles?: Profile;
  user_has_powered?: boolean;
  replies?: Comment[]; // Nested replies
  reply_count?: number;
}

export interface CommentPowerUp {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentCreate {
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  text: string;
}

export interface CommentUpdate {
  text: string;
}
