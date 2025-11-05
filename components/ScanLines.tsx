import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScanLinesProps {
  opacity?: number;
  lineHeight?: number;
  spacing?: number;
}

/**
 * Tech-style scan lines overlay for intensity and depth
 * Adds subtle horizontal lines for a powerful, technical aesthetic
 */
export const ScanLines: React.FC<ScanLinesProps> = ({
  opacity = 0.05,
  lineHeight = 2,
  spacing = 4,
}) => {
  // Calculate number of lines needed based on standard screen height
  const numberOfLines = Math.floor(800 / (lineHeight + spacing));

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: numberOfLines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.line,
            {
              height: lineHeight,
              marginBottom: spacing,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  line: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
});
