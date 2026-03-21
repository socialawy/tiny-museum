# Devlog

## Phase 0: `docs\BLUEPRINT.md`

---

## Phase 0.5: Bootstrap Execution Plan — Git Init → Running Canvas

---

## Phase 1: The Sketchbook (MVP)
*Completed: 2026-03-20*

The goal of Phase 1 was to establish the "Core Loop": Draw → Save → View in Gallery.

### Key Milestones
- **Bootstrap & Scaffold**: Set up the project structure with Next.js, Fabric.js, and Dexie.js (IndexedDB).
- **Core Canvas**: Implemented freehand drawing with kid-friendly brushes (Crayon, Pencil, Marker, Spray).
- **Studio UI**: Created a custom toolbar with bold colors and simple touch targets.
- **Storage Layer**: Built a robust local storage system using Dexie.js to store artworks, thumbnails, and room data.
- **Museum Gallery**: Created two primary views for exploring art:
    - **Museum Walk**: A horizontal, immersive scrolling view where art hangs on the wall.
    - **Grid View**: A flexible layout for quickly browsing the collection.
- **Exhibit View**: A dedicated detail view for each artwork, featuring rename, favorite, and delete capabilities.

### Critical Fixes
- **Fabric.js Stability**: Integrated null guards for brushes and handled SSR issues with dynamic imports.
- **Parent Gate**: Implemented a "Grown-Up Check" (simple multiplication) to protect destructive actions like deletion.
- **HMR/Strict Mode**: Handled double-rendering issues in development to prevent canvas duplication.

---

## Phase 2: Import & Collage
*Completed: 2026-03-20*

Phase 2 expanded the creative possibilities with image imports, stickers, and shapes.

### Key Milestones
- **Import Pipeline**: Added support for importing images via Camera capture and local file selection (PNG, JPEG, SVG).
- **Collage Tools**:
    - **Shapes**: Instant circles, squares, stars, and hearts.
    - **Stickers**: A library of 24+ emoji-based stickers that can be added and scaled.
- **Select & Transform**: Implemented a "Direct Select" (👆) mode to move, resize, and rotate objects on the canvas.
- **Auto-Save**: Implemented a background auto-save system (30s interval) using `requestIdleCallback` to prevent jank.
- **Room Management**: Added the ability for kids (and parents) to create multiple rooms and organize art by theme.
- **Performance Polish**: Migrated thumbnail and full-res storage to optimized Data URLs to eliminate "Blob URL expired" errors.

### Stability & UX
- **Testing Suite**: Set up Vitest and implemented 20+ unit tests covering storage CRUD and canvas history logic.
- **Touch Layer**: Rewrote the touch gesture handler to properly distinguish between drawing and selecting/transforming.
- **History Fixes**: Corrected undo/redo logic to support both freehand paths and complex objects (shapes/stickers).

---

## Phase 2.1: Polish Sprint
*Completed: 2026-03-20*

Final touches to make the experience feel "premium" and delightful.

### Features
- **Sound System**: Procedurally generated audio feedback for every interaction (save, sparkle, switch, delete).
- **Entrance Animations**: Added staggered CSS animations for a "wow" effect when entering the gallery.
- **Status Indicators**: Added a visual pulse when the Eraser is active to clarify drawing mode.
- **Sound Toggle**: Global mute/unmute control in the gallery and home screen.

---

## Project Status: PHASE 2 COMPLETE ✅

### Current State
- [x] Core drawing & toolset
- [x] Image/Sticker/Shape collage workflow
- [x] Immersive Museum & Grid views
- [x] Multi-room organization
- [x] Offline-first PWA (IndexedDB)
- [x] Procedural Sound & Micro-animations
- [x] Unit Testing Coverage (Core Data)

**ALL GREEN**

![alt text](image-2.png)

### Deaitled log for previous phases `local-files\OLDLOG.md`

---

## Phase 3: Flipbook Animator 🎬

The feature that turns drawings into magic. A 7-year-old making first animation — that's a core memory.

