import { useState, useRef } from 'react';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

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

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
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
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error('Error picking image:', error);
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
