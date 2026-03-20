# Devlog

## Phase 0: `docs\BLUEPRINT.md`

---

## Phase 1: Bootstrap Execution Plan — Git Init → Running Canvas

### Step 1: Restructure & Scaffold (Terminal)
```bash
# ── Move existing files into src/ structure ──
New-Item -ItemType Directory -Force -Path src/components/canvas
New-Item -ItemType Directory -Force -Path src/components/gallery
New-Item -ItemType Directory -Force -Path src/components/ui
New-Item -ItemType Directory -Force -Path src/components/layout
New-Item -ItemType Directory -Force -Path src/lib/fabric
New-Item -ItemType Directory -Force -Path src/lib/storage
New-Item -ItemType Directory -Force -Path src/lib/audio
New-Item -ItemType Directory -Force -Path src/lib/export
New-Item -ItemType Directory -Force -Path src/app/gallery
New-Item -ItemType Directory -Force -Path src/app/studio/canvas
New-Item -ItemType Directory -Force -Path src/app/settings
New-Item -ItemType Directory -Force -Path src/stores
New-Item -ItemType Directory -Force -Path src/hooks
New-Item -ItemType Directory -Force -Path src/styles
New-Item -ItemType Directory -Force -Path src/assets/stickers
New-Item -ItemType Directory -Force -Path src/assets/sounds
New-Item -ItemType Directory -Force -Path src/assets/frames
New-Item -ItemType Directory -Force -Path src/assets/textures

# ── Move your existing files ──
Move-Item -Force components/canvas/Toolbar.tsx src/components/canvas/
Move-Item -Force components/gallery/useumWalk.tsx src/components/gallery/MuseumWalk.tsx
Move-Item -Force components/ui/ParentGate.tsx src/components/ui/
Move-Item -Force lib/fabric/setup.ts src/lib/fabric/
Move-Item -Force lib/fabric/touch.ts src/lib/fabric/
Move-Item -Force lib/storage/db.ts src/lib/storage/

# ── Clean up empty old directories ──
Remove-Item -Recurse -Force components
Remove-Item -Recurse -Force lib
```

### Step 2: Package & Config Files

### Step 3: Install
```bash
npm install
```
### Step 4: App Shell

- src/app/layout.tsx
- src/styles/globals.css
- src/app/page.tsx — The Front Door

### Step 5: Core Library Files (Fixed Versions)

- src/lib/fabric/tools.ts — NEW
- src/lib/fabric/setup.ts — FIXED
- src/lib/fabric/touch.ts — FIXED
- src/lib/fabric/history.ts — NEW

### Step 6: Hooks

- src/hooks/useFabricCanvas.ts
- src/hooks/useSounds.ts — Stub for Now

### Step 7: Components

- src/components/ui/BigButton.tsx — NEW
- src/components/canvas/Toolbar.tsx — FIXED
- src/components/canvas/StudioCanvas.tsx — NEW (The Main Workspace)

### Step 8: Pages

- src/app/studio/canvas/page.tsx
- src/app/gallery/page.tsx — Placeholder for Now

### Step 9: Studio Layout Fix

- The studio needs to hide the bottom nav. Add wrapper: `src/app/studio/layout.tsx`

---

## Current State → Next Target
 ✅ Project scaffolded & compiling
 ✅ Canvas renders with drawing tools
 ✅ Undo/redo wired
 ⬜ Storage layer (Dexie)          ← NOW
 ⬜ Save artwork to gallery        ← NOW
 ⬜ Gallery displays real artworks  ← NOW
 ⬜ Artwork detail / exhibit view   ← NOW
 ⬜ Rooms & organization           ← NEXT
 ⬜ Polish, sounds, celebrations   ← LATER

**The magic moment** we're building toward: a kid draws something, taps 🏛️, and walks into a gallery to see art hanging on the wall. Everything below serves that.

## Phase 2 (2026-03-20)

### 1. Storage Layer — src/lib/storage/db.ts

### 2. Artwork CRUD — src/lib/storage/artworks.ts

### 3. Room CRUD — src/lib/storage/rooms.ts

### 4. Zustand Store — src/stores/gallery.store.ts

- src/stores/ui.store.ts

### 5. Updated StudioCanvas — Full Save Pipeline

- // src/components/canvas/StudioCanvas.tsx

### 6. Gallery — Real Artwork Display

- src/components/gallery/ArtworkCard.tsx
- src/components/gallery/MuseumWalk.tsx — REWRITTEN
- src/components/gallery/GalleryGrid.tsx — NEW
- src/components/gallery/RoomSelector.tsx — NEW

### 7. Gallery Page — Fully Wired

- src/app/gallery/page.tsx — REWRITE

### 8. Exhibit View — Single Artwork Detail

- src/app/gallery/[artworkId]/page.tsx

### 9. Celebration Component — src/components/ui/Celebrations.tsx

- Wire it into layout — src/app/layout.tsx update
- Add inside the <body>, after the <nav>:
```tsx
// At the top, add import:
import { Celebrations } from '@/components/ui/Celebrations';

// Inside <body>, after </nav>:
<Celebrations />
```
---

## Phase 2.5 Let's Go (2026-03-20)

```bash
PS E:\co\tiny-museum> npm run dev

> tiny-museum@0.1.0 dev
> next dev --turbopack

   ▲ Next.js 15.5.14 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.56.1:3000

 ✓ Starting...
 ✓ Ready in 8.1s
 ⚠ Webpack is configured while Turbopack is not, which may cause problems.
 ⚠ See instructions if you need to configure Turbopack:
  https://nextjs.org/docs/app/api-reference/next-config-js/turbopack

 ○ Compiling / ...
 ✓ Compiled / in 11.9s
 GET / 200 in 12641ms
 ```
 ![alt text](image.png)

### What we have now
 ```
 THE CORE LOOP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🏠 Home
   │
   ├──► 🎨 Studio
   │     │
   │     ├── Draw with crayon/pencil/marker/spray
   │     ├── Undo / Redo
   │     ├── Choose colors
   │     ├── 💾 Quick save (stays in studio)
   │     └── 🏛️ Send to Gallery ──┐
   │                               │
   └──► 🏛️ Gallery ◄──────────────┘
         │
         ├── Room selector (My Art / Favorites)
         ├── Museum Walk (swipeable)
         ├── Grid View (toggle)
         └── Tap artwork → Exhibit View
              │
              ├── Full-frame display
              ├── Rename (tap title)
              ├── ⭐ Favorite
              ├── 📥 Download PNG
              └── 🗑️ Delete
```

IMMEDIATE (should do now if time):
  ☐ Test the full draw → save → gallery → exhibit flow
  ☐ Fix any runtime issues from first real usage

WEEK 2 SPRINT:
  ☐ Background picker (paper textures, colors)
  ☐ Basic shapes (circle, square, star, heart)
  ☐ Sticker pack v1 (bundled SVGs, drag to canvas)
  ☐ Eraser that actually erases (not bg-color paint)
  ☐ Auto-save every 30 seconds
  ☐ Re-open existing artwork from gallery