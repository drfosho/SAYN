/**
 * AI Image Verification API
 *
 * Checks images for authenticity - detects editing, filters, morphing, etc.
 * Returns verification result with confidence score and details.
 */

export interface VerificationResult {
  verified: boolean;
  confidence: number; // 0-1
  details: {
    manipulationDetected?: boolean;
    filterDetected?: boolean;
    distortionDetected?: boolean;
    skinTextureManipulation?: boolean;
    bodyMorphing?: boolean;
    reasonsForFailure?: string[];
    rawApiResponse?: any;
  };
}

/**
 * Verify an image for authenticity using AI detection.
 * For MVP, this uses a mock implementation with randomized results.
 *
 * TODO: Replace with real AI API (Hive AI, Sensity.ai, etc.) when ready for production.
 *
 * @param imageUrl - Public URL of the image to verify
 * @returns VerificationResult with pass/fail, confidence, and details
 */
export async function verifyImage(imageUrl: string): Promise<VerificationResult> {
  console.log('🔍 Verifying image authenticity:', imageUrl);

  // For now, use mock implementation (defined below)
  // In production, replace with real API call
  const result = await mockVerifyImage(imageUrl);

  console.log(`✅ Verification complete: ${result.verified ? 'PASSED' : 'FAILED'} (confidence: ${result.confidence})`);

  return result;
}

/**
 * Mock verification for testing/development.
 * Simulates AI API with randomized but realistic results.
 *
 * 80% of images pass verification
 * 20% fail with various reasons
 */
async function mockVerifyImage(imageUrl: string): Promise<VerificationResult> {
  // Simulate API call delay (500-1500ms)
  const delay = 500 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // 80% pass rate
  const passes = Math.random() < 0.8;

  if (passes) {
    // Image looks authentic
    const confidence = 0.85 + (Math.random() * 0.15); // 0.85-1.0

    return {
      verified: true,
      confidence: parseFloat(confidence.toFixed(3)),
      details: {
        manipulationDetected: false,
        filterDetected: false,
        distortionDetected: false,
        skinTextureManipulation: false,
        bodyMorphing: false,
      },
    };
  } else {
    // Image failed verification - pick random failure reasons
    const failureReasons: string[] = [];
    const details: VerificationResult['details'] = {};

    const possibleIssues = [
      {
        key: 'manipulationDetected' as const,
        reason: 'Image manipulation detected',
        probability: 0.4
      },
      {
        key: 'filterDetected' as const,
        reason: 'Excessive filtering or smoothing detected',
        probability: 0.3
      },
      {
        key: 'distortionDetected' as const,
        reason: 'Background distortion or artifacts detected',
        probability: 0.25
      },
      {
        key: 'skinTextureManipulation' as const,
        reason: 'Skin texture manipulation detected',
        probability: 0.35
      },
      {
        key: 'bodyMorphing' as const,
        reason: 'Body morphing or warping detected',
        probability: 0.3
      },
    ];

    // Pick 1-3 random issues
    const numIssues = 1 + Math.floor(Math.random() * 3);
    const shuffled = possibleIssues.sort(() => Math.random() - 0.5);

    for (let i = 0; i < numIssues && i < shuffled.length; i++) {
      const issue = shuffled[i];
      if (Math.random() < issue.probability) {
        details[issue.key] = true;
        failureReasons.push(issue.reason);
      }
    }

    // If no issues were added (unlikely), add at least one
    if (failureReasons.length === 0) {
      details.manipulationDetected = true;
      failureReasons.push('Image manipulation detected');
    }

    const confidence = 0.4 + (Math.random() * 0.3); // 0.4-0.7 (lower confidence for failures)

    return {
      verified: false,
      confidence: parseFloat(confidence.toFixed(3)),
      details: {
        ...details,
        reasonsForFailure: failureReasons,
      },
    };
  }
}

/**
 * Real Hive AI implementation (for future use)
 * Uncomment and configure when ready to use real AI API
 */
/*
async function hiveAIVerifyImage(imageUrl: string): Promise<VerificationResult> {
  const HIVE_API_KEY = process.env.EXPO_PUBLIC_HIVE_API_KEY;

  if (!HIVE_API_KEY) {
    throw new Error('Hive AI API key not configured');
  }

  try {
    const response = await fetch('https://api.hive.ai/v2/task/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${HIVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
        models: ['deepfake', 'face_attributes', 'generic'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Hive AI API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Parse Hive AI response
    // (This is example code - adjust based on actual Hive AI response format)
    const deepfakeScore = result.status?.[0]?.response?.output?.[0]?.classes?.find(
      (c: any) => c.class === 'yes'
    )?.score || 0;

    const isProbablyReal = deepfakeScore < 0.15; // Low deepfake score = real
    const confidence = 1 - deepfakeScore; // Convert to confidence in authenticity

    return {
      verified: isProbablyReal,
      confidence: parseFloat(confidence.toFixed(3)),
      details: {
        manipulationDetected: deepfakeScore > 0.15,
        rawApiResponse: result,
      },
    };
  } catch (error) {
    console.error('❌ Hive AI verification error:', error);
    throw error;
  }
}
*/

/**
 * Calculate XP bonus for verified posts.
 * Verified posts get +50% XP bonus.
 */
export function calculateVerificationBonus(baseXP: number, isVerified: boolean): number {
  if (!isVerified) return 0;
  return Math.floor(baseXP * 0.5); // +50% bonus
}
