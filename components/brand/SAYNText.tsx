import React from 'react';
import { Text, View, StyleSheet, TextStyle } from 'react-native';

interface SAYNTextProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  withGlow?: boolean;
}

/**
 * SAYNText - Brand typography component matching the SAYN app loading logo style
 * Features: Extra bold, wide letter spacing, cyan glow effect
 */
export const SAYNText: React.FC<SAYNTextProps> = ({
  size = 'medium',
  withGlow = true
}) => {
  const fontSize = {
    small: 18,
    medium: 28,
    large: 42,
    xlarge: 56,
  }[size];

  const textStyle: TextStyle = {
    fontSize,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: size === 'small' ? 4 : size === 'medium' ? 6 : 8,
    textTransform: 'uppercase',
    textShadowColor: withGlow ? '#00d4ff' : '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: withGlow ? 20 : 2,
    fontStyle: 'italic', // Angular style matching logo
  };

  return (
    <View style={styles.container}>
      <Text style={textStyle}>SAYN</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
