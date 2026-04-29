// ==========================================
// Color palette — minimalist dark theme
// ==========================================

export const colors = {
  // Base
  bg: "#0f0f13",
  surface: "#1a1a24",
  surfaceLight: "#24243a",
  text: "#f5f5f7",
  textMuted: "#8e8e9a",
  border: "#2a2a3a",
  accent: "#c9a0dc",

  // Rarity colors
  everyday: "#8e8e9a",
  favorite: "#e8a0bf",
  milestone: "#f0c75e",
  epic: "#9b7dff",
  legendary: "#ffd700",
} as const;

/** Get the color for a given rarity */
export function rarityColor(rarity: string): string {
  return colors[rarity as keyof typeof colors] ?? colors.textMuted;
}
