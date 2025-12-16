import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from '@/components/CameraView';
import { PostPreview } from '@/components/PostPreview';
import { PostTypeSelector } from '@/components/PostTypeSelector';
import { ElectricBurst } from '@/components/ElectricBurst';
import { useCamera, CapturedPhoto } from '@/hooks/useCamera';
import { useAuth } from '@/contexts/AuthContext';
import { uploadPostImage } from '@/lib/api/storage';
import { createPost, updatePost, getLatestProgressPost } from '@/lib/api/posts';
import { PostType, POST_TYPE_CONFIGS } from '@/lib/types/xp';
import { awardXP, updatePostStreak } from '@/lib/api/xp';
import { verifyImage, calculateVerificationBonus } from '@/lib/api/verification';
import { calculateComparisonBonus } from '@/lib/api/progress-comparison';
import type { Post } from '@/lib/api/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

type UploadMode = 'select' | 'camera' | 'postType' | 'preview' | 'success';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function UploadScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<UploadMode>('select');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [postType, setPostType] = useState<PostType | null>(null);
  const [showSuccessBurst, setShowSuccessBurst] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [xpGained, setXpGained] = useState(0);
  const [didLevelUp, setDidLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [previousProgressPost, setPreviousProgressPost] = useState<Post | null>(null);
  const { pickImageFromLibrary} = useCamera();

  const successOpacity = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  const handleTakePhoto = () => {
    setMode('camera');
  };

  const handleChooseFromLibrary = async () => {
    console.log('🔘 Photo Library button pressed');
    try {
      const photo = await pickImageFromLibrary();
      if (photo) {
        console.log('✅ Photo selected:', photo.uri);
        setCapturedPhoto(photo);
        setMode('postType'); // Go to post type selection first
      } else {
        console.log('❌ No photo returned from picker');
      }
    } catch (error) {
      console.error('❌ Error in handleChooseFromLibrary:', error);
      Alert.alert('Error', 'Something went wrong while accessing your photos. Please try again.');
    }
  };

  const handleTextPost = () => {
    // Navigate to dedicated text post screen
    router.push('/create-text-post');
  };

  const handlePhotoCapture = (photo: CapturedPhoto) => {
    setCapturedPhoto(photo);
    setMode('postType'); // Go to post type selection first
  };

  const handlePostTypeSelect = async (selectedType: PostType) => {
    setPostType(selectedType);

    // If progress update, fetch previous progress post for comparison
    if (selectedType === 'progress_update' && user?.id) {
      console.log('📊 Fetching previous progress post for comparison...');
      const { data: prevPost, error } = await getLatestProgressPost(user.id);
      if (error) {
        console.warn('Could not fetch previous progress post:', error);
      } else if (prevPost) {
        console.log('✅ Found previous progress post:', prevPost.id);
        setPreviousProgressPost(prevPost);
      } else {
        console.log('No previous progress posts found');
        setPreviousProgressPost(null);
      }
    } else {
      setPreviousProgressPost(null);
    }

    setMode('preview');
  };

  const handlePost = async (
    caption: string,
    requestVerification: boolean,
    comparisonData?: {
      enabled: boolean;
      feedback?: string;
      previousPostId?: string;
    }
  ) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    if (!postType) {
      Alert.alert('Error', 'Post type not selected');
      return;
    }

    if (uploading) {
      return; // Prevent double-submit
    }

    console.log('🚀 Starting post upload...');
    console.log('User ID:', user.id);
    console.log('Post Type:', postType);
    console.log('Caption:', caption);
    console.log('Verification requested:', requestVerification);
    console.log('Has photo:', !!capturedPhoto);

    setUploading(true);

    try {
      let imageUrl = null;

      // Step 1: Upload image to storage if present
      if (capturedPhoto?.uri) {
        console.log('📤 Uploading image to storage...');
        console.log('Image URI:', capturedPhoto.uri);
        setUploadProgress('Uploading image...');

        const { data: uploadedUrl, error: uploadError } = await uploadPostImage(
          user.id,
          capturedPhoto.uri
        );

        if (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError}`);
        }

        imageUrl = uploadedUrl;
        console.log('✅ Image uploaded successfully!');
        console.log('Public URL:', imageUrl);
      }

      // Step 2: Create post in database
      console.log('💾 Creating post in database...');
      setUploadProgress('Creating post...');

      const { data: post, error: postError } = await createPost({
        user_id: user.id,
        image_url: imageUrl || undefined,
        caption: caption || undefined,
        post_type: postType,
        verification_requested: requestVerification,
        comparison_enabled: comparisonData?.enabled || false,
        comparison_previous_post_id: comparisonData?.previousPostId,
        comparison_feedback: comparisonData?.feedback,
      });

      if (postError) {
        console.error('❌ Post creation error:', postError);
        throw new Error(`Failed to create post: ${postError}`);
      }

      console.log('✅ Post created successfully!');
      console.log('Post ID:', post?.id);

      // Step 3: AI Verification (if requested and has image)
      let isVerified = false;
      let verificationBonus = 0;

      if (requestVerification && imageUrl && post?.id) {
        try {
          console.log('🔍 Verifying image authenticity...');
          setUploadProgress('Verifying image...');

          const verificationResult = await verifyImage(imageUrl);

          // Update post with verification result
          await updatePost(post.id, {
            verification_status: verificationResult.verified ? 'verified' : 'not_verified',
            verification_confidence: verificationResult.confidence,
            verification_details: verificationResult.details,
          });

          isVerified = verificationResult.verified;

          if (verificationResult.verified) {
            console.log(`✅ Image verified! Confidence: ${verificationResult.confidence}`);
          } else {
            console.log(`❌ Verification failed. Reasons: ${verificationResult.details.reasonsForFailure?.join(', ')}`);
          }
        } catch (verificationError: any) {
          console.warn('⚠️ Verification failed (continuing without verification):', verificationError.message);
          // Continue even if verification fails - post still succeeds
        }
      }

      // Step 4: Award XP for the post (wrapped in try-catch so post succeeds even if XP fails)
      try {
        console.log('🎯 Awarding XP for post...');
        setUploadProgress('Awarding XP...');

        // Update streak first
        const { streak, multiplier } = await updatePostStreak(user.id);
        console.log(`Streak: ${streak} days, Multiplier: ${multiplier}x`);

        // Get XP amount for this post type
        const postTypeConfig = POST_TYPE_CONFIGS.find(c => c.type === postType);
        const baseXP = postTypeConfig?.baseXP || 0;

        // Calculate verification bonus if verified
        if (isVerified) {
          verificationBonus = calculateVerificationBonus(baseXP, true);
          console.log(`🎖️ Verification bonus: +${verificationBonus} XP (+50%)`);
        }

        // Calculate comparison bonus if shared
        let comparisonBonus = 0;
        if (comparisonData?.enabled) {
          comparisonBonus = calculateComparisonBonus();
          console.log(`📊 Comparison bonus: +${comparisonBonus} XP`);
        }

        // Award base XP
        const xpResult = await awardXP(
          user.id,
          baseXP,
          'post',
          post?.id,
          multiplier
        );

        let totalXP = 0;

        if (xpResult.success) {
          totalXP = xpResult.xpAwarded;
          console.log(`✅ Awarded ${xpResult.xpAwarded} XP (base + streak)`);

          // Award verification bonus separately if verified
          if (verificationBonus > 0) {
            const bonusResult = await awardXP(
              user.id,
              verificationBonus,
              'verification_bonus',
              post?.id
            );

            if (bonusResult.success) {
              totalXP += bonusResult.xpAwarded;
              console.log(`✅ Awarded ${bonusResult.xpAwarded} XP verification bonus!`);
            }
          }

          // Award comparison bonus if shared
          if (comparisonBonus > 0) {
            const compBonusResult = await awardXP(
              user.id,
              comparisonBonus,
              'comparison_bonus',
              post?.id
            );

            if (compBonusResult.success) {
              totalXP += compBonusResult.xpAwarded;
              console.log(`✅ Awarded ${compBonusResult.xpAwarded} XP comparison bonus!`);
            }
          }

          setXpGained(totalXP);

          if (xpResult.levelUpResult.didLevelUp) {
            console.log(`🎉 Level up! ${xpResult.levelUpResult.oldLevel} → ${xpResult.levelUpResult.newLevel}`);
            setDidLevelUp(true);
            setNewLevel(xpResult.levelUpResult.newLevel);
          }
        }
      } catch (xpError: any) {
        console.warn('⚠️ XP awarding failed (migrations may not be run yet):', xpError.message);
        // Continue with post success even if XP fails
      }

      // Step 5: Show success animation
      setUploadProgress('Done!');
      setMode('success');
      setShowSuccessBurst(true);

      // Flash effect
      successOpacity.value = 0.15;
      successOpacity.value = withTiming(0, { duration: 150 });

      // Navigate back to feed after animation
      setTimeout(() => {
        router.replace('/(tabs)');
        // Trigger refresh of feed (handled by screen focus)
      }, 800);
    } catch (error: any) {
      console.error('❌ Error creating post:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      setUploading(false);
      setUploadProgress('');
      setMode('preview');

      // Determine user-friendly error message based on error type
      let errorTitle = 'Failed to Create Post';
      let errorMessage = 'Something went wrong. Please try again.';

      if (error.message) {
        const msg = error.message.toLowerCase();

        if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
          errorTitle = 'Network Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          console.error('🌐 Network connectivity issue detected');
        } else if (msg.includes('comparison_enabled') || msg.includes('column')) {
          errorTitle = 'Database Error';
          errorMessage = 'A database migration needs to be run. Please contact support or run the latest migrations.';
          console.error('🗄️ Database schema mismatch - missing columns');
        } else if (msg.includes('upload image') || msg.includes('storage')) {
          errorTitle = 'Image Upload Failed';
          errorMessage = 'Failed to upload your image. Please try a different image or check your connection.';
          console.error('📤 Image upload to storage failed');
        } else if (msg.includes('authentication') || msg.includes('unauthorized')) {
          errorTitle = 'Authentication Error';
          errorMessage = 'Your session has expired. Please log out and log back in.';
          console.error('🔐 Authentication issue detected');
        } else if (msg.includes('verification')) {
          errorTitle = 'Verification Error';
          errorMessage = 'AI verification failed, but your post was created successfully without verification.';
          console.error('🔍 Verification service issue');
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleCancel = () => {
    if (mode === 'camera' || mode === 'preview') {
      setMode('select');
      setCapturedPhoto(null);
    } else {
      // Navigate to feed tab, not back to create tab
      router.replace('/(tabs)');
    }
  };

  // Success screen
  if (mode === 'success') {
    return (
      <View style={styles.successContainer}>
        <StatusBar style="light" />
        {showSuccessBurst && (
          <View style={styles.successBurstContainer}>
            <ElectricBurst size={200} color="#00e5ff" />
          </View>
        )}
        <Animated.View style={[styles.successFlash, successAnimatedStyle]} />
        <Text style={styles.successText}>POST UPLOADED</Text>
        {xpGained > 0 && (
          <View style={styles.xpGainContainer}>
            <Text style={styles.xpGainText}>+{xpGained} XP</Text>
          </View>
        )}
        {didLevelUp && (
          <Text style={styles.levelUpText}>🎉 LEVEL {newLevel}!</Text>
        )}
        <Text style={styles.successSubtext}>POWER LEVEL INCREASING...</Text>
      </View>
    );
  }

  // Camera view
  if (mode === 'camera') {
    return (
      <CameraView
        onCapture={handlePhotoCapture}
        onClose={handleCancel}
      />
    );
  }

  // Post Type Selection screen
  if (mode === 'postType') {
    return (
      <PostTypeSelector
        onSelect={handlePostTypeSelect}
        onCancel={handleCancel}
      />
    );
  }

  // Preview screen
  if (mode === 'preview') {
    return (
      <PostPreview
        imageUri={capturedPhoto?.uri}
        onPost={handlePost}
        onCancel={handleCancel}
        uploading={uploading}
        uploadProgress={uploadProgress}
        postType={postType}
        previousProgressPost={previousProgressPost}
      />
    );
  }

  // Selection screen (default)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#050814', '#0d1128', '#050814']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>CREATE POST</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Take Photo Option */}
          <UploadOption
            icon="📸"
            title="TAKE PHOTO"
            subtitle="Capture with camera"
            gradient={['#00e5ff', '#0088ff']}
            onPress={handleTakePhoto}
          />

          {/* Choose from Library */}
          <UploadOption
            icon="🖼️"
            title="PHOTO LIBRARY"
            subtitle="Select from gallery"
            gradient={['#ff0080', '#ff00ff']}
            onPress={handleChooseFromLibrary}
          />

          {/* Text Post */}
          <UploadOption
            icon="✏️"
            title="TEXT POST"
            subtitle="Share without image"
            gradient={['#ff4500', '#ffaa00']}
            onPress={handleTextPost}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

interface UploadOptionProps {
  icon: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  onPress: () => void;
}

const UploadOption: React.FC<UploadOptionProps> = ({
  icon,
  title,
  subtitle,
  gradient,
  onPress,
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
      style={[styles.optionWrapper, animatedStyle]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.option}
      >
        <Text style={styles.optionIcon}>{icon}</Text>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
      <View style={styles.optionGlow} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ff0080',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  optionWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'visible',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 5,
    borderColor: '#000000',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  optionIcon: {
    fontSize: 48,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 4,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  optionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  optionGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    backgroundColor: '#00e5ff',
    opacity: 0.3,
    zIndex: -1,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#050814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBurstContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
  successText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginTop: 24,
  },
  successSubtext: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
    marginTop: 12,
    opacity: 0.8,
  },
  xpGainContainer: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00e5ff',
    marginTop: 16,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
  },
  xpGainText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 3,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  levelUpText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffaa00',
    letterSpacing: 3,
    marginTop: 12,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
