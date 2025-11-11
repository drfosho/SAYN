import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PostPreviewProps {
  imageUri?: string;
  onPost: (caption: string, requestVerification: boolean) => void;
  onCancel: () => void;
  uploading?: boolean;
  uploadProgress?: string;
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
}) => {
  const [caption, setCaption] = useState('');
  const [requestVerification, setRequestVerification] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const postButtonScale = useSharedValue(1);

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
    onPost(caption, requestVerification);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Share your progress..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={caption}
              onChangeText={setCaption}
              multiline
              editable={true}
              autoFocus={true}
              maxLength={500}
              textAlignVertical="top"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        {/* Verification Toggle */}
        <View style={styles.verificationSection}>
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationLabel}>REQUEST VERIFICATION</Text>
            <Text style={styles.verificationSubtext}>
              Get verified by the community for POWER POINTS
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
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 24,
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
  verificationLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 4,
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
});
