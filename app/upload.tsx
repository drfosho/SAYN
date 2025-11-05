import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from '@/components/CameraView';
import { PostPreview } from '@/components/PostPreview';
import { ElectricBurst } from '@/components/ElectricBurst';
import { useCamera, CapturedPhoto } from '@/hooks/useCamera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

type UploadMode = 'select' | 'camera' | 'preview' | 'success';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function UploadScreen() {
  const [mode, setMode] = useState<UploadMode>('select');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [showSuccessBurst, setShowSuccessBurst] = useState(false);
  const { pickImageFromLibrary } = useCamera();

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
      setMode('preview');
    }
  };

  const handleTextPost = () => {
    setCapturedPhoto(null);
    setMode('preview');
  };

  const handlePhotoCapture = (photo: CapturedPhoto) => {
    setCapturedPhoto(photo);
    setMode('preview');
  };

  const handlePost = (caption: string, requestVerification: boolean) => {
    // TODO: Add to local state (will implement in next phase)
    console.log('Posting:', { caption, requestVerification, photo: capturedPhoto });

    // Show success animation
    setMode('success');
    setShowSuccessBurst(true);

    // Flash effect
    successOpacity.value = 0.15;
    successOpacity.value = withTiming(0, { duration: 150 });

    // Navigate back after animation
    setTimeout(() => {
      router.back();
    }, 800);
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

  // Preview screen
  if (mode === 'preview') {
    return (
      <PostPreview
        imageUri={capturedPhoto?.uri}
        onPost={handlePost}
        onCancel={handleCancel}
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
});