### Design Philosophy
```
NOT THIS:                    THIS:
┌─────────────────┐         ┌─────────────────┐
│ Timeline         │         │                 │
│ ▶ ■ ◀ │◀ ▶│    │         │   Draw here     │
│ Layer 1 ═══════ │         │                 │
│ Layer 2 ═══════ │         │   (big canvas)  │
│ Keyframe editor │         │                 │
│ Easing curves   │         ├─────────────────┤
│ (After Effects) │         │ ◀ Frame 3/8 ▶  │
└─────────────────┘         │ [👻] [▶ Play]   │
                            └─────────────────┘

 Complex, overwhelming        Simple, tactile
 for a professional           like flipping a notebook
 ```

 ### Architecture
```
FLIPBOOK DATA MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Flipbook
  ├── id: string
  ├── title: string
  ├── fps: number (2-12, default 4)
  ├── frames: Frame[]
  │   ├── Frame 0: { canvasJSON, thumbnail }
  │   ├── Frame 1: { canvasJSON, thumbnail }
  │   ├── Frame 2: { canvasJSON, thumbnail }
  │   └── ...
  └── metadata (room, tags, dates)

CANVAS FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Draw on Frame 3
       │
       ├── Onion skin: Frame 2 visible at 30% opacity
       │
       ├── Tap ▶ → next frame (auto-saves current)
       ├── Tap ◀ → prev frame
       ├── Tap ＋ → new blank frame (or duplicate)
       ├── Tap 👻 → toggle onion skin
       ├── Tap ▶ Play → animate all frames in sequence
       └── Tap 🏛️ → export GIF → save to gallery
```

### 1. Data Model Extension

- src/lib/storage/db.ts — REPLACED ENTIRE FILE

### 2. Flipbook Storage

- src/lib/storage/flipbook.ts — NEW

### 3. GIF Export

- src/lib/export/gif.ts — NEW

### 4. Flipbook Canvas Component

- src/components/flipbook/FlipbookStudio.tsx — NEW

### 5. Frame Strip Component

- src/components/flipbook/FrameStrip.tsx — NEW

### 6. Playback Overlay

- src/components/flipbook/PlaybackOverlay.tsx — NEW

### 7. Route + Page

- src/app/studio/flipbook/page.tsx — NEW

### 8. Add Flipbook Entry to Home + Gallery

- src/app/page.tsx — Add Flipbook Door
Added a third option below the two big doors:

