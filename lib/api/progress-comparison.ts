/**
 * AI Progress Comparison API
 *
 * Compares two fitness progress photos using AI vision models.
 * Returns descriptive feedback about physical changes and progress.
 */

export interface ProgressComparisonResult {
  feedback: string; // Formatted feedback text (bullet points)
  timeDifference: string; // e.g., "12 weeks of progress"
  insights: string[]; // Individual bullet points
}

/**
 * Compare two progress photos using AI vision analysis.
 * For MVP, uses mock implementation. Production version uses Claude or GPT-4 Vision.
 *
 * @param oldImageUrl - URL of the earlier progress photo
 * @param newImageUrl - URL of the current progress photo
 * @param oldPostDate - Date of the earlier post (for calculating time difference)
 * @returns ProgressComparisonResult with AI feedback
 */
export async function compareProgressPhotos(
  oldImageUrl: string,
  newImageUrl: string,
  oldPostDate: Date
): Promise<ProgressComparisonResult> {
  console.log('🔍 Comparing progress photos...');
  console.log('Old photo:', oldImageUrl);
  console.log('New photo:', newImageUrl);

  // Calculate time difference
  const timeDiff = calculateTimeDifference(oldPostDate, new Date());

  // For now, use mock implementation (defined below)
  // In production, replace with real API call
  const result = await mockCompareProgressPhotos(oldImageUrl, newImageUrl, timeDiff);

  console.log('✅ Comparison complete');
  console.log('Feedback:', result.feedback);

  return result;
}

/**
 * Calculate human-readable time difference between two dates
 */
function calculateTimeDifference(oldDate: Date, newDate: Date): string {
  const diffMs = newDate.getTime() - oldDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths >= 2) {
    return `${diffMonths} months of progress`;
  } else if (diffWeeks >= 2) {
    return `${diffWeeks} weeks of progress`;
  } else if (diffDays >= 1) {
    return `${diffDays} days of progress`;
  } else {
    return 'Recent progress';
  }
}

/**
 * Mock comparison for testing/development.
 * Generates realistic-looking progress feedback.
 */
async function mockCompareProgressPhotos(
  oldImageUrl: string,
  newImageUrl: string,
  timeDifference: string
): Promise<ProgressComparisonResult> {
  // Simulate API call delay (1-2 seconds)
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Sample feedback variations
  const positiveInsights = [
    'Shoulder and trap development more visible',
    'Abdominal definition increased',
    'Overall frame appears fuller and more developed',
    'Back width and thickness improved notably',
    'Arm size and definition showing clear progress',
    'Chest development more prominent',
    'Leg development and separation more defined',
    'V-taper becoming more pronounced',
    'Muscle fullness and density improved',
    'Posture appears more confident and upright',
    'Core stability and control visibly better',
    'Deltoid roundness and definition enhanced',
    'Lat spread more noticeable from front view',
    'Quadriceps separation and definition improved',
    'Overall body composition appears leaner',
    'Muscle maturity and detail more visible',
    'Frame showing consistent development',
    'Athletic proportions improving',
  ];

  const neutralInsights = [
    'Maintaining consistent conditioning',
    'Form and posture remain solid',
    'Good foundation for continued progress',
    'Steady progress on current trajectory',
  ];

  // Randomly select 2-3 insights
  const numInsights = 2 + Math.floor(Math.random() * 2); // 2-3 insights
  const selectedInsights: string[] = [];

  // 85% chance of positive insights
  for (let i = 0; i < numInsights; i++) {
    if (Math.random() < 0.85) {
      const insight = positiveInsights[Math.floor(Math.random() * positiveInsights.length)];
      if (!selectedInsights.includes(insight)) {
        selectedInsights.push(insight);
      }
    } else {
      const insight = neutralInsights[Math.floor(Math.random() * neutralInsights.length)];
      if (!selectedInsights.includes(insight)) {
        selectedInsights.push(insight);
      }
    }
  }

  // Ensure we have at least 2 insights
  while (selectedInsights.length < 2) {
    const insight = positiveInsights[Math.floor(Math.random() * positiveInsights.length)];
    if (!selectedInsights.includes(insight)) {
      selectedInsights.push(insight);
    }
  }

  // Format as bullet points
  const feedback = selectedInsights.map(insight => `• ${insight}`).join('\n');

  return {
    feedback,
    timeDifference,
    insights: selectedInsights,
  };
}

/**
 * Real Anthropic Claude API implementation (for future use)
 * Uncomment and configure when ready to use real AI API
 */
/*
async function claudeCompareProgressPhotos(
  oldImageUrl: string,
  newImageUrl: string,
  timeDifference: string
): Promise<ProgressComparisonResult> {
  const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Latest model
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: oldImageUrl,
                },
              },
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: newImageUrl,
                },
              },
              {
                type: 'text',
                text: `Compare these two physique progress photos. Provide specific, objective observations about physical changes. Focus on: muscle definition, body composition, posture, and visible progress. Be encouraging but honest. Use 2-3 bullet points. Do NOT use numbers, percentages, or measurements. Start each point with a bullet (•). Example format:
• Shoulder and trap development more visible
• Abdominal definition increased
• Overall frame appears fuller and more developed`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const result = await response.json();
    const feedback = result.content[0].text;

    // Parse bullet points
    const insights = feedback
      .split('\n')
      .filter((line: string) => line.trim().startsWith('•'))
      .map((line: string) => line.replace('•', '').trim());

    return {
      feedback,
      timeDifference,
      insights,
    };
  } catch (error) {
    console.error('❌ Claude API comparison error:', error);
    throw error;
  }
}
*/

/**
 * Calculate XP bonus for sharing progress comparison.
 * Users get +10 XP for transparency when sharing comparison.
 */
export function calculateComparisonBonus(): number {
  return 10; // Flat +10 XP bonus
}
