import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ProgressComparisonModal } from './ProgressComparisonModal';
import type { Post } from '@/lib/api/types';

interface PostPreviewProps {
  imageUri?: string;
  onPost: (caption: string, requestVerification: boolean, comparisonData?: {
    enabled: boolean;
    feedback?: string;
    previousPostId?: string;
  }) => void;
  onCancel: () => void;
  uploading?: boolean;
  uploadProgress?: string;
  postType?: 'daily_check_in' | 'progress_update' | 'peak_condition' | 'just_sharing';
  previousProgressPost?: Post | null;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Post preview screen following SAYN aesthetic
 * Dark, angular, powerful - clear labeling
 */
export const PostPreview: React.FC<PostPreviewProps> = ({
  imageUri,
  onPost,
  onCancel,
  uploading = false,
  uploadProgress = '',
  postType,
  previousProgressPost = null,
}) => {
  const [caption, setCaption] = useState('');
  const [requestVerification, setRequestVerification] = useState(true);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    enabled: boolean;
    feedback?: string;
    previousPostId?: string;
  }>({ enabled: false });
  const [isFocused, setIsFocused] = useState(false);
  const postButtonScale = useSharedValue(1);
  const captionInputRef = useRef<TextInput>(null);

  const isProgressUpdate = postType === 'progress_update';
  const hasImage = !!imageUri;
  const hasPreviousProgress = !!previousProgressPost;
  const canCompare = isProgressUpdate && hasImage && hasPreviousProgress;

  const handleCaptionChange = (text: string) => {
    console.log('Caption changed:', text);
    setCaption(text);
  };

  const focusInput = () => {
    captionInputRef.current?.focus();
  };

