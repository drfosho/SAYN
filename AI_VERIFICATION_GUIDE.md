# AI Authenticity Verification System

## Overview

SAYN's AI Authenticity Verification system helps build trust by allowing users to verify their photos are unedited. Users who verify their posts earn a **+50% XP bonus** and receive a verified badge on their posts.

This feature differentiates SAYN from other fitness apps by promoting authenticity and discouraging excessive editing, filters, and manipulation.

## How It Works

### For Users

1. **Upload a Post**: Take or select a photo
2. **Choose Post Type**: Select your workout type
3. **Enable Verification** (Default: ON):
   - Toggle is enabled by default to encourage verification
   - Label: "VERIFY THIS IMAGE"
   - Shows "+50% XP" bonus badge
   - Subtitle: "AI checks for editing, filters, or manipulation"

4. **Post & Verify**:
   - Image is uploaded to storage
   - Post is created in database
   - AI verification runs automatically (takes ~1 second)
   - Results are saved to post

5. **Verification Results**:

   **If PASSED ✓**:
   - Post gets "Verified Real ✓" badge (green checkmark)
   - User receives +50% XP bonus
   - verification_status = 'verified'
   - Success message: "Verified! +50% XP bonus earned"

   **If FAILED**:
   - Post still uploads normally
   - No XP bonus
   - No verified badge
   - verification_status = 'not_verified'
   - Neutral message: "Verification not confirmed - post uploaded"
   - NO shaming or negative language

   **If NOT REQUESTED**:
   - Post uploads normally
   - No badge, no bonus
   - verification_status = null

### What AI Checks For

The AI verification API checks for:
- **Body morphing/warping**: Unnatural body proportions or distortions
- **Excessive smoothing/filters**: Over-smoothed skin, heavy beauty filters
- **Background distortion**: Photoshop artifacts, warped backgrounds
- **Skin texture manipulation**: Unnatural skin texture changes
- **Digital manipulation**: Other editing or enhancement artifacts

### Profile Stats

Users can view their verification stats in their profile's "DETAILED STATS" section:

- **Verified Posts**: Count of posts that passed AI verification
- **Verification Rate**: Percentage of requested verifications that passed (e.g., "85%")

High verification rates (70%+) are highlighted in green with a checkmark.

## Technical Implementation

### Database Schema

```sql
-- Posts table columns
verification_status text check (verification_status in ('verified', 'not_verified'))
verification_requested boolean default false
verification_confidence decimal  -- AI confidence score (0-1)
verification_details jsonb        -- Detailed AI response
```

### Migration

If you have an existing database, run this migration:

```bash
# In Supabase SQL Editor
supabase-migrations/add_verification_columns.sql
```

### API Integration

**Mock API (Current - for testing)**:
- Located in `/lib/api/verification.ts`
- 80% pass rate
- Randomized failure reasons
- Simulates 500-1500ms API delay

**Real AI API (Future)**:
- Hive AI integration code is included but commented out
- Set `EXPO_PUBLIC_HIVE_API_KEY` in `.env`
- Uncomment `hiveAIVerifyImage()` function
- Replace mock call with real API

Example Hive AI setup:
```typescript
// In .env
EXPO_PUBLIC_HIVE_API_KEY=your_api_key_here

// In lib/api/verification.ts
// Uncomment the hiveAIVerifyImage function
// Update verifyImage to call hiveAIVerifyImage instead of mockVerifyImage
```

### Components

**VerifiedPostBadge** (`/components/VerifiedPostBadge.tsx`):
- Green checkmark shield badge
- Pulsing animation
- Shows in top-right corner of verified post images
- Two sizes: 'small' (default) and 'medium'

**PostPreview** (`/components/PostPreview.tsx`):
- Updated with verification toggle
- Shows "+50% XP" bonus badge
- Default ON to encourage verification

**PostCard** (`/components/PostCard.tsx`):
- Displays verified badge on posts with `verificationStatus === 'verified'`
- Badge positioned in top-right corner of post image

### XP System Integration

Verification bonus is calculated and awarded separately from base XP:

```typescript
// Base XP for post type
const baseXP = POST_TYPE_CONFIGS.find(c => c.type === postType)?.baseXP || 0;

// Calculate +50% bonus if verified
if (isVerified) {
  const bonus = calculateVerificationBonus(baseXP, true); // Returns baseXP * 0.5
  await awardXP(user.id, bonus, 'verification_bonus', post.id);
}
```

