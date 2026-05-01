// ==========================================
// All TypeScript types for MemoryMon
// ==========================================

/** The five rarity tiers, from most common to rarest */
export type Rarity = "everyday" | "favorite" | "milestone" | "epic" | "legendary";

/** A single memory card */
export type Card = {
  id: string;
  packId: string;
  title: string;
  caption: string;
  date: string; // "YYYY-MM-DD"
  rarity: Rarity;
  image: string; // filename in assets/card-images/
};

/** A themed pack (life chapter) */
export type Pack = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  coverColor: string; // hex color for gradient
  sortOrder: number;
};

/** Tracks a card in the player's collection */
export type CollectionEntry = {
  cardId: string;
  count: number; // total times pulled (1 = first, 2+ = has dupes)
  unlockedTiers: number[]; // cosmetic tier numbers unlocked
  appliedTier: number | null; // currently applied cosmetic tier
};

/** A cosmetic tier that can be unlocked for any card */
export type CosmeticTier = {
  tier: number; // 1, 2, or 3
  name: string; // "Rose Frame"
  dupsRequired: number; // total copies needed to unlock
  borderColor: string; // hex color
  borderWidth: number;
  glowColor?: string; // optional glow effect
};

/** Result of opening a single pack */
export type PackOpenResult = {
  card: Card;
  isNew: boolean; // true if this is the first time pulling this card
  newCount: number; // total copies after this pull
};
