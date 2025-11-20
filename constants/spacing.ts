/**
 * Consistent spacing scale for SAYN app
 * Use these constants throughout the app for consistent spacing
 */

export const spacing = {
  xs: 4,      // Tight spacing
  sm: 8,      // Small spacing
  md: 12,     // Medium spacing
  base: 16,   // Default spacing
  lg: 20,     // Large spacing (screen padding)
  xl: 24,     // Extra large spacing (section spacing)
  '2xl': 32,  // Section spacing
  '3xl': 40,  // Large section spacing
  '4xl': 48,  // Extra large section spacing
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;
