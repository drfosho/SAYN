import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface AvatarPickerProps {
  currentAvatarUrl: string | null;
  onImageSelected: (uri: string) => void;
  onRemoveImage: () => void;
  username: string;
}

export default function AvatarPicker({
  currentAvatarUrl,
  onImageSelected,
  onRemoveImage,
  username,
}: AvatarPickerProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const requestPermissions = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required to choose photos.');
        return false;
      }
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPreviewUri(uri);
        onImageSelected(uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPreviewUri(uri);
        onImageSelected(uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPreviewUri(null);
            onRemoveImage();
          },
        },
      ]
    );
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      const options = ['Take Photo', 'Choose from Library', 'Cancel'];
      if (currentAvatarUrl || previewUri) {
        options.splice(2, 0, 'Remove Photo');
      }

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: currentAvatarUrl || previewUri ? 2 : undefined,
          title: 'Change Profile Photo',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            pickImageFromCamera();
          } else if (buttonIndex === 1) {
            pickImageFromLibrary();
          } else if (buttonIndex === 2 && (currentAvatarUrl || previewUri)) {
            handleRemovePhoto();
          }
        }
      );
    } else {
      // Android - show Alert dialog
      Alert.alert(
        'Change Profile Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: pickImageFromCamera },
          { text: 'Choose from Library', onPress: pickImageFromLibrary },
          ...(currentAvatarUrl || previewUri
            ? [{ text: 'Remove Photo', onPress: handleRemovePhoto, style: 'destructive' as const }]
            : []),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const displayAvatarUrl = previewUri || currentAvatarUrl;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Picture</Text>

      <View style={styles.avatarContainer}>
        {displayAvatarUrl ? (
          <Image source={{ uri: displayAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Pressable style={styles.changeButton} onPress={showOptions}>
          <Text style={styles.changeButtonText}>CHANGE PHOTO</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00e5ff',
    backgroundColor: '#0d1128',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00e5ff',
  },
  changeButton: {
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#00e5ff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  changeButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1.5,
  },
});