**Navigate to /studio/flipbook** 
- should see a frame-by-frame animation studio with frame strip, navigation, speed control, and a play button. Draw on frame 1, tap ＋, draw on frame 2, hit ▶️
```bash
PS E:\co\tiny-museum> npm run format

> tiny-museum@0.1.0 format
> prettier --write "src/**/*.{ts,tsx,css}"

src/app/gallery/[artworkId]/page.tsx 84ms (unchanged)
src/app/gallery/page.tsx 19ms (unchanged)
src/app/layout.tsx 11ms (unchanged)
src/app/page.tsx 13ms
src/app/studio/canvas/page.tsx 6ms (unchanged)
src/app/studio/flipbook/page.tsx 6ms
src/app/studio/layout.tsx 6ms (unchanged)
src/assets/stickers/index.ts 16ms (unchanged)
src/components/canvas/BackgroundPicker.tsx 16ms (unchanged)
src/components/canvas/ImportPanel.tsx 43ms (unchanged)
src/components/canvas/ShapePanel.tsx 8ms (unchanged)
src/components/canvas/StickerPanel.tsx 14ms (unchanged)
src/components/canvas/StudioCanvas.tsx 45ms (unchanged)
src/components/canvas/Toolbar.tsx 31ms (unchanged)
src/components/flipbook/FlipbookStudio.tsx 39ms
src/components/flipbook/FrameStrip.tsx 5ms (unchanged)
src/components/flipbook/PlaybackOverlay.tsx 20ms (unchanged)
src/components/gallery/ArtworkCard.tsx 19ms (unchanged)
src/components/gallery/CreateRoomDialog.tsx 9ms (unchanged)
src/components/gallery/GalleryGrid.tsx 85ms (unchanged)
src/components/gallery/MuseumWalk.tsx 4ms (unchanged)
src/components/gallery/RoomSelector.tsx 7ms (unchanged)
src/components/ui/BigButton.tsx 7ms (unchanged)
src/components/ui/Celebrations.tsx 7ms (unchanged)
src/components/ui/FriendlyDialog.tsx 4ms (unchanged)
src/components/ui/ParentGate.tsx 8ms (unchanged)
src/components/ui/SoundToggle.tsx 4ms (unchanged)
src/hooks/useBlobUrl.ts 3ms (unchanged)
src/hooks/useFabricCanvas.ts 14ms (unchanged)
src/hooks/useSounds.ts 2ms (unchanged)
src/lib/audio/sounds.ts 11ms (unchanged)
src/lib/export/gif.ts 31ms (unchanged)
src/lib/fabric/__tests__/history.test.ts 11ms (unchanged)
src/lib/fabric/history.ts 10ms (unchanged)
src/lib/fabric/setup.ts 4ms (unchanged)
src/lib/fabric/shapes.ts 17ms (unchanged)
src/lib/fabric/stickers.ts 6ms (unchanged)
src/lib/fabric/tools.ts 4ms (unchanged)
src/lib/fabric/touch.ts 9ms (unchanged)
src/lib/import/camera.ts 3ms (unchanged)
src/lib/import/cleanup.ts 7ms (unchanged)
src/lib/import/file.ts 4ms (unchanged)
src/lib/storage/__tests__/artworks.test.ts 10ms (unchanged)
src/lib/storage/__tests__/migrate.test.ts 4ms (unchanged)
src/lib/storage/__tests__/rooms.test.ts 7ms (unchanged)
src/lib/storage/artworks.ts 15ms (unchanged)
src/lib/storage/db.ts 5ms (unchanged)
src/lib/storage/flipbook.ts 13ms (unchanged)
src/lib/storage/migrate.ts 3ms (unchanged)
src/lib/storage/rooms.ts 4ms (unchanged)
src/stores/gallery.store.ts 5ms (unchanged)
src/stores/ui.store.ts 4ms (unchanged)
src/styles/globals.css 37ms (unchanged)
src/test/setup.ts 4ms (unchanged)
src/types/global.d.ts 1ms (unchanged)
PS E:\co\tiny-museum> npm run typecheck

> tiny-museum@0.1.0 typecheck
> tsc --noEmit

PS E:\co\tiny-museum> git commit -m "Phase 2 complete: Import studio, stickers, shapes, rooms, sounds, 20 tests
>>
>> Features:
>> - Camera capture + file import with auto-enhance
>> - Background picker (6 options)
>> - Shape insertion (circle, square, star, heart)
>> - Sticker system (24 emoji stickers in 3 packs)
>> - Select/Move/Resize mode
>> - Room creation + management
>> - Sound effects (procedural Web Audio, no files)
>> - Gallery entrance animations
>> - Friendly delete dialog + parent gate
>> - Auto-save every 30 seconds
>>
>> Quality:
>> - 20 unit tests passing (artworks, rooms, history, migrations)
>> - Prettier + TypeScript strict
>> - Blob URL sanitization (3-layer defense)
>> - Self-hosted fonts (Nunito via next/font)"
PS E:\co\tiny-museum> git commit -m "Phase 2 complete: Import studio, stickers, shapes, rooms, sounds, 20 tests
>> 
>> Features:
>> - Camera capture + file import with auto-enhance
>> - Background picker (6 options)
>> - Shape insertion (circle, square, star, heart)
>> - Sticker system (24 emoji stickers in 3 packs)
>> - Select/Move/Resize mode
>> - Room creation + management
>> - Sound effects (procedural Web Audio, no files)
>> - Gallery entrance animations
>> - Friendly delete dialog + parent gate
>> - Auto-save every 30 seconds
>>
>> Quality:
>> - 20 unit tests passing (artworks, rooms, history, migrations)
>> - Prettier + TypeScript strict
>> - Blob URL sanitization (3-layer defense)
>> - Self-hosted fonts (Nunito via next/font)"
PS E:\co\tiny-museum> npx vitest run 

 RUN  v4.1.0 E:/co/tiny-museum

 ✓ src/lib/fabric/__tests__/history.test.ts (6 tests) 8ms
stdout | src/lib/storage/__tests__/migrate.test.ts > cleanExpiredBlobUrls > replaces blob URLs in canvasJSON
🧹 Cleaned blob URLs from 1 artwork(s)

 ✓ src/lib/storage/__tests__/migrate.test.ts (3 tests) 24ms
 ✓ src/lib/storage/__tests__/rooms.test.ts (3 tests) 25ms
 ✓ src/lib/storage/__tests__/artworks.test.ts (8 tests) 82ms                            
                                                                                        
 Test Files  4 passed (4)                                                               
      Tests  20 passed (20)                                                             
   Start at  22:38:50                                                                   
   Duration  1.11s (transform 233ms, setup 736ms, import 403ms, tests 139ms, environment 1.99s)
```

