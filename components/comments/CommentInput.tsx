import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, X } from 'lucide-react-native';
import { Profile } from '@/lib/api/types';
import { layout, spacing, fontSize, fontWeight } from '@/constants';

interface CommentInputProps {
  currentUser: Profile;
  onSubmit: (text: string) => void;
  placeholder?: string;
  replyingTo?: string | null; // Username being replied to
  onCancelReply?: () => void;
  autoFocus?: boolean;
  editingText?: string | null; // For edit mode
  onCancelEdit?: () => void;
}

const MAX_CHARS = 500;
const SHOW_COUNTER_AT = 400;

/**
 * CommentInput - Sticky input bar for posting comments
 * Supports reply mode and edit mode
 * Multiline with character limit
 */
export const CommentInput: React.FC<CommentInputProps> = ({
  currentUser,
  onSubmit,
  placeholder = 'Add a comment...',
  replyingTo = null,
  onCancelReply,
  autoFocus = false,
  editingText = null,
  onCancelEdit,
}) => {
  const [text, setText] = useState(editingText || '');
  const [inputHeight, setInputHeight] = useState(40);
  const inputRef = useRef<TextInput>(null);

  const isReplyMode = !!replyingTo;
  const isEditMode = !!editingText;
  const charCount = text.length;
  const showCounter = charCount >= SHOW_COUNTER_AT;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = text.trim().length > 0 && !isOverLimit;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (editingText !== null) {
      setText(editingText);
    }
  }, [editingText]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit(text.trim());
    setText('');
    setInputHeight(40); // Reset height
  };

  const handleCancel = () => {
    if (isReplyMode && onCancelReply) {
      onCancelReply();
    } else if (isEditMode && onCancelEdit) {
      onCancelEdit();
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {/* Reply/Edit mode indicator */}
        {(isReplyMode || isEditMode) && (
          <View style={styles.modeIndicator}>
            <Text style={styles.modeText}>
              {isReplyMode ? `Replying to @${replyingTo}` : 'Editing comment'}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <X size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input row */}
        <View style={styles.inputRow}>
          {/* User avatar */}
          {currentUser?.avatar_url ? (
            <Image
              source={{ uri: currentUser.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {currentUser?.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}

          {/* Text input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { height: Math.max(40, Math.min(inputHeight, 120)) }]}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={MAX_CHARS}
              onContentSizeChange={(e) => {
                setInputHeight(e.nativeEvent.contentSize.height);
              }}
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect
            />

            {/* Character counter */}
            {showCounter && (
              <Text style={[styles.charCounter, isOverLimit && styles.charCounterError]}>
                {charCount}/{MAX_CHARS}
              </Text>
            )}
          </View>

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.sendButton, canSubmit && styles.sendButtonActive]}
          >
            <Send
              size={20}
              color={canSubmit ? '#00d4ff' : 'rgba(255,255,255,0.2)'}
              fill={canSubmit ? '#00d4ff' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0e27',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  modeText: {
    fontSize: fontSize.sm,
    color: '#00d4ff',
    fontWeight: fontWeight.semibold,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: layout.avatarXs,
    height: layout.avatarXs,
    borderRadius: layout.avatarXs / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#0a0e27',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: layout.inputPaddingHorizontal,
    paddingVertical: layout.inputPaddingVertical,
    fontSize: fontSize.md,
    color: '#ffffff',
    minHeight: 40,
    maxHeight: 120,
  },
  charCounter: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(10, 14, 39, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  charCounterError: {
    color: '#ff6b6b',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: '#00d4ff',
  },
});
