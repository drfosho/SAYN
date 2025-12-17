import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, ActionSheetIOS, Platform, Linking, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      console.log('📷 Requesting camera permission for avatar...');
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();

      if (existingStatus === 'granted') {
        return true;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 Camera permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'SAYN needs camera access to take profile photos. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error requesting camera permission:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
      console.log('📸 Requesting media library permission for avatar...');
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (existingStatus === 'granted') {
        return true;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Media library permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Required',
          'SAYN needs access to your photos to set a profile picture. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error requesting media library permission:', error);
      return false;
    }
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      console.log('📷 Launching camera for avatar...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square for avatar
        quality: 0.8,
      });

      console.log('📷 Camera result:', result.canceled ? 'canceled' : 'image captured');

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('✅ Avatar photo captured:', uri);
        setPreviewUri(uri);
        onImageSelected(uri);
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      console.log('📸 Launching photo library for avatar...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square for avatar
        quality: 0.8,
      });

      console.log('📸 Photo library result:', result.canceled ? 'canceled' : 'image selected');

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('✅ Avatar image selected:', uri);
        setPreviewUri(uri);
        onImageSelected(uri);
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    } finally {
      setLoading(false);
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

        <Pressable style={styles.changeButton} onPress={showOptions} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#00e5ff" />
          ) : (
            <Text style={styles.changeButtonText}>CHANGE PHOTO</Text>
          )}
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
