# MemoryMon

A personal gift app — a Pokémon TCG-style memory card game where every card is a real photo and moment from your relationship. The recipient opens time-gated packs to discover memory cards, collects duplicates to unlock cosmetics, and browses a timeline of your shared history.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Card Creator Tool](#card-creator-tool)
   - [Opening the tool](#opening-the-tool)
   - [Creating packs](#creating-packs)
   - [Creating cards manually](#creating-cards-manually)
   - [Bulk importing from a ZIP](#bulk-importing-from-a-zip)
   - [Working through draft cards](#working-through-draft-cards)
   - [Exporting and building](#exporting-and-building)
4. [Testing the App](#testing-the-app)
   - [First-time setup](#first-time-setup)
   - [Running the dev server](#running-the-dev-server)
   - [Opening on your phone (Expo Go)](#opening-on-your-phone-expo-go)
   - [Dev shortcuts](#dev-shortcuts)
   - [Resetting app state](#resetting-app-state)
5. [Installing on iOS](#installing-on-ios)
   - [Option A — Expo Go (easy, requires Wi-Fi)](#option-a--expo-go-easy-requires-wi-fi)
   - [Option B — Standalone app via EAS Build (recommended for gifting)](#option-b--standalone-app-via-eas-build-recommended-for-gifting)
6. [Project Structure](#project-structure)
7. [Content Pipeline Reference](#content-pipeline-reference)
8. [App Mechanics Reference](#app-mechanics-reference)

---

## Overview

**You (the creator)** author all card and pack data on your laptop using the browser-based Card Creator tool, then run a build script to bundle everything into the app.

**The recipient** installs the app on their iPhone, opens packs at a rate of one pack every 12 hours (max 2 held at once), and collects the cards over days and weeks.

There is no server, no network requests, and no account — everything is stored locally on the recipient's phone.

---

## Prerequisites

- **Node.js 18 or later** (`node --version` to check)
- **npm** (comes with Node)
- **Expo Go** installed on your iPhone — free from the App Store

Install dependencies once after cloning:

```bash
npm install
```

---

## Card Creator Tool

The Card Creator is a browser-based web app at `tools/creator/index.html`. Open it directly in any browser — no server needed.

```bash
# On Mac:
open tools/creator/index.html
```

All data is saved automatically in your browser's `localStorage`. You can close and reopen it without losing work. Data persists until you clear your browser storage or export and start fresh.

---

### Opening the tool

Double-click `tools/creator/index.html`, or from Terminal:

```bash
open tools/creator/index.html        # Mac
start tools/creator/index.html       # Windows
```

The tool opens to a two-panel layout:
- **Left sidebar** — list of all packs, with card counts
- **Right panel** — forms for editing packs and cards

---

### Creating packs

Each pack represents a chapter of your relationship (e.g. "High School Sweethearts", "First Summer Together"). Cards belong to exactly one pack.

1. Click **+ New Pack** in the sidebar header
2. Fill in the fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Pack title shown in the app | `Summer in Florida` |
| **Emoji** | Icon for the pack cover | `🌴` |
| **Description** | Subtitle on the pack cover | `Sun, sand, and no responsibilities` |
| **Cover Color** | Background color of the pack gradient | Pick from color picker |

3. Click **Save Pack** — it appears in the sidebar

To edit a pack later, hover over it in the sidebar and click the **✏️** button. You can also delete a pack (this deletes all its cards too — you'll be warned first).

---

### Creating cards manually

1. Click a pack in the sidebar to select it
2. Click **+ Add Card** (top right of the card grid)
3. Fill in the fields:

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | ✅ | The card's name, shown in the info section |
| **Caption** | — | A short description of the memory (1–2 sentences) |
| **Date** | — | When this moment happened (YYYY-MM-DD) |
| **Rarity** | — | Controls pull probability and visual treatment |
| **Image Filename** | — | Filename of the photo in `content/images/` |
| **Preview Image** | — | Pick a local file to preview it in the card — does not affect export |

**Rarity guide:**

| Rarity | Symbol | Weight | Use for |
|--------|--------|--------|---------|
| Everyday | ♡ | 50% | Regular moments, day-to-day memories |
| Favorite | ♡♡ | 28% | Meaningful moments you both remember |
| Milestone | ★ | 14% | First times, anniversaries, big events |
| Epic | ★★ | 6% | Truly special memories with holo shimmer |
| Legendary | 👑 | 2% | The most important moments; rare pulls |

**Image filenames:**
- Flat: `beach.jpg` → place file at `content/images/beach.jpg`
- Subfolder: `florida/beach.jpg` → place file at `content/images/florida/beach.jpg`

The live preview on the right updates as you type.

Use **Save & Add Another** to quickly add multiple cards in a row.

---

### Bulk importing from a ZIP

For large batches of photos, use the ZIP import feature to create hundreds of draft cards in seconds, then fill in the details one by one.

#### Prepare your ZIP

Zip a folder of photos for one pack. The folder name becomes the image subfolder:

```
highschoolsweethearts/
├── prom.jpg
├── graduation.jpeg
├── firstdate.heic
└── ...
```

Zip it: `highschoolsweethearts.zip`

> **macOS tip:** Right-click the folder → "Compress" creates the right structure automatically.

#### Run the import

1. Click **📥 Import ZIP** in the top toolbar (blue button)
2. Select your `.zip` file
3. A progress bar shows while the tool:
   - Extracts every image from the zip
   - Reads the **EXIF `DateTimeOriginal`** metadata from each photo to pre-fill the date
   - Uses `0000-00-00` as a placeholder for photos with no EXIF date (screenshots, downloaded images, etc.)
   - Skips any image that already has a card (safe to run again after adding more photos)
4. A new pack named **"New Pack — edit me"** is created with all the draft cards

The tool detects the folder structure automatically:
- If all images share a single top-level folder inside the zip (typical macOS behavior), it uses that folder name
- Otherwise it uses the zip filename as the folder name

When done, you'll see a summary and next-step instructions.

---

### Working through draft cards

After a ZIP import, the pack will have many cards that need editing. The tool makes them easy to find:

- **Orange left border** on cards that still have `0000-00-00` as the date
- **"⚠ date needed"** shown instead of the date for placeholder cards
- **"X need review"** badge above the card grid
- **"X need dates"** counter in the pack's sidebar entry
- Draft cards sort to the **top of the grid** so you see them first

Click any card to edit it. You only need to fill in:
- **Title** — replace the auto-generated filename-based title
- **Caption** — write a sentence about the memory
- **Rarity** — decide how special this moment is
- **Date** — fix any `0000-00-00` placeholders

The image filename and EXIF date are already pre-filled where available.

---

### Exporting and building

Once your cards are ready:

#### Step 1 — Export from the creator

Click **📦 Export to content/** in the toolbar. This downloads two files:
- `packs.json`
- `cards.json`

A summary alert lists any cards with missing images or placeholder dates.

#### Step 2 — Move the JSON files

Move the downloaded files into the `content/` folder of the project:

```
content/
├── packs.json       ← replace with downloaded file
├── cards.json       ← replace with downloaded file
└── images/
    └── highschoolsweethearts/
        ├── prom.jpg
        └── ...
```

#### Step 3 — Add your images

Copy your images folder into `content/images/`:

```bash
cp -r ~/Downloads/highschoolsweethearts/ content/images/
```

#### Step 4 — Run the build script

```bash
npm run build-content
```

This validates the data, generates the TypeScript files the app imports, and copies all images to `assets/card-images/`. Example output:

```
📦 Building MemoryMon content…

   Found 2 packs and 47 cards
   ✅ Generated data/packs.ts and data/cards.ts
   ✅ Copied 47 images to assets/card-images/
   ✅ Generated data/images.ts

🎉 Done! Content is ready for the app.

   Rarity breakdown:
     ♡ everyday: 22 (46.8%)
     ♡♡ favorite: 13 (27.7%)
     ★ milestone: 7 (14.9%)
     ★★ epic: 3 (6.4%)
     👑 legendary: 2 (4.3%)
```

> ⚠️ **Never edit** `data/cards.ts`, `data/packs.ts`, or `data/images.ts` directly — they are overwritten every time you run `build-content`.

#### Step 5 — Restart the dev server

After adding new images you must restart the Expo dev server so the bundler picks them up:

```bash
# Stop the dev server with Ctrl+C, then:
npm start
```

---

## Testing the App

### First-time setup

```bash
npm install
```

Install **Expo Go** on your iPhone from the App Store. Make sure your phone and laptop are on the same Wi-Fi network.

---

### Running the dev server

```bash
npm start
```

This opens the Expo CLI in your terminal with a QR code. You'll see options to open on iOS Simulator, Android Emulator, or physical device.

To target a specific platform directly:

```bash
npm run ios        # Opens iOS Simulator (requires Xcode on Mac)
npm run android    # Opens Android Emulator
```

---

### Opening on your phone (Expo Go)

1. Open **Expo Go** on your iPhone
2. Tap **Scan QR Code**
3. Point your camera at the QR code in the terminal

The app loads over your local network. Any changes you save in the code hot-reload immediately on the phone.

If the QR code doesn't connect (different network, VPN, etc.), press **`t`** in the terminal to switch to **tunnel mode** — this routes traffic through Expo's servers and works from anywhere.

---

### Dev shortcuts

The following shortcuts are available during development and testing:

| Action | How |
|--------|-----|
| **Grant 2 packs** | Long-press the pack status / countdown timer on the home screen |
| **Reset all data** | Clear AsyncStorage — see below |

To quickly get back to a fresh state without reinstalling, clear the app's storage from the Settings screen, or use the following from the Expo dev menu:

1. Shake the phone (or press `m` in the terminal) to open the Expo Dev Menu
2. Tap **"Reload"** — this reloads JS without clearing storage

To fully reset collected cards and pack counts, clear `memorymon-storage` from AsyncStorage. The easiest way during development:

```js
// Run this in a temporary useEffect or in the Expo JS console:
import AsyncStorage from "@react-native-async-storage/async-storage";
AsyncStorage.removeItem("memorymon-storage");
```

---

### Resetting app state

The Zustand store persists under the key `memorymon-storage` in AsyncStorage. To wipe all collection data and start fresh:

1. Go to **Settings** in the app
2. Alternatively, uninstall and reinstall Expo Go (nuclear option)

---

## Installing on iOS

There are two ways to put MemoryMon on an iPhone: the quick dev method using Expo Go, and the proper standalone app method using EAS Build.

---

### Option A — Expo Go (easy, requires Wi-Fi)

This is how testing works and is fine for your own device. The downside is the recipient needs Expo Go installed and both devices need to be on the same network (or you use tunnel mode).

**Steps:**

1. Make sure your laptop and the recipient's iPhone are on the same Wi-Fi, OR press `t` in the terminal to enable tunnel mode
2. Run `npm start`
3. Have the recipient:
   - Install **Expo Go** from the App Store
   - Open Expo Go → **Scan QR Code**
   - Scan the QR code from your terminal

**Limitations of Expo Go:**
- The dev server must be running on your laptop for the app to work
- If you stop the server, the app stops working
- Not ideal for a gift that needs to work independently

---

### Option B — Standalone app via EAS Build (recommended for gifting)

EAS Build compiles a real `.ipa` file that installs directly on an iPhone without needing Expo Go or a running server. This is the right approach for giving MemoryMon as a gift.

#### Do I need a paid Apple Developer account?

**Short answer: yes, if you want the app to last.**

Apple requires all apps installed outside the App Store to be cryptographically signed. There are two tiers:

| Method | Cost | App lifespan | Notes |
|--------|------|-------------|-------|
| **Free Apple ID** (Xcode direct) | Free | **7 days**, then expires | Fine for testing on your own phone this week; terrible for a gift |
| **Apple Developer Program** | $99/year | 1 year from signing date | The installed app keeps working even after your subscription lapses |

If you're not ready to pay $99/year yet, keep using Option A (Expo Go) while you're still building the app, then get the developer account when you're ready to actually give it to her. You only need the account once to produce a signed build — after that the app runs on her phone independently for a year.

**Prerequisites:**
- An [Expo account](https://expo.dev) (free)
- An [Apple Developer account](https://developer.apple.com) ($99/year)
- EAS CLI installed: `npm install -g eas-cli`

#### Setup (one time)

```bash
# Log in to your Expo account
eas login

# Initialize EAS in the project
eas build:configure
```

This creates an `eas.json` file. For ad hoc distribution (install directly on specific devices), use this config:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

#### Register the recipient's device

You need to register Avery's iPhone with Apple before building:

```bash
eas device:create
```

This gives you a link to send to the recipient — they open it on their iPhone, which installs an Apple profile that registers their device ID with your Apple Developer account.

#### Build the app

```bash
eas build --platform ios --profile preview
```

EAS builds the app in the cloud (no Xcode required on your machine). The build takes about 10–15 minutes. When done, EAS gives you a download link.

#### Install on the iPhone

**Method 1 — EAS link (easiest):**
After the build completes, EAS emails you (and optionally the recipient) a direct install link. The recipient opens the link on their iPhone → taps Install → the app installs like any app.

**Method 2 — Via Xcode:**
Download the `.ipa` from the EAS dashboard, connect the iPhone via USB, open Xcode → Window → Devices and Simulators, drag the `.ipa` to the device.

**Method 3 — Via Apple Configurator 2:**
Download from the Mac App Store, connect iPhone via USB, drag and drop the `.ipa` file.

#### Free option: Xcode direct install (7-day expiry)

If you just want to install the app on one phone right now without paying for a developer account, Xcode can sign it with a free Apple ID:

```bash
# Build and install directly to a connected iPhone (no EAS, no paid account)
npx expo run:ios --device
```

Requirements:
- Xcode installed on your Mac
- iPhone connected via USB and trusted on the Mac
- A free Apple ID signed into Xcode (Preferences → Accounts)

The app will install and work normally — but after **7 days** the certificate expires and the app will refuse to launch until you reinstall it. Plug in the phone and run the command again to get another 7 days.

---

#### TestFlight (for ongoing updates)

If you plan to update the app after gifting, TestFlight is cleaner — it lets you push updates and Avery gets a notification to update:

1. Change `eas.json` distribution to `"store"` instead of `"internal"`
2. `eas build --platform ios --profile store`
3. Submit to TestFlight: `eas submit --platform ios`
4. Add Avery as an external tester in App Store Connect

---

## Project Structure

```
memorymon/
├── app/                        # Screens (Expo Router file-based routing)
│   ├── _layout.tsx             # Root layout: fonts, gesture handler, status bar
│   ├── index.tsx               # Home: pack timer, collection progress, nav
│   ├── packs.tsx               # Pack selection carousel
│   ├── open/[packId].tsx       # Pack opening flow (5 phases)
│   ├── collection.tsx          # Card grid with pack filter
│   ├── timeline.tsx            # Chronological card list
│   ├── card/[cardId].tsx       # Card detail: cosmetics, favorite
│   └── settings.tsx            # Theme, haptics, reveal speed
│
├── components/
│   ├── Card.tsx                # The trading card component (never themed)
│   ├── CardBack.tsx            # Face-down card placeholder
│   ├── PackCover.tsx           # Pack front cover with gradient
│   └── BackgroundParticles.tsx # Floating gold particles (all screens)
│
├── content/                    # Source content (you edit these)
│   ├── packs.json              # Pack definitions
│   ├── cards.json              # Card definitions
│   └── images/                 # Card photos, organized by pack
│       └── highschoolsweethearts/
│           └── photo.jpg
│
├── data/                       # Auto-generated — never edit manually
│   ├── packs.ts
│   ├── cards.ts
│   ├── images.ts
│   └── rarities.ts             # Hand-authored rarity config (safe to edit)
│
├── hooks/
│   └── useTheme.ts             # Returns light or dark UIColors from store
│
├── services/
│   ├── packService.ts          # Pack opening logic and rarity weights
│   └── timerService.ts         # Pack cooldown countdown
│
├── store/
│   └── useStore.ts             # Zustand store (persisted to AsyncStorage)
│
├── theme/
│   ├── colors.ts               # Light/dark palettes + card colors
│   ├── typography.ts           # Font families and sizes
│   └── spacing.ts              # Spacing tokens and border radii
│
├── tools/
│   ├── build-content.js        # Content pipeline build script
│   └── creator/                # Browser-based card creator
│       ├── index.html
│       ├── app.js
│       └── style.css
│
├── types/
│   └── index.ts                # Card, Pack, CollectionEntry, etc.
│
├── assets/
│   ├── card-images/            # Auto-copied by build-content
│   └── *.png                   # App icons and splash screen
│
├── app.json                    # Expo configuration
├── babel.config.js             # Babel: expo preset + reanimated plugin
├── tsconfig.json               # TypeScript: strict mode
└── package.json
```

---

## Content Pipeline Reference

The full loop from new photos to working app:

```
1. Add photos to content/images/packname/
         ↓
2. Open tools/creator/index.html in a browser
         ↓
3. Import ZIP  ──or──  Create cards manually
         ↓
4. Edit draft cards (title, caption, rarity, date)
         ↓
5. Click "Export to content/" → download packs.json + cards.json
         ↓
6. Move JSON files to content/
         ↓
7. npm run build-content
         ↓
8. Restart npm start
```

---

## App Mechanics Reference

### Pack timer

- Maximum 2 packs held at once
- One pack refills every 12 hours
- Starts with 5 packs (for testing/onboarding)
- **Long-press the timer** on the home screen to grant 2 packs (debug shortcut)

### Pack opening

Each pack reveals 5 cards. Cards are drawn with these weights:

| Rarity | Pull chance |
|--------|-------------|
| Everyday | 50% |
| Favorite | 28% |
| Milestone | 14% |
| Epic | 6% |
| Legendary | 2% |

Cards are revealed in order: commons first, rarest last. There is no pity timer or duplicate protection — duplicates are intentional and required for cosmetics.

### Cosmetics

Collecting duplicates of the same card unlocks cosmetic frames. Only one cosmetic can be active per card at a time.

| Tier | Name | Copies Required | Effect |
|------|------|----------------|--------|
| 1 | Rose Frame | 3 | Pink border |
| 2 | Starry Border | 6 | Purple border + glow |
| 3 | Golden Glow | 12 | Gold border + strong glow + holo shimmer |

### Settings

Accessible via the **Settings** button on the home screen:

| Setting | Options | Default |
|---------|---------|---------|
| Theme | Light / Dark | Light |
| Haptic Feedback | On / Off | On |
| Card Reveal Speed | Normal / Slow | Normal |

Slow reveal speed slows rip animation (~1.7×), card swipe timing, and entrance spring for a more cinematic feel.
