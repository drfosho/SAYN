import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ComicBorderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
  skewAngle?: number;
}

/**
 * Comic book style border component with thick black outlines and slight angle variations
 */
export const ComicBorder: React.FC<ComicBorderProps> = ({
  children,
  style,
  borderWidth = 4,
  borderColor = '#000000',
  skewAngle = 0,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          borderWidth,
          borderColor,
          transform: [{ skewY: `${skewAngle}deg` }],
        },
        style,
      ]}
    >
      {/* Inner content container to reverse skew */}
      <View style={{ transform: [{ skewY: `${-skewAngle}deg` }] }}>
        {children}
      </View>

      {/* Corner accent marks for comic book effect */}
      <View style={[styles.cornerAccent, styles.topLeft, { borderColor }]} />
      <View style={[styles.cornerAccent, styles.topRight, { borderColor }]} />
      <View style={[styles.cornerAccent, styles.bottomLeft, { borderColor }]} />
      <View style={[styles.cornerAccent, styles.bottomRight, { borderColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    // Slight shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0, // Hard shadow for comic effect
    elevation: 8,
  },
  cornerAccent: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});
