import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CoachReview } from '@/constants/coachCertifications';

interface CoachReviewsProps {
  reviews: CoachReview[];
  averageRating: number;
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={[styles.star, { fontSize: size }]}>
        {i <= rating ? '★' : '☆'}
      </Text>
    );
  }
  return <View style={styles.starsContainer}>{stars}</View>;
};

const ReviewCard: React.FC<{ review: CoachReview }> = ({ review }) => {
  return (
    <View style={styles.reviewCard}>
      <LinearGradient
        colors={['#0d1128', '#050814']}
        style={styles.reviewCardGradient}
      >
        {/* Header */}
        <View style={styles.reviewHeader}>
          <Image
            source={{ uri: review.clientAvatar }}
            style={styles.reviewAvatar}
          />
          <View style={styles.reviewHeaderInfo}>
            <View style={styles.reviewNameRow}>
              <Text style={styles.reviewClientName}>{review.clientName}</Text>
              {review.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <StarRating rating={review.rating} size={12} />
          </View>
          <Text style={styles.reviewDate}>
            {review.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {/* Review Text */}
        <Text style={styles.reviewText}>{review.review}</Text>

        {/* Verified Client Badge */}
        {review.verified && (
          <View style={styles.verifiedClientBadge}>
            <Text style={styles.verifiedClientText}>VERIFIED CLIENT</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export const CoachReviews: React.FC<CoachReviewsProps> = ({ reviews, averageRating }) => {
  return (
    <View style={styles.container}>
      {/* Overall Rating */}
      <View style={styles.overallSection}>
        <View style={styles.ratingDisplay}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <StarRating rating={Math.round(averageRating)} size={20} />
          <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  overallSection: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    alignItems: 'center',
  },
  ratingDisplay: {
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFB800',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    color: '#FFB800',
  },
  reviewCount: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  reviewCardGradient: {
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
  },
  reviewHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewClientName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00ff88',
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '900',
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  reviewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  verifiedClientBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  verifiedClientText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00ff88',
    letterSpacing: 0.5,
  },
});
