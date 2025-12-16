import { useState, useRef } from 'react';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
}

export const useCamera = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      console.log('📷 Requesting camera permission...');
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
      console.log('📷 Current camera permission status:', existingStatus);

      if (existingStatus === 'granted') {
        setHasPermission(true);
        return true;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 Requested camera permission, new status:', status);

      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'SAYN needs camera access to take progress photos. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }

      return granted;
    } catch (error) {
      console.error('❌ Error requesting camera permission:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
      console.log('📸 Requesting media library permission...');
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('📸 Current media library permission status:', existingStatus);

      if (existingStatus === 'granted') {
        return true;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Requested media library permission, new status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Required',
          'SAYN needs access to your photos to share your fitness progress. Please enable it in Settings.',
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

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async (): Promise<CapturedPhoto | null> => {
    if (!cameraRef.current) return null;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo) return null;

      return {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
      };
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  };

  const pickImageFromLibrary = async (): Promise<CapturedPhoto | null> => {
    try {
      console.log('📸 Starting photo library picker...');

      // Request permission first
      const permissionGranted = await requestMediaLibraryPermission();

      if (!permissionGranted) {
        console.log('❌ Media library permission denied');
        return null;
      }

      console.log('✅ Permission granted, launching picker...');

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5], // Portrait aspect for fitness photos
        quality: 0.8,
        exif: false,
      });

      console.log('📸 Picker result:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('📸 User cancelled image picker');
        return null;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('✅ Image selected:', asset.uri);
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        };
      }

      console.log('❌ No image selected');
      return null;
    } catch (error) {
      console.error('❌ Error picking image from library:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
      return null;
    }
  };

  return {
    facing,
    flash,
    hasPermission,
    cameraRef,
    requestCameraPermission,
    requestMediaLibraryPermission,
    toggleCameraFacing,
    toggleFlash,
    takePicture,
    pickImageFromLibrary,
  };
};
