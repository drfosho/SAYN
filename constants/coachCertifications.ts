/**
 * Coach Certifications and Constants
 * Recognized fitness certifications and coach-related data
 */

export const RECOGNIZED_CERTIFICATIONS = [
  { id: 'nasm', label: 'NASM', fullName: 'National Academy of Sports Medicine', icon: '🏅' },
  { id: 'ace', label: 'ACE', fullName: 'American Council on Exercise', icon: '🏅' },
  { id: 'issa', label: 'ISSA', fullName: 'International Sports Sciences Association', icon: '🏅' },
  { id: 'nsca', label: 'NSCA', fullName: 'National Strength and Conditioning Association', icon: '🏅' },
  { id: 'acsm', label: 'ACSM', fullName: 'American College of Sports Medicine', icon: '🏅' },
  { id: 'nfpt', label: 'NFPT', fullName: 'National Federation of Professional Trainers', icon: '🏅' },
  { id: 'afaa', label: 'AFAA', fullName: 'Athletics and Fitness Association of America', icon: '🏅' },
  { id: 'cscs', label: 'CSCS', fullName: 'Certified Strength & Conditioning Specialist', icon: '🏅' },
  { id: 'other', label: 'Other', fullName: 'Other Recognized Certification', icon: '📜' },
] as const;

export const SPECIALIZATIONS = [
  { id: 'strength', label: 'Strength Training', icon: '💪' },
  { id: 'bodybuilding', label: 'Bodybuilding', icon: '🏆' },
  { id: 'weight_loss', label: 'Weight Loss', icon: '📉' },
  { id: 'powerlifting', label: 'Powerlifting', icon: '🏋️' },
  { id: 'olympic', label: 'Olympic Lifting', icon: '⚡' },
  { id: 'calisthenics', label: 'Calisthenics', icon: '🤸' },
  { id: 'crossfit', label: 'CrossFit', icon: '🔥' },
  { id: 'sports', label: 'Sports Performance', icon: '⚽' },
  { id: 'nutrition', label: 'Nutrition Coaching', icon: '🥗' },
  { id: 'rehabilitation', label: 'Rehabilitation', icon: '🩺' },
  { id: 'mobility', label: 'Mobility & Flexibility', icon: '🧘' },
  { id: 'senior', label: 'Senior Fitness', icon: '👴' },
] as const;

export const TRAINING_TYPES = [
  { id: 'one_on_one', label: '1-on-1 Training', icon: '👤' },
  { id: 'group', label: 'Group Training', icon: '👥' },
  { id: 'online', label: 'Online Coaching', icon: '💻' },
  { id: 'in_person', label: 'In-Person', icon: '🏋️' },
  { id: 'hybrid', label: 'Hybrid (Online + In-Person)', icon: '🔄' },
] as const;

export const PRICE_RANGES = [
  { id: 'budget', label: '$50-100/month', min: 50, max: 100 },
  { id: 'mid', label: '$100-250/month', min: 100, max: 250 },
  { id: 'premium', label: '$250-500/month', min: 250, max: 500 },
  { id: 'elite', label: '$500+/month', min: 500, max: Infinity },
] as const;

export interface CoachCredentials {
  certifications: string[];
  yearsExperience: number;
  specializations: string[];
  trainingPhilosophy: string;
}

export interface CoachProfile {
  isVerifiedCoach: boolean;
  credentials: CoachCredentials;
  clientTransformations: ClientTransformation[];
  reviews: CoachReview[];
  coachingInfo: CoachingInfo;
  stats: CoachStats;
}

export interface ClientTransformation {
  id: string;
  clientName: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  timePeriod: string; // e.g., "12 weeks"
  results: string; // Brief description
  isVerified: boolean;
}

export interface CoachReview {
  id: string;
  clientName: string;
  clientAvatar: string;
  rating: number; // 1-5
  review: string;
  date: Date;
  verified: boolean; // Only verified clients can review
}

export interface CoachingInfo {
  trainingTypes: string[];
  priceRange?: string;
  location?: string;
  timezone?: string;
  responseTime?: string; // e.g., "Within 24 hours"
  availableSlots?: number;
}

export interface CoachStats {
  totalClients: number;
  averageRetention: number; // months
  successRate: number; // percentage
  yearsCoaching: number;
}

export const COACH_VERIFICATION_REQUIREMENTS = {
  minAccountAge: 60, // days
  requiresUserBadge: true, // Must have Natural or Enhanced badge
  minTransformations: 3,
  minReviews: 3,
  requiresCertificationOrExperience: true,
  minExperienceYears: 2,
};
