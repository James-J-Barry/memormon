# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Memormon is a personal React Native (Expo) gift app — a Pokemon TCGP-style trading card game where the cards are real photos and memories from a relationship. The recipient opens time-gated packs to discover memory cards, collect them, and apply cosmetic upgrades earned by pulling duplicates. It runs via Expo Go on the recipient's phone; the creator manages all card/pack data from their laptop using the content pipeline.

## Commands

```bash
# Start dev server (choose platform interactively)
npm start

# Target a specific platform
npm run ios
npm run android

# Regenerate data/cards.ts and data/packs.ts from content/ JSON + copy images
npm run build-content
```

No linter, test suite, or type-check script is configured. TypeScript is enforced by the editor via `tsconfig.json`.

## Content pipeline

All card/pack authoring happens on the creator's laptop, never in-app.

- **Edit**: `content/cards.json` and `content/packs.json`
- **Images**: drop into `content/images/` (filenames must match the `image` field in cards.json)
- **Build**: `npm run build-content` — validates data, generates `data/cards.ts`, `data/packs.ts`, and `data/images.ts`, copies images to `assets/card-images/`
- **Never edit** `data/cards.ts`, `data/packs.ts`, or `data/images.ts` directly — they are auto-generated

After running build-content, restart the Expo dev server so the bundler picks up new image assets.

## Architecture

**Routing** — Expo Router (file-based). Screens in `app/`:
- `index.tsx` — home screen: pack timer countdown, collection progress, nav buttons, favorites display (planned)
- `packs.tsx` — horizontal carousel to choose which pack to open
- `open/[packId].tsx` — pack opening: swipe-up to open → tap to reveal cards one by one → summary
- `collection.tsx` — 3-column grid of all cards; uncollected show as `?`; filterable by pack
- `timeline.tsx` — all cards sorted chronologically; uncollected show date but `???` title
- `card/[cardId].tsx` — full card detail: photo, title, caption, date, rarity, cosmetic tier management, favorite button

**State** — single Zustand store (`store/useStore.ts`) persisted to AsyncStorage (`memormon-storage`). Holds the full collection (`Record<cardId, CollectionEntry>`), 3 favorites slots, and pack timer state. All mutations go through store actions.

**Data** — static TypeScript arrays (`CARDS`, `PACKS`) imported directly at build time. No network requests; all content is bundled.

**Pack mechanics**:
- Time gate: 2 packs max, one refills every 12 hours — intentionally slow so collecting takes a long time
- 5 cards per open (`openPack` in `services/packService.ts`)
- Rarity weights: everyday 50, favorite 28, milestone 14, epic 6, legendary 2
- Cards are revealed common-first, rarest last, with haptics scaling to rarity
- No bias toward new cards — duplicates are expected and intentional
- Cosmetic tiers unlock at 3 / 6 / 12 total copies of a card (Rose Frame, Starry Border, Golden Glow)

**Theme** — dark-only. Tokens in `theme/`: `colors.ts`, `typography.ts`, `spacing.ts`. Always use these — no inline color or spacing values. Font is Inter (loaded in `_layout.tsx` before any screen renders).

## Types

All types in `types/index.ts`: `Card`, `Pack`, `CollectionEntry`, `CosmeticTier`, `PackOpenResult`, `Rarity`.  
`Rarity` = `"everyday" | "favorite" | "milestone" | "epic" | "legendary"`.

## Current state / known gaps

Things implemented and working:
- Full pack opening flow with swipe gesture, animated reveal, NEW! badge, haptics, done summary
- Collection grid with pack filter and progress bar
- Timeline view
- Card detail with cosmetic tier unlock/apply
- Content pipeline and time-gate logic
- 1 pack ("High School Sweethearts") with 11 real cards; images exist in `content/images/`

Not yet built:
- **Photo display** — `expo-image` is installed but cards still show a `📷` placeholder. Images are ready in `assets/card-images/` after running build-content; they just need to be wired into the card UI in `open/[packId].tsx`, `card/[cardId].tsx`, and `collection.tsx`.
- **Favorites wall** — the store holds 3 favorite card slots and the detail screen has a "Set as Favorite" button, but nothing renders them. Intended design: favorites display as cards in the background of the home screen (`index.tsx`).
- **More packs** — the plan is several packs representing relationship chapters (e.g. first year of college, summer in Florida), with a couple hundred cards total so completion takes a very long time.

## Design philosophy

- Prioritize simplicity over features — this is a personal gift, not a shipped product
- Mechanics should make collecting feel slow and rewarding, not fast or easy
- Do not add duplicate-mitigation, pity timers, or anything that inflates pull rates
- Get things working with names/emojis before worrying about visual polish
