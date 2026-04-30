// ==========================================
// Color palette — warm dark theme
// ==========================================

export const colors = {
  // App UI
  bg: "#0d0b12",
  surface: "#1c1826",
  surfaceLight: "#2a2438",
  text: "#f2edd8",
  textMuted: "#7a7490",
  border: "#2e2840",
  accent: "#d4a853",

  // Card physical design (the trading card itself)
  cardFrame: "#f0e8d0",    // thick ivory outer border — the signature TCG look
  cardInfo: "#faf3e8",     // cream info section background
  cardInfoText: "#1a1020", // near-black title text on cream
  cardInfoMuted: "#6a6080",// muted text on cream (caption, date)
  cardImageBg: "#16121f",  // dark fill behind photo while loading

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
