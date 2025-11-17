// Badge Verification API for SAYN
import { supabase } from '@/lib/supabase';
import { ApiResponse } from './types';

export type BadgeType = 'natural' | 'enhanced';

export interface BadgeEligibility {
  eligible: boolean;
  badge_type: BadgeType;
  requirements: Record<string, RequirementStatus>;
  stats: BadgeStats;
}

export interface RequirementStatus {
  required: string | number;
  current: string | number;
  met: boolean;
}

export interface BadgeStats {
  account_age_days: number;
  total_posts: number;
  verified_posts: number;
  verification_rate: number;
  post_streak: number;
  report_count: number;
}

export interface BadgeApplication {
  id: string;
  user_id: string;
  badge_type_requested: BadgeType;
  questionnaire_data: Record<string, any> | null;
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface BadgeQuestionnaireData {
  // Natural badge questions
  training_years?: string;
  training_focus?: string[];
  has_coach?: boolean;
  coach_id?: string;

  // Enhanced badge questions (encrypted)
  enhanced_years?: string;
  primary_compounds?: string;
  medical_supervision?: boolean;
  transparency_reason?: string;
}

/**
 * Check if user meets badge eligibility requirements
 */
export async function checkBadgeEligibility(
  userId: string,
  badgeType: BadgeType
): Promise<ApiResponse<BadgeEligibility>> {
  try {
    const { data, error } = await supabase.rpc('check_badge_eligibility', {
      p_user_id: userId,
      p_badge_type: badgeType,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Check badge eligibility error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Submit badge application
 */
export async function applyForBadge(
  userId: string,
  badgeType: BadgeType,
  questionnaireData?: BadgeQuestionnaireData
): Promise<ApiResponse<{ application: BadgeApplication; autoApproved: boolean }>> {
  try {
    // First check eligibility
    const eligibilityResult = await checkBadgeEligibility(userId, badgeType);

    if (eligibilityResult.error || !eligibilityResult.data) {
      return {
        data: null,
        error: eligibilityResult.error || 'Failed to check eligibility',
      };
    }

    if (!eligibilityResult.data.eligible) {
      return {
        data: null,
        error: 'You do not meet the requirements for this badge yet',
      };
    }

    // Create application
    const { data: application, error: appError } = await supabase
      .from('badge_applications')
      .insert({
        user_id: userId,
        badge_type_requested: badgeType,
        questionnaire_data: questionnaireData || null,
        status: 'pending',
      })
      .select()
      .single();

    if (appError) throw appError;

    // Update profile with pending status
    await supabase
      .from('profiles')
      .update({
        badge_type: badgeType,
        badge_application_date: new Date().toISOString(),
      })
      .eq('id', userId);

    // Check if auto-approve criteria met
    const { data: autoApproved, error: autoError } = await supabase.rpc(
      'auto_approve_badge_if_eligible',
      {
        p_user_id: userId,
        p_badge_type: badgeType,
        p_application_id: application.id,
      }
    );

    if (autoError) {
      console.error('Auto-approve check error:', autoError);
    }

    return {
      data: {
        application: application as BadgeApplication,
        autoApproved: autoApproved === true,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Apply for badge error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get user's badge application status
 */
export async function getBadgeApplicationStatus(
  userId: string
): Promise<ApiResponse<BadgeApplication | null>> {
  try {
    const { data, error } = await supabase
      .from('badge_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { data: data as BadgeApplication | null, error: null };
  } catch (error: any) {
    console.error('Get badge application status error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Report a user for fake natural claim or misleading content
 */
export async function reportBadgeIssue(
  reporterId: string,
  reportedUserId: string,
  reportType: 'fake_natural' | 'misleading' | 'other',
  reason: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.from('badge_reports').insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      report_type: reportType,
      reason,
      status: 'pending',
    });

    if (error) throw error;

    // Check if user has reached report threshold (5 reports)
    const { count } = await supabase
      .from('badge_reports')
      .select('*', { count: 'exact', head: true })
      .eq('reported_user_id', reportedUserId)
      .eq('status', 'pending');

    // If 5+ reports, set badge to under_review
    if (count && count >= 5) {
      await supabase
        .from('profiles')
        .update({ badge_type: 'under_review', badge_verified: false })
        .eq('id', reportedUserId);
    }

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Report badge issue error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get count of pending reports for a user
 */
export async function getUserReportCount(
  userId: string
): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('badge_reports')
      .select('*', { count: 'exact', head: true })
      .eq('reported_user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error: any) {
    console.error('Get user report count error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Remove/revoke a user's badge
 */
export async function revokeBadge(userId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        badge_type: null,
        badge_verified: false,
        badge_verification_date: null,
      })
      .eq('id', userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Revoke badge error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Change badge type (requires re-verification)
 */
export async function changeBadgeType(
  userId: string,
  newBadgeType: BadgeType
): Promise<ApiResponse<boolean>> {
  try {
    // Set badge to unverified and update type
    const { error } = await supabase
      .from('profiles')
      .update({
        badge_type: newBadgeType,
        badge_verified: false,
        badge_verification_date: null,
      })
      .eq('id', userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Change badge type error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get badge info for display
 */
export async function getBadgeInfo(userId: string): Promise<
  ApiResponse<{
    badge_type: BadgeType | 'under_review' | null;
    badge_verified: boolean;
    badge_verification_date: string | null;
    account_age_days: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('badge_type, badge_verified, badge_verification_date, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const accountAgeDays = Math.floor(
      (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      data: {
        badge_type: data.badge_type as BadgeType | 'under_review' | null,
        badge_verified: data.badge_verified || false,
        badge_verification_date: data.badge_verification_date,
        account_age_days: accountAgeDays,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Get badge info error:', error);
    return { data: null, error: error.message };
  }
}
