import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { POST_TYPE_CONFIGS, PostType } from '@/lib/types/xp';

interface PostTypeSelectorProps {
  onSelect: (postType: PostType) => void;
  onCancel: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
  onSelect,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState<PostType | null>(null);

  const handleSelect = (type: PostType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#050814', '#0d1128', '#1a1f3a']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.backButton}>
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>
          <Text style={styles.headerTitle}>POST TYPE</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>What type of post is this?</Text>
            <Text style={styles.subtitle}>
              Choose wisely - this affects your XP gain
            </Text>
          </View>

          {/* Post Type Cards */}
          <View style={styles.cardsContainer}>
            {POST_TYPE_CONFIGS.map((config) => (
              <PostTypeCard
                key={config.type}
                config={config}
                isSelected={selectedType === config.type}
                onSelect={() => handleSelect(config.type)}
              />
            ))}
          </View>

          {/* Continue Button */}
          {selectedType && (
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButtonWrapper,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#00e5ff', '#ff00ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </LinearGradient>
            </Pressable>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

interface PostTypeCardProps {
  config: typeof POST_TYPE_CONFIGS[0];
  isSelected: boolean;
  onSelect: () => void;
}

const PostTypeCard: React.FC<PostTypeCardProps> = ({
  config,
  isSelected,
  onSelect,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    glowOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });
  };

  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.cardWrapper, cardAnimatedStyle]}
    >
      <View
        style={[
          styles.card,
          { borderColor: config.color },
          isSelected && styles.cardSelected,
        ]}
      >
        {/* Icon and Title */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{config.icon}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, { color: config.color }]}>
              {config.label}
            </Text>
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: config.color }]}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <Text style={styles.cardDescription}>{config.description}</Text>

        {/* XP Value */}
        <View style={[styles.xpBadge, { backgroundColor: config.color }]}>
          <Text style={styles.xpBadgeText}>
            {config.baseXP > 0 ? `+${config.baseXP} XP` : 'NO XP'}
          </Text>
        </View>

        {/* Selected Glow */}
        {isSelected && (
          <Animated.View
            style={[
              styles.cardGlow,
              { borderColor: config.color, shadowColor: config.color },
              glowAnimatedStyle,
            ]}
          />
        )}
      </View>
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
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  cardWrapper: {
    position: 'relative',
  },
  card: {
    backgroundColor: '#0d1128',
    borderRadius: 16,
    borderWidth: 4,
    padding: 20,
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  selectedBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    lineHeight: 22,
  },
  xpBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#000000',
  },
  xpBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  cardGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  continueButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#000000',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  continueButtonPressed: {
    opacity: 0.8,
  },
});
