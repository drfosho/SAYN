import React from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle } from 'react-native';

interface SAYNLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  withGlow?: boolean;
}

/**
 * SAYNLogo - Reusable SAYN logo component with optional glow effect
 * Uses the official SAYN LOGO.png from assets
 */
export const SAYNLogo: React.FC<SAYNLogoProps> = ({
  size = 'medium',
  withGlow = true
}) => {
  const dimensions = {
    small: 40,
    medium: 80,
    large: 120,
    xlarge: 180,
  }[size];

  const logoStyle: ImageStyle = {
    width: dimensions,
    height: dimensions,
    resizeMode: 'contain',
  };

  const glowStyle: ViewStyle = {
    width: dimensions * 1.5,
    height: dimensions * 1.5,
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/SAYN LOGO.png')}
        style={logoStyle}
      />
      {withGlow && (
        <View style={[styles.glowEffect, glowStyle]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    zIndex: -1,
  },
});