XP is awarded in two transactions:
1. Base XP (includes post type XP + streak multiplier)
2. Verification bonus (if verified)

### Post Creation Flow

```
1. User uploads image → Storage
2. Create post in database → Post record created
3. If verification requested:
   a. Call verifyImage(imageUrl)
   b. Update post with verification result
   c. Calculate XP bonus if verified
4. Award base XP
5. Award verification bonus (if applicable)
6. Show success screen with total XP
```

## User Experience

### Messaging Principles

1. **Encourage, don't shame**:
   - Failed verification = neutral message
   - No accusatory language
   - Post still goes through

2. **Highlight benefits**:
   - +50% XP bonus is prominent
   - Show verification badge on profile
   - Display verification stats

3. **Make verification easy**:
   - Default toggle to ON
   - One-tap verification
   - Automatic process

### Visual Design

Following SAYN's aesthetic:
- **Verified badge**: Green (#00ff88) checkmark with glow
- **Toggle**: Cyan (#00e5ff) when active
- **Bonus badge**: Bright cyan with black text
- **Stats highlight**: Green glow for high verification rates

## Testing

### Manual Testing Checklist

- [ ] Upload post with verification ON → Should see "Verifying..." loading
- [ ] Check post has verified badge (80% chance with mock)
- [ ] Check XP awarded includes +50% bonus for verified posts
- [ ] Upload post with verification OFF → No badge, normal XP
- [ ] Check profile stats show verified posts count
- [ ] Check verification rate percentage is correct
- [ ] Verify badge animates with pulse effect
- [ ] Test with image and text-only posts

### Mock API Behavior

The mock API (`mockVerifyImage` in `/lib/api/verification.ts`):
- **80% pass rate**: Most posts will verify successfully
- **Random delay**: 500-1500ms to simulate real API
- **Realistic failures**: Assigns 1-3 random issues when failing
- **Confidence scores**:
  - Pass: 0.85-1.0
  - Fail: 0.4-0.7

## Future Enhancements

### Phase 1 (MVP - ✓ Complete)
- [x] Mock verification API
- [x] Basic verification toggle
- [x] +50% XP bonus
- [x] Verified badge on posts
- [x] Profile verification stats

### Phase 2 (Planned)
- [ ] Integrate real AI API (Hive AI or Sensity.ai)
- [ ] Appeal system for failed verifications
- [ ] Verification history/log for users
- [ ] Admin dashboard for monitoring verification patterns

### Phase 3 (Future)
- [ ] Video verification for workout clips
- [ ] Tiered verification (Bronze/Silver/Gold based on verification rate)
- [ ] Verified-only challenges/leaderboards
- [ ] Verification NFT badges for highly verified users

## Troubleshooting

### Verification not running
- Check that `verification_requested` is true in PostPreview
- Verify image URL is valid and public
- Check console logs for errors during verification

### No verification bonus XP
- Ensure XP migrations are run (`lib/api/xp.ts`)
- Check that `calculateVerificationBonus` is called
- Verify both XP award calls succeed (base + bonus)

### Badge not showing
- Check `post.verificationStatus === 'verified'`
- Verify VerifiedPostBadge component is imported
- Check that badge container has proper z-index

### Database errors
- Run migration: `supabase-migrations/add_verification_columns.sql`
- Check that posts table has all verification columns
- Verify column constraints are correct

## API Cost Estimation

**Hive AI Pricing** (example):
- ~$0.001 per image verification
- 1000 verifications = $1
- 10,000 verifications/month = $10/month

**Optimization tips**:
- Cache verification results
- Rate limit: 1 verification per post (no re-verification)
- Only verify posts with images (skip text posts)

## Privacy & Ethics

1. **User consent**: Verification is optional, not required
2. **No data retention**: Verification results stored, but raw images not sent to third parties beyond storage
3. **Transparency**: Users know when AI is checking their images
4. **No public failures**: Failed verifications are private
5. **Fair system**: Same rules for everyone, no special treatment

## Summary

The AI Authenticity Verification system:
- ✅ Builds trust and authenticity in the SAYN community
- ✅ Rewards genuine users with +50% XP bonus
- ✅ Provides clear visual indicators (verified badge)
- ✅ Maintains positive UX (no shaming for failures)
- ✅ Easy to use (one toggle, automatic verification)
- ✅ Scalable (mock → real AI API)

This feature is a key differentiator that sets SAYN apart from Instagram and other fitness apps.
