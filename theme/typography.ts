// ==========================================
// Typography
// ==========================================

// UI font — Inter (all screens, navigation, labels)
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

// Display font — Playfair Display (card titles only)
export const displayFonts = {
  regular: "PlayfairDisplay_400Regular",
  italic: "PlayfairDisplay_400Regular_Italic",
  bold: "PlayfairDisplay_700Bold",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;
