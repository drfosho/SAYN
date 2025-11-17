# Badge Verification System - Complete Implementation

## Overview

The SAYN Badge Verification System allows users to earn **Natural** or **Enhanced** badges through an honest declaration and verification process. Both badges are **respected equally** - this system is about transparency and honesty, not judgment.

## Philosophy

> **HONESTY OVER EVERYTHING**
>
> - Natural Badge = Verified drug-free progression
> - Enhanced Badge = Verified honest about enhancement use
> - **Both badges command RESPECT and CREDIBILITY**
> - Lying or misleading others is what we stand against

## What Was Implemented

### ✅ Database Layer

**New Columns in `profiles` table:**
- `badge_verified` (boolean) - Distinguishes permanent verified badges from temporary onboarding selections
- `badge_application_date` (timestamp) - When user applied for verification
- `badge_verification_date` (timestamp) - When badge was approved
- `badge_questionnaire_data` (JSON) - Encrypted responses (PED info never shown publicly)

**New Tables:**
- `badge_applications` - Tracks all verification applications and their status
- `badge_reports` - Community reports for fake natural claims or misleading content

**SQL Functions:**
- `check_badge_eligibility()` - Returns detailed eligibility status for a user
- `auto_approve_badge_if_eligible()` - Auto-approves if strict criteria met

**Migration File:** `/supabase/migrations/badge_verification_system.sql`

### ✅ API Layer (`/lib/api/badges.ts`)

**Functions:**
- `checkBadgeEligibility(userId, badgeType)` - Check if user meets requirements
- `applyForBadge(userId, badgeType, questionnaireData)` - Submit application
- `getBadgeApplicationStatus(userId)` - Get current application status
- `reportBadgeIssue(reporterId, reportedUserId, type, reason)` - Report fake claims
- `getUserReportCount(userId)` - Get pending report count
- `revokeBadge(userId)` - Remove badge
- `changeBadgeType(userId, newType)` - Change badge (requires re-verification)
- `getBadgeInfo(userId)` - Get badge display info

### ✅ UI Components (`/components/badges/`)

**Created:**
- `BadgeRequirements.tsx` - Shows eligibility checklist with progress
- `BadgeSuccess.tsx` - Celebration screen when badge is verified
- `BadgeStatusCard.tsx` - Current badge status in settings

**Updated:**
- `NaturalBadge.tsx` - Added `verified` prop for unverified state visual
- `EnhancedBadge.tsx` - Added `verified` prop for unverified state visual

### ✅ Application Flow (`/app/badge-application.tsx`)

Complete multi-step application screen:
1. **Badge Selection** - Choose Natural or Enhanced
2. **Eligibility Check** - Real-time requirements display
3. **Questionnaire** - Optional questions (encrypted for Enhanced)
4. **Auto-Approval** - Immediate verification if criteria met
5. **Success Screen** - Celebration with +100 XP award

### ✅ XP System Integration

**Natural Badge Bonus:**
- Verified Natural badge holders receive **+10% XP on ALL activities**
- Applied automatically in `awardXP()` function (`/lib/api/xp.ts:246-253`)
- Shows as separate bonus in transaction logs
- Example: 100 XP → 110 XP (100 + 10 Natural bonus)

## Badge Requirements

### Natural Badge

**Minimum Requirements:**
- Account age: **30+ days**
- Verified posts: **10+**
- Verification rate: **70%+** of posts AI-verified
- Consistency: **15+ day streak** OR **90+ days active**
- Clean standing: **Less than 5 reports**

**Auto-Approval Criteria (higher bar):**
- Account age: **60+ days**
- Verified posts: **15+**
- Verification rate: **80%+**
- Consistency: **20+ day streak** OR **90+ days active**
- Clean standing: **0 reports**

### Enhanced Badge

**Minimum Requirements:**
- Account age: **30+ days**
- Total posts: **10+**
- Clean standing: **Less than 5 reports**

**Auto-Approval Criteria:**
- Account age: **30+ days**
- Total posts: **10+**
- Clean standing: **0 reports**

## User Flows

### First-Time Badge Selection (Onboarding)

1. During onboarding at `/app/onboarding/choose-path.tsx`
2. User selects: Natural, Enhanced, or Prefer Not to Say
3. Selection saved to `profiles.badge_type`
4. Badge status: **Unverified** (`badge_verified = false`)
5. Badge shows with lock icon overlay

### Applying for Verification

1. Navigate to Profile Settings
2. Tap "Apply for Badge Verification" (or view current status)
3. System checks eligibility requirements
4. If eligible: Complete optional questionnaire
5. Submit application
6. Auto-approval if strict criteria met, otherwise pending review
7. On success: +100 XP awarded, badge becomes verified

### Community Reporting

1. User can report suspected "fake natty" claims
2. Report types: `fake_natural`, `misleading`, `other`
3. After **5+ reports** from different users:
   - Badge status changes to `under_review`
   - User notified their badge is under review
   - Badge shows "Under Review" status
4. Manual admin review required to resolve

## Privacy & Security

**Enhanced Badge Questionnaire:**
- Questions about compounds, protocols, medical supervision
- All responses stored in encrypted `badge_questionnaire_data` JSON column
- **NEVER shown publicly** - only badge status (Enhanced) is visible
- Optional to complete - used only for verification purposes

**Natural Badge Questionnaire:**
- Training years, focus areas, coach vouching
- Used to verify natural progression claims
- Stored but not shown publicly

