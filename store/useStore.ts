// ==========================================
// Zustand store — all persistent app state
// ==========================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CollectionEntry } from "../types";

type Favorites = [string | null, string | null, string | null];

interface AppState {
  // Collection: cardId → entry
  collection: Record<string, CollectionEntry>;

  // Favorites wall (3 slots)
  favorites: Favorites;

  // Timer
  packsAvailable: number;
  lastPackTime: number; // timestamp in ms
  totalPacksOpened: number;

  // Actions
  addPull: (cardId: string) => void;
  unlockCosmetic: (cardId: string, tier: number) => void;
  applyCosmetic: (cardId: string, tier: number | null) => void;
  setFavorite: (slot: 0 | 1 | 2, cardId: string | null) => void;
  consumePack: () => void;
  refreshPacks: () => void;
}

// Time-gate config
const PACK_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_PACKS = 2;
const INITIAL_PACKS = 5;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      collection: {},
      favorites: [null, null, null],
      packsAvailable: INITIAL_PACKS,
      lastPackTime: 0,
      totalPacksOpened: 0,

      addPull: (cardId: string) => {
        set((state) => {
          const existing = state.collection[cardId];
          const newCount = existing ? existing.count + 1 : 1;

          return {
            collection: {
              ...state.collection,
              [cardId]: {
                cardId,
                count: newCount,
                unlockedTiers: existing?.unlockedTiers ?? [],
                appliedTier: existing?.appliedTier ?? null,
              },
            },
          };
        });
      },

      unlockCosmetic: (cardId: string, tier: number) => {
        set((state) => {
          const entry = state.collection[cardId];
          if (!entry) return state;

          return {
            collection: {
              ...state.collection,
              [cardId]: {
                ...entry,
                unlockedTiers: [...entry.unlockedTiers, tier],
              },
            },
          };
        });
      },

      applyCosmetic: (cardId: string, tier: number | null) => {
        set((state) => {
          const entry = state.collection[cardId];
          if (!entry) return state;

          return {
            collection: {
              ...state.collection,
              [cardId]: { ...entry, appliedTier: tier },
            },
          };
        });
      },

      setFavorite: (slot: 0 | 1 | 2, cardId: string | null) => {
        set((state) => {
          const newFavorites = [...state.favorites] as Favorites;
          newFavorites[slot] = cardId;
          return { favorites: newFavorites };
        });
      },

      consumePack: () => {
        set((state) => ({
          packsAvailable: Math.max(0, state.packsAvailable - 1),
          lastPackTime: Date.now(),
          totalPacksOpened: state.totalPacksOpened + 1,
        }));
      },

      refreshPacks: () => {
        set((state) => {
          if (state.packsAvailable >= MAX_PACKS) return state;

          const elapsed = Date.now() - state.lastPackTime;
          const newPacks = Math.floor(elapsed / PACK_COOLDOWN_MS);

          if (newPacks <= 0) return state;

          return {
            packsAvailable: Math.min(MAX_PACKS, state.packsAvailable + newPacks),
            lastPackTime: state.lastPackTime + newPacks * PACK_COOLDOWN_MS,
          };
        });
      },
    }),
    {
      name: "memormon-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
