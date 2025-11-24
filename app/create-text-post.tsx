import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/lib/api/posts';
import { layout, spacing, fontSize, fontWeight } from '@/constants';

const MAX_CHARS = 1000;
const SHOW_COUNTER_AT = 800;

const SUGGESTIONS = [
  "What did you learn in your last workout?",
  "Share a mindset shift that helped your progress",
  "What advice would you give your past self?",
  "What's keeping you motivated this week?",
  "Reflect on how far you've come",
  "What challenge are you working to overcome?",
  "Share a training insight or tip",
  "What does your fitness journey mean to you?",
];

/**
 * Dedicated text post composition screen
 * For sharing thoughts, mindset, and reflections without images
 * Text posts are "Just Sharing" (0 XP) - focus on community and authentic expression
 */
export default function CreateTextPostScreen() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [suggestion] = useState(() =>
    SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
  );

  const charCount = text.length;
  const showCounter = charCount >= SHOW_COUNTER_AT;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = text.trim().length > 0 && !isOverLimit && !isPosting;

  const handleExit = () => {
    if (text.trim().length > 0) {
      Alert.alert(
        'Discard Post?',
        'Your text will be lost.',
        [
          { text: 'Keep Writing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.replace('/(tabs)')
          },
        ]
      );
    } else {
      router.replace('/(tabs)');
    }
  };

  const handlePost = async () => {
    if (!user || !canPost) return;

    try {
      setIsPosting(true);

      console.log('📝 Creating text post...');

      const { data, error } = await createPost({
        user_id: user.id,
        caption: text.trim(),
        post_type: 'just_sharing', // Text posts are always "Just Sharing" (0 XP)
        verification_requested: false, // No verification for text posts
      });

      if (error) {
        console.error('Failed to create text post:', error);
        Alert.alert('Error', 'Failed to post. Please try again.');
        return;
      }

      console.log('✅ Text post created successfully!');

      // Show success and return to feed
      Alert.alert(
        'Posted!',
        'Your thoughts have been shared with the community.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Create text post error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#050814', '#0d1128', '#050814']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleExit} style={styles.closeButton}>
              <X size={28} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Share Your Thoughts</Text>

            <TouchableOpacity
              onPress={handlePost}
              disabled={!canPost}
              style={[styles.postButton, !canPost && styles.postButtonDisabled]}
            >
              <Text style={[styles.postButtonText, !canPost && styles.postButtonTextDisabled]}>
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="What's on your mind? Training thoughts, mindset, reflections..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              maxLength={MAX_CHARS}
              autoFocus
              contextMenuHidden={true} // Disable copy/paste menu
              selectTextOnFocus={false}
              textAlignVertical="top"
              editable={!isPosting}
            />

            {/* Character Counter */}
            {showCounter && (
              <View style={styles.counterContainer}>
                <Text style={[styles.charCount, isOverLimit && styles.charCountError]}>
                  {charCount} / {MAX_CHARS}
                </Text>
              </View>
            )}

            {/* Copy/Paste Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>✍️</Text>
              <Text style={styles.infoText}>
                Type your thoughts - copy/paste disabled to encourage authentic expression
              </Text>
            </View>

            {/* Suggestion */}
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestionLabel}>Need inspiration?</Text>
              <Text style={styles.suggestion}>"{suggestion}"</Text>
            </View>

            {/* XP Info */}
            <View style={styles.xpInfoBox}>
              <Text style={styles.xpInfoIcon}>💭</Text>
              <View style={styles.xpInfoContent}>
                <Text style={styles.xpInfoTitle}>Text posts = 0 XP</Text>
                <Text style={styles.xpInfoText}>
                  These are for sharing your journey and connecting with the community.
                  Want XP? Share progress photos!
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: spacing.sm,
    width: 60,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: '#ffffff',
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: layout.buttonRadiusSmall,
    width: 80,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  postButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#0a0e27',
  },
  postButtonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  textInput: {
    fontSize: fontSize.lg,
    lineHeight: 28,
    color: '#ffffff',
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.base,
  },
  charCount: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: fontWeight.semibold,
  },
  charCountError: {
    color: '#ff6b6b',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    padding: spacing.base,
    borderRadius: layout.buttonRadiusSmall,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    marginBottom: spacing.lg,
  },
  infoIcon: {
    fontSize: fontSize['2xl'],
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#00d4ff',
    lineHeight: 20,
  },
  suggestionContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.base,
    borderRadius: layout.buttonRadiusSmall,
    borderLeftWidth: 3,
    borderLeftColor: '#ff0080',
    marginBottom: spacing.lg,
  },
  suggestionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  suggestion: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  xpInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.base,
    borderRadius: layout.buttonRadiusSmall,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  xpInfoIcon: {
    fontSize: fontSize['2xl'],
  },
  xpInfoContent: {
    flex: 1,
  },
  xpInfoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  xpInfoText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
});
