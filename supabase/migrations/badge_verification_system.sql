-- BADGE VERIFICATION SYSTEM
-- Add badge verification columns and tables to enable permanent badge verification

-- Add verification columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS badge_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badge_application_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS badge_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS badge_questionnaire_data JSON;

-- Create badge_applications table for tracking verification requests
CREATE TABLE IF NOT EXISTS badge_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type_requested TEXT NOT NULL CHECK (badge_type_requested IN ('natural', 'enhanced')),
  questionnaire_data JSON,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, badge_type_requested, created_at)
);

-- Create badge_reports table for community reporting
CREATE TABLE IF NOT EXISTS badge_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('fake_natural', 'misleading', 'other')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  UNIQUE(reporter_id, reported_user_id, created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_badge_applications_user_id ON badge_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_applications_status ON badge_applications(status);
CREATE INDEX IF NOT EXISTS idx_badge_reports_reported_user ON badge_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_badge_reports_status ON badge_reports(status);
CREATE INDEX IF NOT EXISTS idx_profiles_badge_verified ON profiles(badge_verified, badge_type);

-- Function to check badge eligibility
CREATE OR REPLACE FUNCTION check_badge_eligibility(
  p_user_id UUID,
  p_badge_type TEXT
)
RETURNS JSON AS $$
DECLARE
  v_account_age_days INTEGER;
  v_total_posts INTEGER;
  v_verified_posts INTEGER;
  v_verification_rate NUMERIC;
  v_post_streak INTEGER;
  v_report_count INTEGER;
  v_result JSON;
  v_eligible BOOLEAN;
  v_requirements JSON;
BEGIN
  -- Get user stats
  SELECT
    EXTRACT(DAY FROM NOW() - created_at)::INTEGER,
    post_streak
  INTO v_account_age_days, v_post_streak
  FROM profiles
  WHERE id = p_user_id;

  -- Get post counts
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE verification_status = 'verified')
  INTO v_total_posts, v_verified_posts
  FROM posts
  WHERE user_id = p_user_id;

  -- Calculate verification rate
  IF v_total_posts > 0 THEN
    v_verification_rate := (v_verified_posts::NUMERIC / v_total_posts::NUMERIC) * 100;
  ELSE
    v_verification_rate := 0;
  END IF;

  -- Get report count (unresolved reports)
  SELECT COUNT(*)
  INTO v_report_count
  FROM badge_reports
  WHERE reported_user_id = p_user_id
    AND status = 'pending'
    AND report_type = 'fake_natural';

  -- Check eligibility based on badge type
  IF p_badge_type = 'natural' THEN
    -- Natural badge requirements
    v_eligible := (
      v_account_age_days >= 30 AND
      v_verified_posts >= 10 AND
      v_verification_rate >= 70 AND
      (v_post_streak >= 15 OR v_account_age_days >= 90) AND
      v_report_count < 5
    );

    v_requirements := json_build_object(
      'account_age_days', json_build_object('required', 30, 'current', v_account_age_days, 'met', v_account_age_days >= 30),
      'verified_posts', json_build_object('required', 10, 'current', v_verified_posts, 'met', v_verified_posts >= 10),
      'verification_rate', json_build_object('required', 70, 'current', ROUND(v_verification_rate, 1), 'met', v_verification_rate >= 70),
      'consistency', json_build_object('required', '15 day streak OR 90+ days active', 'current', v_post_streak || ' day streak, ' || v_account_age_days || ' days old', 'met', v_post_streak >= 15 OR v_account_age_days >= 90),
      'clean_standing', json_build_object('required', 'Less than 5 reports', 'current', v_report_count || ' reports', 'met', v_report_count < 5)
    );

  ELSIF p_badge_type = 'enhanced' THEN
    -- Enhanced badge requirements (simpler)
    v_eligible := (
      v_account_age_days >= 30 AND
      v_total_posts >= 10 AND
      v_report_count < 5
    );

    v_requirements := json_build_object(
      'account_age_days', json_build_object('required', 30, 'current', v_account_age_days, 'met', v_account_age_days >= 30),
      'total_posts', json_build_object('required', 10, 'current', v_total_posts, 'met', v_total_posts >= 10),
      'clean_standing', json_build_object('required', 'Less than 5 reports', 'current', v_report_count || ' reports', 'met', v_report_count < 5)
    );
  ELSE
    v_eligible := false;
    v_requirements := '{}'::JSON;
  END IF;

  -- Build result
  v_result := json_build_object(
    'eligible', v_eligible,
    'badge_type', p_badge_type,
    'requirements', v_requirements,
    'stats', json_build_object(
      'account_age_days', v_account_age_days,
      'total_posts', v_total_posts,
      'verified_posts', v_verified_posts,
      'verification_rate', ROUND(v_verification_rate, 1),
      'post_streak', v_post_streak,
      'report_count', v_report_count
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-approve badge if criteria met
CREATE OR REPLACE FUNCTION auto_approve_badge_if_eligible(
  p_user_id UUID,
  p_badge_type TEXT,
  p_application_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_account_age_days INTEGER;
  v_verified_posts INTEGER;
  v_verification_rate NUMERIC;
  v_post_streak INTEGER;
  v_report_count INTEGER;
  v_total_posts INTEGER;
  v_auto_approve BOOLEAN := false;
BEGIN
  -- Get user stats
  SELECT
    EXTRACT(DAY FROM NOW() - created_at)::INTEGER,
    post_streak
  INTO v_account_age_days, v_post_streak
  FROM profiles
  WHERE id = p_user_id;

  -- Get post stats
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE verification_status = 'verified')
  INTO v_total_posts, v_verified_posts
  FROM posts
  WHERE user_id = p_user_id;

  -- Calculate verification rate
  IF v_total_posts > 0 THEN
    v_verification_rate := (v_verified_posts::NUMERIC / v_total_posts::NUMERIC) * 100;
  ELSE
    v_verification_rate := 0;
  END IF;

  -- Get report count
  SELECT COUNT(*)
  INTO v_report_count
  FROM badge_reports
  WHERE reported_user_id = p_user_id AND status = 'pending';

  -- Check auto-approve criteria
  IF p_badge_type = 'natural' THEN
    v_auto_approve := (
      v_account_age_days >= 60 AND
      v_verified_posts >= 15 AND
      v_verification_rate >= 80 AND
      (v_post_streak >= 20 OR v_account_age_days >= 90) AND
      v_report_count = 0
    );
  ELSIF p_badge_type = 'enhanced' THEN
    v_auto_approve := (
      v_account_age_days >= 30 AND
      v_total_posts >= 10 AND
      v_report_count = 0
    );
  END IF;

  -- If auto-approve criteria met, approve the badge
  IF v_auto_approve THEN
    -- Update application
    UPDATE badge_applications
    SET status = 'auto_approved',
        reviewed_at = NOW()
    WHERE id = p_application_id;

    -- Update profile
    UPDATE profiles
    SET badge_verified = true,
        badge_verification_date = NOW()
    WHERE id = p_user_id;

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE badge_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badge_applications
CREATE POLICY "Users can view own badge applications"
  ON badge_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own badge applications"
  ON badge_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for badge_reports
CREATE POLICY "Users can view own reports"
  ON badge_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports on others"
  ON badge_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() != reported_user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON badge_applications TO authenticated;
GRANT SELECT, INSERT ON badge_reports TO authenticated;
GRANT EXECUTE ON FUNCTION check_badge_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION auto_approve_badge_if_eligible TO authenticated;

-- Comments for documentation
COMMENT ON TABLE badge_applications IS 'Stores badge verification applications';
COMMENT ON TABLE badge_reports IS 'Community reports for fake natural claims or misleading content';
COMMENT ON COLUMN profiles.badge_verified IS 'True if badge is permanently verified, false if temporary from onboarding';
COMMENT ON COLUMN profiles.badge_questionnaire_data IS 'Encrypted questionnaire responses (PED info never shown publicly)';
