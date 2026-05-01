// ==========================================
// Color palette
// ==========================================

// UI colors — change with theme (screens and chrome only)
export type UIColors = {
  bg: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
};

export const darkColors: UIColors = {
  bg: "#0d0b12",
  surface: "#1c1826",
  surfaceLight: "#2a2438",
  text: "#f2edd8",
  textMuted: "#7a7490",
  border: "#2e2840",
  accent: "#d4a853",
};

export const lightColors: UIColors = {
  bg: "#faf6ef",
  surface: "#f2ebe0",
  surfaceLight: "#e8dfd0",
  text: "#1a1020",
  textMuted: "#7a6e80",
  border: "#d4c9bc",
  accent: "#b8841e",
};

// Full palette including card & rarity colors — used by Card, CardBack, PackCover.
// These never change with theme; the card is always its own dark TCG world.
export const colors = {
  ...darkColors,

  // Card physical design (the trading card itself)
  cardFrame: "#f0e8d0",
  cardInfo: "#faf3e8",
  cardInfoText: "#1a1020",
  cardInfoMuted: "#6a6080",
  cardImageBg: "#16121f",

  // Rarity colors
  everyday: "#9a9aa8",
  favorite: "#e8a0bf",
  milestone: "#f0c75e",
  epic: "#9b7dff",
  legendary: "#ffd700",
} as const;

/** Get the color for a given rarity */
export function rarityColor(rarity: string): string {
  return colors[rarity as keyof typeof colors] ?? colors.textMuted;
}