  const postButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: postButtonScale.value }],
  }));

  const handlePressIn = () => {
    postButtonScale.value = withTiming(0.92, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    postButtonScale.value = withTiming(1, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const handlePost = () => {
    onPost(caption, requestVerification, comparisonData);
  };

  const handleComparePress = () => {
    setShowComparisonModal(true);
  };

  const handleComparisonShare = (feedback: string, previousPostId: string) => {
    setComparisonData({
      enabled: true,
      feedback,
      previousPostId,
    });
    setShowComparisonModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>✕ CANCEL</Text>
          </Pressable>
          <Text style={styles.headerTitle}>POST PREVIEW</Text>
          <View style={styles.cancelButton} />
        </View>

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            {/* Angular frame overlay */}
            <View style={styles.imageFrame} />
          </View>
        )}

        {/* Caption Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>CAPTION</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={focusInput}
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              ref={captionInputRef}
              style={styles.input}
              value={caption}
              onChangeText={handleCaptionChange}
              placeholder="Share your progress..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline={true}
              numberOfLines={5}
              maxLength={500}
              autoFocus={true}
              editable={!uploading}
              selectTextOnFocus={true}
              returnKeyType="default"
              blurOnSubmit={false}
              textAlignVertical="top"
              onFocus={() => {
                console.log('Caption input focused');
                setIsFocused(true);
              }}
              onBlur={() => {
                console.log('Caption input blurred');
                setIsFocused(false);
              }}
            />
          </TouchableOpacity>
          <Text style={styles.charCount}>{caption.length} / 500</Text>
        </View>

        {/* AI Verification Toggle */}
        <View style={styles.verificationSection}>
          <View style={styles.verificationInfo}>
            <View style={styles.verificationHeader}>
              <Text style={styles.verificationLabel}>VERIFY THIS IMAGE</Text>
              <View style={styles.bonusBadge}>
                <Text style={styles.bonusText}>+50% XP</Text>
              </View>
            </View>
            <Text style={styles.verificationSubtext}>
              AI checks for editing, filters, or manipulation
            </Text>
          </View>
          <Pressable
            onPress={() => setRequestVerification(!requestVerification)}
            style={styles.toggleContainer}
          >
            <View
              style={[
                styles.toggleTrack,
                requestVerification && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  requestVerification && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* Progress Comparison Button */}
        {isProgressUpdate && hasImage && (
          <Pressable
            onPress={handleComparePress}
            disabled={!canCompare || uploading}
            style={[
              styles.comparisonButton,
              !canCompare && styles.comparisonButtonDisabled,
              comparisonData.enabled && styles.comparisonButtonActive,
            ]}
          >
            <LinearGradient
              colors={
                comparisonData.enabled
                  ? ['#00ff88', '#00e5ff']
                  : canCompare
                  ? ['#ff00aa', '#ff4500']
                  : ['#1a1f3a', '#0d1128']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.comparisonButtonGradient}
            >
              <Text style={styles.comparisonButtonText}>
                {comparisonData.enabled
                  ? '✓ COMPARISON ADDED (+10 XP)'
                  : canCompare
                  ? '📊 COMPARE TO PREVIOUS'
                  : '📊 POST YOUR FIRST PROGRESS PIC'}
              </Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* Post Button */}
        <AnimatedPressable
          onPress={handlePost}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={uploading}
          style={[
            styles.postButtonWrapper,
            postButtonAnimatedStyle,
            uploading && styles.postButtonDisabled,
          ]}
        >
          <LinearGradient
            colors={uploading ? ['#333', '#555'] : ['#00e5ff', '#ff0080']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.postButton}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.uploadingText}>{uploadProgress || 'Posting...'}</Text>
              </View>
            ) : (
              <Text style={styles.postButtonText}>⚡ POST TO FEED</Text>
            )}
          </LinearGradient>
          <View style={styles.postButtonGlow} />
        </AnimatedPressable>
      </ScrollView>

      {/* Loading Overlay */}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#00e5ff" />
            <Text style={styles.loadingText}>{uploadProgress || 'Posting...'}</Text>
          </View>
        </View>
      )}

      {/* Progress Comparison Modal */}
      {previousProgressPost && imageUri && (
        <ProgressComparisonModal
          visible={showComparisonModal}
          currentImageUri={imageUri}
          previousImageUrl={previousProgressPost.image_url || ''}
          previousPostDate={new Date(previousProgressPost.created_at)}
          onClose={() => setShowComparisonModal(false)}
          onShare={handleComparisonShare}
          previousPostId={previousProgressPost.id}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  cancelButton: {
    width: 80,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ff0080',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#000000',
    backgroundColor: '#0d1128',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#0d1128',
  },
  imageFrame: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 2,
    borderColor: '#00e5ff',
    opacity: 0.3,
    borderRadius: 8,
  },
  inputSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#0d1128',
    borderRadius: 14,
    borderWidth: 4,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    padding: 16,
    minHeight: 120,
  },
  inputContainerFocused: {
    borderColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  input: {
    width: '100%',
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 24,
    minHeight: 100,
    padding: 0,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 8,
    letterSpacing: 1,
  },
  verificationSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1128',
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#000000',
    padding: 16,
  },
  verificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  bonusBadge: {
    backgroundColor: '#00e5ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  verificationSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    lineHeight: 18,
  },
  toggleContainer: {
    padding: 4,
  },
  toggleTrack: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1f3a',
    borderWidth: 3,
    borderColor: '#000000',
    justifyContent: 'center',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#00e5ff',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6b7280',
    borderWidth: 2,
    borderColor: '#000000',
  },
  toggleThumbActive: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-end',
  },
  postButtonWrapper: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'visible',
    position: 'relative',
  },
  postButton: {
    paddingVertical: 20,
    borderRadius: 14,
    borderWidth: 5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  postButtonGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 22,
    backgroundColor: '#00e5ff',
    opacity: 0.4,
    zIndex: -1,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 1,
  },
  comparisonButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  comparisonButtonDisabled: {
    opacity: 0.5,
  },
  comparisonButtonActive: {
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  comparisonButtonGradient: {
    paddingVertical: 18,
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
  comparisonButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
