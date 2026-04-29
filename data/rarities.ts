// ==========================================
// Rarity configuration — symbols, labels, weights
// ==========================================

import { Rarity, CosmeticTier } from "../types";
import { colors } from "../theme/colors";

/** Display info for each rarity tier */
export const RARITY_CONFIG: Record<
  Rarity,
  { label: string; symbol: string; color: string; weight: number }
> = {
  everyday: { label: "Everyday", symbol: "♡", color: colors.everyday, weight: 50 },
  favorite: { label: "Favorite", symbol: "♡♡", color: colors.favorite, weight: 28 },
  milestone: { label: "Milestone", symbol: "★", color: colors.milestone, weight: 14 },
  epic: { label: "Epic", symbol: "★★", color: colors.epic, weight: 6 },
  legendary: { label: "Legendary", symbol: "👑", color: colors.legendary, weight: 2 },
};

/** Ordered list of rarities from common to rare (used for sorting reveals) */
export const RARITY_ORDER: Rarity[] = [
  "everyday",
  "favorite",
  "milestone",
  "epic",
  "legendary",
];

/** Cosmetic tiers unlocked by collecting duplicates */
export const COSMETIC_TIERS: CosmeticTier[] = [
  {
    tier: 1,
    name: "Rose Frame",
    dupsRequired: 3,
    borderColor: "#e8a0bf",
    borderWidth: 2,
  },
  {
    tier: 2,
    name: "Starry Border",
    dupsRequired: 6,
    borderColor: "#9b7dff",
    borderWidth: 3,
    glowColor: "rgba(155, 125, 255, 0.3)",
  },
  {
    tier: 3,
    name: "Golden Glow",
    dupsRequired: 12,
    borderColor: "#ffd700",
    borderWidth: 3,
    glowColor: "rgba(255, 215, 0, 0.4)",
  },
];
