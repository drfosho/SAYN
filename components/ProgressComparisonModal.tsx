import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { compareProgressPhotos, ProgressComparisonResult } from '@/lib/api/progress-comparison';

interface ProgressComparisonModalProps {
  visible: boolean;
  currentImageUri: string;
  previousImageUrl: string;
  previousPostDate: Date;
  onClose: () => void;
  onShare: (feedback: string, previousPostId: string) => void;
  previousPostId: string;
}

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProgressComparisonModal: React.FC<ProgressComparisonModalProps> = ({
  visible,
  currentImageUri,
  previousImageUrl,
  previousPostDate,
  onClose,
  onShare,
  previousPostId,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ProgressComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useSharedValue(0);

  // Trigger analysis when modal becomes visible
  useEffect(() => {
    if (visible) {
      fadeAnim.value = withTiming(1, { duration: 300 });
      performComparison();
    } else {
      fadeAnim.value = 0;
      setResult(null);
      setError(null);
    }
  }, [visible]);

  const performComparison = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const comparisonResult = await compareProgressPhotos(
        previousImageUrl,
        currentImageUri,
        previousPostDate
      );
      setResult(comparisonResult);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError('Failed to analyze progress. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShare = () => {
    if (result) {
      onShare(result.feedback, previousPostId);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, animatedStyle]}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0d1128', '#050814', '#0d1128']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modal}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>YOUR PROGRESS ANALYSIS</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Time Difference Badge */}
              {result && (
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{result.timeDifference}</Text>
                </View>
              )}

              {/* Image Comparison */}
              <View style={styles.imagesContainer}>
                {/* Before Image */}
                <View style={styles.imageWrapper}>
                  <View style={styles.imageLabel}>
                    <Text style={styles.imageLabelText}>BEFORE</Text>
                  </View>
                  <Image
                    source={{ uri: previousImageUrl }}
                    style={styles.comparisonImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>

                {/* After Image */}
                <View style={styles.imageWrapper}>
                  <View style={styles.imageLabel}>
                    <Text style={styles.imageLabelText}>CURRENT</Text>
                  </View>
                  <Image
                    source={{ uri: currentImageUri }}
                    style={styles.comparisonImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* AI Feedback Section */}
              <View style={styles.feedbackContainer}>
                {analyzing && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00e5ff" />
                    <Text style={styles.loadingText}>Analyzing progress...</Text>
                  </View>
                )}

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {result && !analyzing && (
                  <>
                    <Text style={styles.feedbackTitle}>AI OBSERVATIONS</Text>
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackText}>{result.feedback}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                      <ActionButton
                        label="SHARE WITH POST (+10 XP)"
                        gradient={['#00e5ff', '#ff0080']}
                        onPress={handleShare}
                        isPrimary
                      />
                      <ActionButton
                        label="KEEP PRIVATE"
                        gradient={['#1a1f3a', '#0d1128']}
                        onPress={onClose}
                      />
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Animated.View>
    </Modal>
  );
};

interface ActionButtonProps {
  label: string;
  gradient: [string, string];
  onPress: () => void;
  isPrimary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  gradient,
  onPress,
  isPrimary = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.94, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withTiming(1.04, { duration: 80, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 70, easing: Easing.inOut(Easing.ease) })
    );
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionButton, animatedStyle]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.actionButtonGradient}
      >
        <Text style={styles.actionButtonText}>{label}</Text>
      </LinearGradient>
      {isPrimary && <View style={styles.actionButtonGlow} />}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width - 40,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modal: {
    borderWidth: 5,
    borderColor: '#000000',
    borderRadius: 16,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff0080',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  timeBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00e5ff',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1.5,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  imageLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00e5ff',
    zIndex: 10,
  },
  imageLabelText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000000',
    backgroundColor: '#0d1128',
  },
  arrowContainer: {
    width: 32,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#00e5ff',
    fontWeight: '900',
  },
  feedbackContainer: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 1,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff4444',
    textAlign: 'center',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  feedbackBox: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    marginBottom: 24,
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'visible',
    position: 'relative',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#000000',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  actionButtonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: '#00e5ff',
    opacity: 0.4,
    zIndex: -1,
  },
});