![alt text](image-3.png)
![alt text](image-4.png)

---

## Phase 3: Flipbook Animator ✅
*Completed: 2026-03-21*

Frame-by-frame animation studio. A 7-year-old making their first animation — that's a core memory.

### Key Milestones
- **Flipbook Studio** (`/studio/flipbook`): Full-screen canvas with onion skinning, frame navigation (◀ ▶), frame strip thumbnail row.
- **Frame Management**: Add blank frame or duplicate current, up to practical limits. Each frame stores Fabric.js JSON + thumbnail.
- **Playback**: Animate all frames at configurable FPS (2–12). Overlay mode so you can watch then return to editing.
- **GIF Export**: Renders all frames to a GIF via canvas capture, saves to local gallery as a regular artwork.
- **Home Screen Door**: Added 🎬 Flipbook entry on the home screen alongside Studio and Gallery.
- **Flipbook Badge**: Gallery cards show 🎬 badge on flipbook artworks.

### Storage
- `src/lib/storage/flipbook.ts` — Flipbook/Frame CRUD on top of Dexie (separate table).
- `src/lib/export/gif.ts` — Frame-to-GIF pipeline using canvas-to-blob per frame.

---

## Phase 3.5 → 4: Ship Online ✅
*Completed: 2026-03-21*

Deployed to Vercel. Added a Publish flow so artwork from any device can appear in a public online gallery.

### Architecture Decision
- **Studio stays 100% local** — Fabric.js + IndexedDB, unchanged.
- **Publish = explicit action** — 🌐 button exports canvas PNG → Supabase Storage + metadata row in Postgres.
- **Public gallery** — `/gallery/published` is a Next.js ISR page (60s revalidation), zero auth, public URL.
- **No auth anywhere** — anon Supabase key for all operations.
- **Hosting**: Vercel free tier. **DB + Storage**: Supabase free tier.

### Key Milestones
- **Cloud library** (`src/lib/cloud/`): `publishArtwork`, `unpublishArtwork`, `fetchPublishedArtworks` with 8 unit tests.
- **🌐 Publish button** in studio toolbar: uploads PNG to Supabase Storage, upserts metadata, shows toast with auto-dismiss (6s), error feedback on failure.
- **Published badges**: 🌐 badge on gallery cards for published artworks, 🎬 badge for flipbooks.
- **`/gallery/published`**: Public grid page, ISR 60s, gold-frame cards, empty state, 🎬 badge for flipbooks.
- **Exhibit view**: Shows "🌐 Published online" status + parent-gated Unpublish button when artwork is live.
- **Dexie fix**: `update({publishedUrl: undefined})` is a no-op in Dexie — fixed with `modify()` to actually delete the field.
- **Save preserves publish state**: `saveArtwork` now carries forward `publishedUrl` on re-save.
- **Vercel deploy**: Live at https://tiny-museum-iota.vercel.app

### Stack additions
- `@supabase/supabase-js` v2 — Postgres + Storage client.
- Supabase project: `zylwahbviaphcjhrtugw`. Table: `published_artworks`. Bucket: `artwork-files` (public).

### Tests
- 28 tests passing (all green).

---

## Current Status: PHASE 4 COMPLETE ✅ — Live on Web
*2026-03-21*

### Shipped
- [x] Core drawing & toolset
- [x] Import / collage workflow (camera, files, shapes, stickers)
- [x] Multi-room gallery (IndexedDB, local-first)
- [x] Flipbook animator (frame-by-frame, GIF export)
- [x] Publish to web (Supabase Storage + Postgres, ISR gallery)
- [x] Vercel deploy — https://tiny-museum-iota.vercel.app
- [x] 28 unit tests passing

### Next (Phase 5 — future)
- 3D walkable museum (Three.js / React Three Fiber)
- Data model already shaped for rooms-as-spaces and artworks-with-metadata.