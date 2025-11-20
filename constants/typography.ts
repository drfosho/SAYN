/**
 * Consistent typography scale for SAYN app
 * Font sizes, weights, and line heights
 */

export const fontSize = {
  xs: 10,     // Tiny labels, badge text
  sm: 11,     // Small labels, tab labels
  base: 12,   // Caption text, helper text
  md: 13,     // Small body text
  lg: 14,     // Body text
  xl: 15,     // Large body text, input text
  '2xl': 16,  // Large text
  '3xl': 18,  // Heading 3
  '4xl': 20,  // Heading 2
  '5xl': 24,  // Heading 1
  '6xl': 28,  // Large heading
  '7xl': 32,  // Extra large heading
  '8xl': 36,  // Display text
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