## Visual States

### Verified Badge
- Full bright colors with animated glow
- Shows on profile and all posts
- Label: "VERIFIED NATURAL" or "TRANSPARENT ENHANCED"
- No overlay icons

### Unverified Badge
- Dimmed appearance (50% opacity)
- Lock icon overlay (🔒)
- Label appends "(Unverified)"
- Shown only on profile, not posts

### Under Review Badge
- Gold/orange color scheme
- Question mark icon
- Label: "VERIFICATION PENDING"
- Shown while reports are being investigated

## XP Bonus Details

**Natural Badge Holders:**
- +10% XP on ALL XP-earning activities
- Applied in `awardXP()` before recording transaction
- Logged separately: "Natural badge bonus: +X XP (10%)"
- Example activities that get bonus:
  - Daily check-in posts
  - Progress updates
  - Peak condition posts
  - Power-ups received
  - Streak bonuses
  - All other XP sources

**Enhanced Badge Holders:**
- No XP bonus (but equal respect and credibility)
- Focus on transparency reward, not gameplay advantage

## Integration Points

### Profile Display
Show badge with verification status and date:
```typescript
<BadgeDisplay
  badgeType={profile.badge_type}
  verified={profile.badge_verified}
  size="medium"
/>
```

### Settings Integration
Add BadgeStatusCard to profile settings:
```typescript
<BadgeStatusCard
  badgeType={badge_type}
  badgeVerified={badge_verified}
  verificationDate={badge_verification_date}
  accountAgeDays={accountAgeDays}
/>
```

### Post Feed
Small badge indicator next to username (verified only):
```typescript
{post.profiles?.badge_verified && post.profiles?.badge_type && (
  <BadgeDisplay badgeType={post.profiles.badge_type} size="small" />
)}
```

## Testing Checklist

### Badge Application Flow
- [ ] Navigate to badge application screen
- [ ] Select Natural badge
- [ ] See eligibility requirements with current progress
- [ ] All requirements show green checkmarks if met
- [ ] Complete optional questionnaire
- [ ] Submit application
- [ ] See success screen with celebration
- [ ] Badge appears verified on profile
- [ ] +100 XP awarded

### XP Bonus Verification
- [ ] User with verified Natural badge posts
- [ ] Check XP transaction shows +10% bonus
- [ ] Console logs show "Natural badge bonus: +X XP"
- [ ] Repeat with power-ups, streaks, etc.
- [ ] Enhanced badge users do NOT get XP bonus

### Community Reporting
- [ ] Report a user with Natural badge
- [ ] After 5 reports, badge changes to "under_review"
- [ ] User sees "Under Review" badge status
- [ ] Badge icon changes to question mark

### Visual States
- [ ] Unverified badge shows lock icon overlay
- [ ] Unverified badge shows "(Unverified)" in label
- [ ] Verified badge shows full bright colors
- [ ] Verified badge has animated glow
- [ ] Under Review badge shows gold/orange colors

## Files Created

```
/supabase/migrations/badge_verification_system.sql
/lib/api/badges.ts
/components/badges/BadgeRequirements.tsx
/components/badges/BadgeSuccess.tsx
/components/badges/BadgeStatusCard.tsx
/app/badge-application.tsx
/BADGE_VERIFICATION_SYSTEM.md (this file)
```

## Files Modified

```
/lib/api/types.ts - Added badge_verified, badge_application_date, etc.
/lib/api/index.ts - Exported badge functions
/lib/api/xp.ts - Added Natural badge 10% XP bonus
/components/badges/NaturalBadge.tsx - Added verified prop
/components/badges/EnhancedBadge.tsx - Added verified prop
```

## Next Steps

### To Complete Setup:

1. **Run SQL Migration:**
   ```bash
   # Open Supabase SQL Editor
   # Copy and run: supabase/migrations/badge_verification_system.sql
   ```

2. **Add Badge Status to Settings:**
   - Import `BadgeStatusCard` component
   - Add to Profile Settings screen
   - Link "Apply for Badge Verification" button to `/badge-application`

3. **Update Profile Display:**
   - Pass `verified` prop to badge components
   - Show verification date if badge is verified
   - Add badge info section showing perks

4. **Test with Real Data:**
   - Create test accounts with different badge states
   - Test auto-approval criteria
   - Test community reporting flow
   - Verify XP bonus calculations

### Future Enhancements:

- **Admin Review Dashboard** - For manual review of pending applications and reports
- **AI Physique Analysis** - Advanced verification using progress photo analysis
- **Coach Vouching** - Allow verified coaches to vouch for Natural athletes
- **Badge Revocation Alerts** - Notify users when badge is under review
- **Appeal Process** - Allow users to appeal badge revocation
- **Badge History** - Track badge changes over time

## Support & Documentation

**Philosophy Reference:** `/constants/badges.ts` - Contains badge definitions and philosophy

**API Documentation:** All badge functions have JSDoc comments

**UI Components:** All components have prop interfaces and usage examples

## Important Notes

1. **Both badges are respected equally** - Never show judgment in UI/copy
2. **Privacy first** - PED information is encrypted and never shown publicly
3. **Honesty matters** - Emphasize transparency in all messaging
4. **Natural bonus** - 10% XP bonus represents additional natural training challenge
5. **Community-driven** - Reports trigger review, but admin makes final decision

---

**Built with honesty and transparency in mind.**
**SAYN - Show All Your Numbers**
