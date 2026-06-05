# Stash — React Native (Expo) Mobile App

A pixel-faithful mobile port of the Stash web app. Local-first visual inbox
with client-side auto-categorization, FTS5-style full-text search,
on-device OCR ingestion pipeline, and the same premium dark glass
aesthetic across every screen.

## Stack

- **Expo SDK 51** (React Native 0.74, TypeScript)
- **AsyncStorage** for local persistence (FTS5-style search)
- **react-native-reanimated 3** for spring/timing animations
- **expo-blur** for the dark glass panels
- **expo-image / expo-image-picker** for image loading & ingestion
- **expo-clipboard** for the OCR Copy All action
- **lucide-react-native** for icons
- **react-native-svg** for the diagonal-gradient micro borders

## Run

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start          # then press i / a for iOS / Android
```

## Layout

- `App.tsx` — root, holds state, mounts the device chrome + tab routing
- `src/types.ts` — shared type definitions
- `src/database.ts` — local-first store with tokenized FTS-style search
- `src/theme/colors.ts` — design tokens (radii, spacing, palette)
- `src/components/`
  - `GlassPanel.tsx` — premium dark glass primitive
  - `GradientBorder.tsx` — diagonal 1px sheen border (SVG)
  - `StatusBarMock.tsx` — iOS-style status bar (time, signal, battery)
  - `BackgroundOrbs.tsx` — slow-floating radial gradient orbs
  - `AppHeader.tsx` — STASH brand + sync indicator + INGEST chip
  - `SearchInterceptor.tsx` — sticky search bar with match counter
  - `MasonryGrid.tsx` — 2-column staggered masonry + shimmer skeleton
  - `BottomBar.tsx` — master glass nav (Stash / Categories / Profile + Add)
  - `CategoriesTab.tsx` — horizontal lens carousel
  - `SettingsTab.tsx` — encryption command deck
  - `AddStashModal.tsx` — 4-step ingest pipeline + presets
  - `FocusInspector.tsx` — bottom-sheet asset inspector with OCR block
- `src/screens/`
  - `StashScreen.tsx` — Screen 1: Visual grid stream
  - `CategoriesScreen.tsx` — Screen 3: Smart library explorer
  - `ProfileScreen.tsx` — Screen 4: Encryption command deck

## Design parity

Every visual rule from the source spec is preserved:

- No solid white blocks — all panels use `rgba(255,255,255,0.03-0.06)` glass
- One master bottom-bar component shared across all tabs
- Identical masonry card primitive between Screen 1 and Screen 3
- Pure white text (`#FFFFFF`) for primary, `#8A8A93` for secondary
- 16px corner radius on all glass panels
- Diagonal 1px sheen border on every glass surface
- Springy `layoutId` analog on tab nav and category selection via Reanimated
- Bottom fade mask on the stash feed blending into the bottom bar
