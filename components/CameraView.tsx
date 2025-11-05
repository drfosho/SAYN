import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useCamera, CapturedPhoto } from '@/hooks/useCamera';

const { width, height } = Dimensions.get('window');

interface CameraViewProps {
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
}

/**
 * Minimal, powerful camera interface following SAYN aesthetic
 * Bold HUD elements, angular design, dark theme
 */
export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const {
    facing,
    flash,
    hasPermission,
    cameraRef,
    requestCameraPermission,
    toggleCameraFacing,
    toggleFlash,
    takePicture,
  } = useCamera();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const handleCapture = async () => {
    const photo = await takePicture();
    if (photo) {
      onCapture(photo);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>REQUESTING CAMERA ACCESS...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>CAMERA ACCESS DENIED</Text>
        <Text style={styles.permissionSubtext}>Enable camera in settings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      />

      {/* Top HUD */}
      <View style={styles.topHUD}>
        <Pressable onPress={onClose} style={styles.hudButton}>
          <LinearGradient
            colors={['#ff0080', '#ff4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.hudButtonGradient}
          >
            <Text style={styles.hudButtonText}>✕</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={toggleFlash} style={styles.hudButton}>
          <View style={[styles.hudButtonSolid, flash === 'on' && styles.hudButtonActive]}>
            <Text style={styles.hudButtonText}>{flash === 'on' ? '⚡' : '⚡'}</Text>
          </View>
        </Pressable>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Flip Camera Button */}
        <Pressable onPress={toggleCameraFacing} style={styles.controlButton}>
          <View style={styles.controlButtonBorder}>
            <Text style={styles.controlButtonText}>🔄</Text>
          </View>
        </Pressable>

        {/* Capture Button - LARGE, CENTERED, POWERFUL */}
        <Pressable onPress={handleCapture} style={styles.captureButtonWrapper}>
          <View style={styles.captureButtonOuter}>
            <LinearGradient
              colors={['#00e5ff', '#ff0080']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.captureButtonGradient}
            >
              <View style={styles.captureButtonInner} />
            </LinearGradient>
          </View>
        </Pressable>

        {/* Empty spacer for symmetry */}
        <View style={styles.controlButton} />
      </View>

      {/* Corner frame indicators (HUD aesthetic) */}
      <View style={styles.frameTopLeft} />
      <View style={styles.frameTopRight} />
      <View style={styles.frameBottomLeft} />
      <View style={styles.frameBottomRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width,
    height,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  permissionSubtext: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    letterSpacing: 1,
  },
  topHUD: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
  },
  hudButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudButtonSolid: {
    flex: 1,
    backgroundColor: '#0d1128',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudButtonActive: {
    backgroundColor: '#00e5ff',
  },
  hudButtonText: {
    fontSize: 24,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonBorder: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  controlButtonText: {
    fontSize: 28,
  },
  captureButtonWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: '#000000',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
  },
  captureButtonGradient: {
    flex: 1,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#000000',
  },
  // HUD Frame corners (angular aesthetic)
  frameTopLeft: {
    position: 'absolute',
    top: 100,
    left: 30,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00e5ff',
    opacity: 0.6,
  },
  frameTopRight: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00e5ff',
    opacity: 0.6,
  },
  frameBottomLeft: {
    position: 'absolute',
    bottom: 150,
    left: 30,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00e5ff',
    opacity: 0.6,
  },
  frameBottomRight: {
    position: 'absolute',
    bottom: 150,
    right: 30,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00e5ff',
    opacity: 0.6,
  },
});
