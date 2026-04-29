// ==========================================
// Pack opening logic — weighted random, no bias
// ==========================================

import { Card, PackOpenResult, Rarity } from "../types";
import { CARDS } from "../data/cards";
import { RARITY_CONFIG, RARITY_ORDER } from "../data/rarities";

/**
 * Pick a random rarity tier based on weights.
 * Weights: everyday=50, favorite=28, milestone=14, epic=6, legendary=2
 */
function rollRarity(availableRarities: Set<Rarity>): Rarity {
  // Build weighted pool from only rarities that have cards
  const pool: { rarity: Rarity; weight: number }[] = [];
  let totalWeight = 0;

  for (const rarity of RARITY_ORDER) {
    if (!availableRarities.has(rarity)) continue;
    const weight = RARITY_CONFIG[rarity].weight;
    pool.push({ rarity, weight });
    totalWeight += weight;
  }

  // Roll
  let roll = Math.random() * totalWeight;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.rarity;
  }

  // Fallback (should never reach here)
  return pool[pool.length - 1].rarity;
}

/** Pick a random element from an array */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Open a pack and get a list of cards.
 * Cards are sorted from most common to rarest (for reveal order).
 *
 * @param packId - which pack to open
 * @param cardCount - how many cards to draw (default 5)
 * @param collection - current collection state to determine isNew
 */
export function openPack(
  packId: string,
  cardCount: number = 5,
  collection: Record<string, { count: number }>
): PackOpenResult[] {
  // Get all cards in this pack
  const packCards = CARDS.filter((c) => c.packId === packId);
  if (packCards.length === 0) return [];

  // Group cards by rarity
  const byRarity: Record<string, Card[]> = {};
  for (const card of packCards) {
    if (!byRarity[card.rarity]) byRarity[card.rarity] = [];
    byRarity[card.rarity].push(card);
  }

  // Which rarities actually have cards in this pack?
  const availableRarities = new Set(Object.keys(byRarity) as Rarity[]);

  // Draw cards
  const results: PackOpenResult[] = [];
  for (let i = 0; i < cardCount; i++) {
    const rarity = rollRarity(availableRarities);
    const card = pickRandom(byRarity[rarity]);

    // Check if new
    const existing = collection[card.id];
    const currentCount = existing ? existing.count : 0;

    results.push({
      card,
      isNew: currentCount === 0,
      newCount: currentCount + 1,
    });
  }

  // Sort by rarity: commons first, rarest last
  results.sort((a, b) => {
    const aIndex = RARITY_ORDER.indexOf(a.card.rarity);
    const bIndex = RARITY_ORDER.indexOf(b.card.rarity);
    return aIndex - bIndex;
  });

  return results;
}
