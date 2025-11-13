# AI Progress Comparison Feature

## Overview

The AI Progress Comparison feature allows users to compare their current fitness photo to a previous one and receive AI-generated feedback about their progress. This promotes transparency and provides users with objective insights about their fitness journey.

## How It Works

### For Users

1. **Select Progress Update Post Type**: When creating a new post, choose "Progress Update"

2. **Compare Button Appears** (if eligible):
   - ✅ **Enabled**: "📊 COMPARE TO PREVIOUS" - User has previous progress photos
   - ❌ **Disabled**: "📊 POST YOUR FIRST PROGRESS PIC" - No previous posts yet

3. **Comparison Flow**:
   - Tap "COMPARE TO PREVIOUS"
   - Modal opens showing:
     - Your previous progress photo (BEFORE)
     - Your current photo (CURRENT)
     - Time difference (e.g., "12 weeks of progress")
   - "Analyzing progress..." loading state (~1-2 seconds)
   - AI feedback appears with 2-3 bullet points

4. **AI Feedback Examples**:
   ```
   • Shoulder and trap development more visible
   • Abdominal definition increased
   • Overall frame appears fuller and more developed
   ```

5. **User Choices**:
   - **"SHARE WITH POST (+10 XP)"**: Include comparison with post, get bonus XP
   - **"KEEP PRIVATE"**: Don't share, no bonus

6. **Shared Comparison Posts**:
   - Show "Progress Comparison" badge
   - Display AI feedback prominently
   - Award +10 XP bonus for transparency
   - Store link to previous post for reference

## Technical Implementation

### Database Schema

```sql
-- Posts table additions
comparison_enabled boolean default false
comparison_previous_post_id uuid references public.posts(id) on delete set null
comparison_feedback text
```

### Migration

For existing databases, run:
```bash
supabase-migrations/add_comparison_columns.sql
```

### API Integration

**Mock API (Current - for testing)**:
- Located in `/lib/api/progress-comparison.ts`
- Generates realistic progress feedback
- 85% positive insights, 15% neutral
- Simulates 1-2 second API delay
- Calculates time difference automatically

**Real AI API (Future - Claude or GPT-4 Vision)**:
```typescript
// Anthropic Claude Vision API (commented out in code)
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: oldImageUrl } },
        { type: 'image', source: { type: 'url', url: newImageUrl } },
        { type: 'text', text: 'Compare these physique photos...' }
      ]
    }]
  })
});
```

### Components

**ProgressComparisonModal** (`/components/ProgressComparisonModal.tsx`):
- Side-by-side image comparison
- Before/After labels
- Time difference badge
- AI feedback display
- Loading state during analysis
- Action buttons (Share/Keep Private)
- Smooth animations and transitions

