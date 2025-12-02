import { supabase } from '../supabase';

export interface VerificationStats {
  total_posts: number;
  verified_posts: number;
  verification_rate: number;
  account_age_days: number;
  first_post_date: string | null;
  report_count: number;
}

export interface BadgeApplication {
  id: string;
  user_id: string;
  badge_type_requested: 'natural' | 'enhanced';
  questionnaire_data?: any;
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

export interface BadgeReport {
  id: string;
  reported_user_id: string;
  reporter_user_id: string;
  report_type: 'fake_natty' | 'misleading_content' | 'dishonest_enhanced';
  reason?: string;
  evidence_post_ids?: string[];
  status: 'pending' | 'reviewed' | 'dismissed' | 'upheld';
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

/**
 * Get user's verification stats for badge application
 * Falls back to calculating from posts table if RPC function doesn't exist
 */
export const getUserVerificationStats = async (userId: string): Promise<{
  data: VerificationStats | null;
  error: string | null;
}> => {
  try {
    // Try RPC function first
    const { data, error } = await supabase.rpc('get_user_verification_stats', {
      p_user_id: userId,
    });

    if (!error && data) {
      return { data: data as VerificationStats, error: null };
    }

    // Fallback: Calculate stats manually from posts and profile
    console.log('RPC not available, calculating stats manually');

    // Get profile creation date
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    // Get posts data
    const { data: posts } = await supabase
      .from('posts')
      .select('verification_status, verification_requested, created_at')
      .eq('user_id', userId);

    const totalPosts = posts?.length || 0;
    const verifiedPosts = posts?.filter(p => p.verification_status === 'verified').length || 0;
    const requestedVerification = posts?.filter(p => p.verification_requested === true).length || 0;
    const verificationRate = requestedVerification > 0
      ? Math.round((verifiedPosts / requestedVerification) * 100 * 10) / 10
      : 0;

    const accountAgeDays = profile?.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const firstPostDate = posts && posts.length > 0
      ? posts.reduce((earliest, p) =>
          new Date(p.created_at) < new Date(earliest) ? p.created_at : earliest,
          posts[0].created_at
        )
      : null;

    const stats: VerificationStats = {
      total_posts: totalPosts,
      verified_posts: verifiedPosts,
      verification_rate: verificationRate,
      account_age_days: accountAgeDays,
      first_post_date: firstPostDate,
      report_count: 0, // Can't calculate without badge_reports table
    };

    return { data: stats, error: null };
  } catch (err: any) {
    console.error('Exception fetching verification stats:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Get user's badge application status
 * Returns null if the badge_applications table doesn't exist yet
 */
export const getBadgeApplication = async (userId: string): Promise<{
  data: BadgeApplication | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('badge_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Handle table doesn't exist or no rows
    if (error) {
      // 42703 = column doesn't exist, 42P01 = table doesn't exist, PGRST116 = no rows
      if (error.code === '42703' || error.code === '42P01' || error.code === 'PGRST116') {
        // Table doesn't exist yet or no applications - this is expected
        return { data: null, error: null };
      }
      console.error('Error fetching badge application:', error);
      return { data: null, error: error.message };
    }

    return { data: data as BadgeApplication | null, error: null };
  } catch (err: any) {
    console.error('Exception fetching badge application:', err);
    // Return null instead of error for missing table scenario
    return { data: null, error: null };
  }
};

/**
 * Submit a badge application
 * Note: Requires the badge_applications table to exist in Supabase
 */
export const submitBadgeApplication = async (
  userId: string,
  badgeType: 'natural' | 'enhanced',
  additionalData: {
    training_duration?: string;
    self_disclosed?: boolean;
    transparency_statement?: string;
  },
  requirementsSnapshot: VerificationStats
): Promise<{
  data: BadgeApplication | null;
  error: string | null;
}> => {
  try {
    // Create application - using questionnaire_data to store additional info
    const { data: application, error: applicationError } = await supabase
      .from('badge_applications')
      .insert({
        user_id: userId,
        badge_type_requested: badgeType,
        questionnaire_data: {
          training_duration: additionalData.training_duration,
          self_disclosed: additionalData.self_disclosed,
          transparency_statement: additionalData.transparency_statement,
          requirements_snapshot: requirementsSnapshot,
        },
        status: 'pending',
      })
      .select()
      .single();

    if (applicationError) {
      // Check if table doesn't exist
      if (applicationError.code === '42P01' || applicationError.code === '42703') {
        return {
          data: null,
          error: 'Badge verification system is not yet set up. Please run the database migration.',
        };
      }
      console.error('Error creating badge application:', applicationError);
      return { data: null, error: applicationError.message };
    }

    // Update profile status (only if badge_application_status column exists)
    try {
      await supabase
        .from('profiles')
        .update({
          badge_application_status: `pending_${badgeType}`,
          badge_application_date: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (profileErr) {
      // Ignore profile update errors - column might not exist yet
      console.log('Could not update profile badge status - column may not exist');
    }

    return { data: application as BadgeApplication, error: null };
  } catch (err: any) {
    console.error('Exception submitting badge application:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Submit a badge report against a user
 */
export const submitBadgeReport = async (
  reporterUserId: string,
  reportedUserId: string,
  reportType: 'fake_natty' | 'misleading_content' | 'dishonest_enhanced',
  reason?: string,
  evidencePostIds?: string[]
): Promise<{
  data: BadgeReport | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('badge_reports')
      .insert({
        reported_user_id: reportedUserId,
        reporter_user_id: reporterUserId,
        report_type: reportType,
        reason,
        evidence_post_ids: evidencePostIds,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting badge report:', error);
      return { data: null, error: error.message };
    }

    return { data: data as BadgeReport, error: null };
  } catch (err: any) {
    console.error('Exception submitting badge report:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Check if requirements are met for Natural badge
 */
export const checkNaturalRequirements = (stats: VerificationStats): {
  accountAge: boolean;
  verifiedPosts: boolean;
  verificationRate: boolean;
  noReports: boolean;
  allMet: boolean;
} => {
  const accountAge = stats.account_age_days >= 30;
  const verifiedPosts = stats.verified_posts >= 10;
  const verificationRate = stats.verification_rate >= 70;
  const noReports = stats.report_count === 0;

  return {
    accountAge,
    verifiedPosts,
    verificationRate,
    noReports,
    allMet: accountAge && verifiedPosts && verificationRate && noReports,
  };
};

/**
 * Check if requirements are met for Enhanced badge
 */
export const checkEnhancedRequirements = (stats: VerificationStats): {
  accountAge: boolean;
  verifiedPosts: boolean;
  allMet: boolean;
} => {
  const accountAge = stats.account_age_days >= 14; // Shorter requirement for Enhanced
  const verifiedPosts = stats.verified_posts >= 3; // Lower bar for Enhanced

  return {
    accountAge,
    verifiedPosts,
    allMet: accountAge && verifiedPosts,
  };
};
