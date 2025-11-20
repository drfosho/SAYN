/**
 * Common layout dimensions for SAYN app
 */

export const layout = {
  // Screen padding
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,

  // Header
  headerHeight: 60,
  headerTitleSize: 24,

  // Tab bar
  tabBarHeight: 85,
  tabIconSize: 26,
  tabIconSizeCenter: 30,

  // Avatar sizes
  avatarXs: 32,
  avatarSm: 40,
  avatarMd: 50,
  avatarLg: 80,
  avatarXl: 120,
  avatar2xl: 140,

  // Badge dimensions
  badgeHeight: 26,
  badgeMaxWidth: 120,
  badgePaddingHorizontal: 8,
  badgePaddingVertical: 4,
  badgeRadius: 10,

  // Buttons
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonRadius: 12,
  buttonRadiusSmall: 10,

  // Cards
  cardRadius: 20,
  cardPadding: 16,
  cardMarginHorizontal: 20,
  cardMarginVertical: 12,

  // Input fields
  inputHeight: 52,
  inputRadius: 12,
  inputPaddingHorizontal: 15,
  inputPaddingVertical: 12,

  // Modal
  modalMaxWidth: 400,
  modalRadius: 24,
  modalPadding: 24,

  // Border widths
  borderThin: 1,
  borderMedium: 2,
  borderThick: 3,
  borderExtraThick: 4,
} as const;

export type Layout = typeof layout;