**ProgressComparisonBadge** (`/components/ProgressComparisonBadge.tsx`):
- Pink/magenta theme (#ff00aa)
- 📊 icon
- "PROGRESS COMPARISON" label
- Two sizes: small and medium
- Glowing effect

**PostPreview** (`/components/PostPreview.tsx`):
- Enhanced with comparison button
- Only shows for "Progress Update" posts with images
- Fetches previous progress post automatically
- Passes comparison data to upload flow

**PostCard** (`/components/PostCard.tsx`):
- Displays ProgressComparisonBadge for comparison posts
- Shows AI feedback in dedicated section above caption
- Pink-themed feedback box matching badge

### Upload Flow Integration

```typescript
// In app/upload.tsx

// Step 1: When user selects "Progress Update"
const handlePostTypeSelect = async (selectedType: PostType) => {
  if (selectedType === 'progress_update') {
    // Fetch user's last progress post
    const { data: prevPost } = await getLatestProgressPost(user.id);
    setPreviousProgressPost(prevPost);
  }
};

// Step 2: User views comparison in modal
<ProgressComparisonModal
  currentImageUri={currentImage}
  previousImageUrl={previousPost.image_url}
  previousPostDate={new Date(previousPost.created_at)}
  onShare={handleComparisonShare}
/>

// Step 3: Create post with comparison data
await createPost({
  user_id: user.id,
  comparison_enabled: true,
  comparison_previous_post_id: previousPostId,
  comparison_feedback: aiFeedback,
});

// Step 4: Award +10 XP bonus
const comparisonBonus = calculateComparisonBonus(); // Returns 10
await awardXP(user.id, comparisonBonus, 'comparison_bonus', post.id);
```

### XP System Integration

Comparison bonus is awarded separately from base XP:

```typescript
// Base XP for post type (e.g., 50 XP for Progress Update)
// + Streak multiplier (e.g., 1.2x for 3-day streak)
// + Verification bonus (e.g., +25 XP if verified)
// + Comparison bonus (+10 XP if shared)

Total XP Example:
- Base: 50 XP
- Streak (1.2x): 60 XP
- Verification (+50%): +30 XP
- Comparison: +10 XP
= 100 XP total
```

## User Experience

### Messaging Philosophy

1. **Encouraging, Not Judgmental**:
   - Focus on positive observations
   - Use "progress" language, not "better/worse"
   - No numbers, percentages, or measurements
   - Example: "Shoulder development more visible" ✅
   - Not: "10% increase in muscle mass" ❌

2. **Transparency Rewarded**:
   - +10 XP for sharing comparison publicly
   - No penalty for keeping private
   - Badge shows commitment to authenticity

3. **Optional, Not Required**:
   - Users can skip comparison entirely
   - First-time posters see encouraging message
   - No pressure to compare every post

### Visual Design

Following SAYN's aesthetic with comparison-specific theming:

- **Primary Color**: Pink/Magenta (#ff00aa)
- **Badge**: 📊 emoji + pink border + glow effect
- **Feedback Box**: Subtle pink background with border
- **Button States**: Gradient shifts between disabled/active
- **Modal**: Dark theme with cyan accents
- **Time Badge**: Cyan theme for time difference

## Testing

### Manual Testing Checklist

- [ ] Create first Progress Update post → Button shows "POST YOUR FIRST PROGRESS PIC"
- [ ] Create second Progress Update post → Button shows "COMPARE TO PREVIOUS"
- [ ] Tap compare button → Modal opens with previous image
- [ ] Wait for AI analysis → Feedback appears (2-3 bullet points)
- [ ] Tap "SHARE WITH POST" → Modal closes, button shows "COMPARISON ADDED"
- [ ] Submit post → Post created with comparison badge
- [ ] Check feed → Post shows ProgressComparisonBadge
- [ ] Check feed → AI feedback displays prominently
- [ ] Check XP → +10 bonus awarded
- [ ] Tap "KEEP PRIVATE" → No comparison added, no bonus

### Mock API Behavior

The mock comparison API:
- **Response time**: 1-2 seconds
- **Insights**: 2-3 bullet points
- **Positive rate**: 85% encouraging observations
- **Neutral rate**: 15% maintenance observations
- **Time calculation**: Automatic based on post dates

Sample insights:
```javascript
Positive (85%):
- Shoulder and trap development more visible
- Abdominal definition increased
- Back width and thickness improved notably
- Arm size and definition showing clear progress
[+ 14 more variations]

Neutral (15%):
- Maintaining consistent conditioning
- Form and posture remain solid
- Good foundation for continued progress
```

## Future Enhancements

### Phase 1 (MVP - ✓ Complete)
- [x] Mock comparison API
- [x] Basic side-by-side comparison
- [x] AI feedback (2-3 bullet points)
- [x] +10 XP bonus
- [x] Progress Comparison badge
- [x] Feedback display on posts

### Phase 2 (Planned)
- [ ] Real AI API integration (Claude/GPT-4 Vision)
- [ ] Before/After image carousel on posts
- [ ] Tap image to see full comparison modal
- [ ] Multiple previous posts selection
- [ ] Progress timeline view (all comparisons)

### Phase 3 (Future)
- [ ] Progress graphs/charts (visual XP trends)
- [ ] Achievement: "Consistent Progress" (5 comparisons)
- [ ] Comparison-only feed filter
- [ ] Progress challenges with comparison requirement
- [ ] Export comparison images for sharing outside app

## Troubleshooting

### Comparison button not showing
- Check post type is "progress_update"
- Verify user has uploaded an image
- Confirm previous progress post exists
- Check console for API errors

### No previous posts found
- User needs at least one previous "progress_update" post with an image
- Text-only posts don't count for comparison
- Other post types (daily check-in, etc.) are ignored

### AI feedback not generating
- Check console for API errors
- Verify mock API delay completed
- Ensure image URLs are valid and public
- Try again if transient error

### XP bonus not awarded
- Verify comparison_enabled is true in post
- Check XP migrations are run
- Ensure post creation succeeded
- Review console logs for XP award failures

## API Cost Estimation

**Anthropic Claude Vision API Pricing**:
- ~$0.01 per comparison (2 images)
- 100 comparisons = $1
- 1,000 comparisons/month = $10/month

**Optimization tips**:
- Only trigger on user request (not automatic)
- Cache comparison results (no re-analysis)
- Rate limit: 1 comparison per post
- Progressive rollout to control costs

## Privacy & Ethics

1. **User Control**: Comparison is opt-in, not automatic
2. **Private Option**: Users can analyze without sharing
3. **No Storage of Analysis**: Only final feedback text stored
4. **No Third-Party Sharing**: Images sent to AI API only, not stored
5. **Positive Focus**: AI prompted to be encouraging, not critical
6. **No Toxic Metrics**: No body fat %, weight, or measurements

## Summary

The AI Progress Comparison feature:
- ✅ Provides objective feedback on fitness progress
- ✅ Rewards transparency with +10 XP bonus
- ✅ Encourages regular progress documentation
- ✅ Uses AI for unbiased observations
- ✅ Maintains positive, encouraging tone
- ✅ Respects user privacy (optional sharing)
- ✅ Differentiates SAYN from Instagram (fitness-focused)

This feature helps users stay motivated by showing tangible progress over time, reinforced by AI observations rather than unreliable metrics like weight or body fat percentage.
