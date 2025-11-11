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
import { createPost } from '@/lib/api/posts';
import { PostType, POST_TYPE_CONFIGS } from '@/lib/types/xp';
import { awardXP, updatePostStreak } from '@/lib/api/xp';
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
  const { pickImageFromLibrary} = useCamera();

  const successOpacity = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  const handleTakePhoto = () => {
    setMode('camera');
  };

  const handleChooseFromLibrary = async () => {
    const photo = await pickImageFromLibrary();
    if (photo) {
      setCapturedPhoto(photo);
      setMode('postType'); // Go to post type selection first
    }
  };

  const handleTextPost = () => {
    setCapturedPhoto(null);
    setMode('postType'); // Go to post type selection first
  };

  const handlePhotoCapture = (photo: CapturedPhoto) => {
    setCapturedPhoto(photo);
    setMode('postType'); // Go to post type selection first
  };

  const handlePostTypeSelect = (selectedType: PostType) => {
    setPostType(selectedType);
    setMode('preview');
  };

  const handlePost = async (caption: string, requestVerification: boolean) => {
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
      });

      if (postError) {
        console.error('❌ Post creation error:', postError);
        throw new Error(`Failed to create post: ${postError}`);
      }

      console.log('✅ Post created successfully!');
      console.log('Post ID:', post?.id);

      // Step 3: Award XP for the post (wrapped in try-catch so post succeeds even if XP fails)
      try {
        console.log('🎯 Awarding XP for post...');
        setUploadProgress('Awarding XP...');

        // Update streak first
        const { streak, multiplier } = await updatePostStreak(user.id);
        console.log(`Streak: ${streak} days, Multiplier: ${multiplier}x`);

        // Get XP amount for this post type
        const postTypeConfig = POST_TYPE_CONFIGS.find(c => c.type === postType);
        const baseXP = postTypeConfig?.baseXP || 0;

        // Award XP (verification bonus will be applied later if verified)
        const xpResult = await awardXP(
          user.id,
          baseXP,
          'post',
          post?.id,
          multiplier
        );

        if (xpResult.success) {
          console.log(`✅ Awarded ${xpResult.xpAwarded} XP!`);
          setXpGained(xpResult.xpAwarded);

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

      // Step 4: Show success animation
      setUploadProgress('Done!');
      setMode('success');
      setShowSuccessBurst(true);

      // Flash effect
      successOpacity.value = 0.15;
      successOpacity.value = withTiming(0, { duration: 150 });

      // Navigate back after animation
      setTimeout(() => {
        router.back();
        // Trigger refresh of feed (handled by screen focus)
      }, 800);
    } catch (error: any) {
      console.error('❌ Error creating post:', error);
      setUploading(false);
      setUploadProgress('');
      setMode('preview');

      Alert.alert(
        'Failed to Create Post',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    if (mode === 'camera' || mode === 'preview') {
      setMode('select');
      setCapturedPhoto(null);
    } else {
      router.back();
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
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
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
