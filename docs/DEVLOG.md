# Devlog

## Phase 0: `docs\BLUEPRINT.md`

---

## Phase 0.5: Bootstrap Execution Plan — Git Init → Running Canvas

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

### Current State → Next Target
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

## 🧱 Phase 1 — "The Sketchbook" (MVP) (2026-03-20)

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

## Phase 1.5 First Run (2026-03-20)

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

### Fix Batch — All Blockers + Agent Findings
- Three categories: build-breaking, console errors, agent-flagged gaps. All in one pass.

#### Build Breakers
- Fix 1: Studio Page — 'use client' Missing
```tsx
// src/app/studio/canvas/page.tsx — REPLACE ENTIRE FILE

'use client';

import dynamic from 'next/dynamic';

const StudioCanvas = dynamic(
  () => import('@/components/canvas/StudioCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[100dvh] bg-studio-bg">
        <div className="text-center">
          <p className="text-5xl mb-3 animate-bounce">🎨</p>
          <p className="text-xl font-bold text-kid-purple">
            Opening Studio...
          </p>
        </div>
      </div>
    ),
  }
);

export default function StudioCanvasPage() {
  return <StudioCanvas />;
}
```
- Fix 2: Toolbar — Null Guards on freeDrawingBrush
// src/components/canvas/Toolbar.tsx — REPLACED ENTIRE FILE

#### Console Errors

- Fix 3: manifest.json — Valid JSON (No Comments) REPLACED
- Fix 4: Favicon — Generated a Simple SVG Favicon 
```bash
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">🏛️</text>
</svg>
```

- Add to src/app/layout.tsx inside <head>:

```tsx
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- Fix 5: Turbopack Warning — Remove Webpack Config
Replaced next.config.ts:

- Since we're using Turbopack (--turbopack flag), the webpack config block causes the warning. Fabric.js v6 is pure ESM and doesn't need the canvas: false alias in the browser — that was for server-side Node canvas which we're avoiding entirely via ssr: false.

#### Agent-Flagged Gaps

- Fix 6: Studio Layout — Bottom Nav Hiding
The CSS sibling selector fails because of nesting. Replace with a simpler approach.
```tsx
// src/app/studio/layout.tsx — REPLACE ENTIRE FILE

'use client';

import { useEffect } from 'react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add class to body so global CSS can hide the nav
  useEffect(() => {
    document.body.classList.add('studio-active');
    return () => {
      document.body.classList.remove('studio-active');
    };
  }, []);

  return <>{children}</>;
}
```

- Then update src/styles/globals.css — find the existing .studio-active rules and replace with:

```css
/* ── Studio: hide bottom nav, full height ── */
body.studio-active .bottom-nav {
  display: none !important;
}
body.studio-active .app-shell {
  height: 100dvh;
}

/* Tablet override too */
@media (min-width: 768px) {
  body.studio-active .app-shell {
    margin-left: 0;
  }
}
```
- Remove the old .studio-active .bottom-nav and .studio-active .app-shell blocks.


- Fix 7: FriendlyDialog — Replaces confirm()

```tsx
// src/components/ui/FriendlyDialog.tsx — NEW FILE

'use client';

import { BigButton } from './BigButton';

interface FriendlyDialogProps {
  emoji: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmEmoji?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FriendlyDialog({
  emoji,
  title,
  message,
  confirmLabel,
  confirmEmoji = '✓',
  cancelLabel = 'Go back',
  danger = false,
  onConfirm,
  onCancel,
}: FriendlyDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-kid p-6 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-label={title}
      >
        <p className="text-5xl mb-3">{emoji}</p>
        <h2 className="text-xl font-extrabold mb-2">{title}</h2>
        <p className="text-gray-500 mb-6 text-base">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-3 bg-gray-100 rounded-kid font-bold text-base
                       active:scale-95 transition-transform min-h-[48px]"
          >
            {cancelLabel} 💚
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-3 rounded-kid font-bold text-base text-white
                       active:scale-95 transition-transform min-h-[48px]
                       ${danger ? 'bg-kid-red' : 'bg-kid-purple'}`}
          >
            {confirmLabel} {confirmEmoji}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- Fix 8: Exhibit Page — Wire FriendlyDialog + ParentGate to Delete
// src/app/gallery/[artworkId]/page.tsx — REPLACED ENTIRE FILE


- Fix 9: ParentGate Needs Update for onCancel Flow
Check your src/components/ui/ParentGate.tsx matches this interface:

```tsx
// src/components/ui/ParentGate.tsx — REPLACE ENTIRE FILE

'use client';

import { useState, useMemo } from 'react';

interface ParentGateProps {
  onUnlock: () => void;
  onCancel: () => void;
  message?: string;
}

export function ParentGate({ onUnlock, onCancel, message }: ParentGateProps) {
  const problem = useMemo(() => {
    const a = Math.floor(Math.random() * 8) + 3;
    const b = Math.floor(Math.random() * 8) + 3;
    return { a, b, answer: a * b };
  }, []);

  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  function check() {
    if (parseInt(input, 10) === problem.answer) {
      onUnlock();
    } else {
      setWrong(true);
      setInput('');
      setTimeout(() => setWrong(false), 1500);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-kid p-6 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Parent verification"
      >
        <h2 className="text-2xl font-extrabold mb-2">
          👋 Grown-Up Check
        </h2>
        <p className="text-gray-500 mb-4 text-base">
          {message ?? 'This needs a grown-up. Solve to continue:'}
        </p>

        <p className="text-3xl font-extrabold mb-4 text-kid-purple">
          {problem.a} × {problem.b} = ?
        </p>

        <input
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          autoFocus
          className="text-2xl text-center w-24 py-2 border-3 border-gray-200
                     rounded-kid outline-none focus:border-kid-purple
                     transition-colors"
        />

        <div className="flex gap-3 justify-center mt-5">
          <button
            onClick={onCancel}
            className="px-5 py-3 bg-gray-100 rounded-kid font-bold
                       active:scale-95 transition-transform min-h-[48px]"
          >
            Go Back
          </button>
          <button
            onClick={check}
            className="px-5 py-3 bg-kid-purple text-white rounded-kid font-bold
                       active:scale-95 transition-transform min-h-[48px]"
          >
            Check ✓
          </button>
        </div>

        {wrong && (
          <p className="text-kid-red font-bold mt-3 animate-pulse">
            Not quite — try again! 🤔
          </p>
        )}
      </div>
    </div>
  );
}
```

#### Updated Layout with Favicon + Celebrations

- // src/app/layout.tsx — REPLACED ENTIRE FILE

### Full Fix Checklist
FIXES APPLIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build Breakers:
  ✅ Studio page: added 'use client' for dynamic import
  ✅ Toolbar: null guards on freeDrawingBrush
  ✅ next.config.ts: removed webpack block (Turbopack clean)

Console Errors:
  ✅ manifest.json: valid JSON, no comments
  ✅ favicon.svg: created in public/
  ✅ layout.tsx: favicon wired via metadata

Agent-Flagged Gaps:
  ✅ Studio layout: body class approach (no CSS sibling hack)
  ✅ FriendlyDialog: chunky kid-safe modal component
  ✅ ParentGate: wired to delete flow
  ✅ Delete flow: FriendlyDialog → ParentGate → actual delete
  ✅ Celebrations: wired into root layout

FILES CHANGED (8):
  src/app/studio/canvas/page.tsx    ← 'use client' added
  src/app/studio/layout.tsx         ← body class approach
  src/app/layout.tsx                ← celebrations + favicon
  src/app/gallery/[artworkId]/page.tsx ← FriendlyDialog + ParentGate
  src/components/canvas/Toolbar.tsx ← null guards
  src/components/ui/FriendlyDialog.tsx ← NEW
  src/components/ui/ParentGate.tsx  ← cleaned up
  next.config.ts                    ← simplified

FILES CREATED (2):
  public/favicon.svg
  src/components/ui/FriendlyDialog.tsx

### All three routes should now load clean: /, /gallery, /studio/canvas. Draw something → hit 🏛️ → see it framed. That's the test. 🎨

---

![alt text](image-1.png)


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

  ---

  ## QUALITY GATES (interwoven, not deferred)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  NOW (after this sprint):
    ☐ ESLint + Prettier config
    ☐ Pre-commit hook (lint-staged + husky)
    ☐ TypeScript strict mode audit (fix all 'any')

  AFTER IMPORT PIPELINE (Sprint 3):
    ☐ Vitest setup + first unit tests
       → storage CRUD (artworks, rooms)
       → history (undo/redo state machine)
       → thumbnail generation
    ☐ Playwright install + smoke tests
       → draw → save → gallery → exhibit (the core loop)
       → import image → canvas → save
       → parent gate blocks without answer

  BEFORE SHARING FEATURES (Sprint 4):
    ☐ Full component test coverage
    ☐ Accessibility audit (screen reader, color contrast)
    ☐ Lighthouse PWA audit pass
    ☐ Mobile device matrix test (iOS Safari, Android Chrome)

  WHY THIS ORDER:
    Tests on unstable APIs waste time.
    Import pipeline changes canvas + storage contracts.
    Once those stabilize → lock them with tests.

---

## The Big Picture — Still On Track
PHASE 1  ✅ Sketchbook     ← WE ARE HERE (core loop works)
PHASE 2  🔨 Import Studio   ← THIS SPRINT
PHASE 3  ⬜ Flipbook/Animation
PHASE 4  ⬜ Gallery Sharing (family links, publishable)

The "publishable gallery" is Phase 4 but it's
ARCHITECTURALLY PREPARED from day 1:
  → Each artwork has a unique ID
  → Full-res blobs stored separately
  → Room structure = shareable collections
  → Share = generate token → family-only link
  → Parent gate guards all sharing

Import/edit of personal artworks = THIS SPRINT.
That's the thing that makes it HER app, not a toy.

---

## PHASE 2: Import Pipeline + Canvas Upgrades

- What we're building:

```
┌─────────────────────────────────────────┐
│           IMPORT SOURCES                │
│                                         │
│  📷 Camera ──┐                          │
│              ├──► Import Flow ──► Canvas │
│  📁 Files ──┘    (crop/clean)           │
│                                         │
│           CANVAS UPGRADES               │
│                                         │
│  🎨 Background picker (colors+textures) │
│  ⭕ Shapes (circle, square, star, heart)│
│  🖼️ Images as canvas objects            │
│  👆 Select/Move/Resize mode             │
│                                         │
└─────────────────────────────────────────┘
```

### 1. Import — Camera Capture

- src/lib/import/camera.ts
- src/lib/import/file.ts
- src/lib/import/cleanup.ts — Image Enhancement for Scanned Drawings

### 2. Import UI Components
- src/components/canvas/ImportPanel.tsx

### 3. Canvas Upgrades — Shapes + Images + Select Mode
- src/lib/fabric/shapes.ts — NEW
- src/components/canvas/BackgroundPicker.tsx — NEW
- src/components/canvas/ShapePanel.tsx — NEW

### 4. Updated Toolbar — All New Tools

- // src/components/canvas/Toolbar.tsx — REPLACE ENTIRE FILE

### 5. Updated StudioCanvas — Everything Wired

- // src/components/canvas/StudioCanvas.tsx — REPLACED ENTIRE FILE

### 6. Quality Gate — Lint + Prettier Setup

- Terminal
```bash
npm install -D prettier eslint-config-prettier @typescript-eslint/eslint-plugin
```
- .prettierrc
- .prettierignore
- Update package.json scripts 
```json
    "scripts": {
        "dev": "next dev --turbopack",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
        "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
        "typecheck": "tsc --noEmit",
        "quality": "npm run typecheck && npm run lint && npm run format:check"
    },
```
- Run
```bash
npm run format
npm run typecheck
```

---

### PHASE 1 — Sketchbook              ✅ DONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Freehand drawing (5 brushes)
  ✅ Color palette (12 colors)
  ✅ Brush size control
  ✅ Undo / Redo
  ✅ Save to IndexedDB
  ✅ Gallery grid + museum walk
  ✅ Room tabs
  ✅ Exhibit view with gold frame
  ✅ Rename, favorite, download, delete
  ✅ Parent gate + friendly dialog
  ✅ Celebration animation
  ✅ PWA manifest

PHASE 2 — Import Studio           🔨 THIS BATCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Camera capture (photo of hand drawing)
  ✅ File import (PNG, JPEG, WebP, SVG)
  ✅ Auto-enhance (contrast, crop)
  ✅ Image placement on canvas
  ✅ Background picker (6 options)
  ✅ Shape insertion (circle, square, star, heart)
  ✅ Select/Move/Resize mode (👆)
  ✅ Delete selected objects
  ✅ Prettier + format scripts
  ☐ Edit existing artwork from gallery (next)
  ☐ Sticker packs (next)

QUALITY GATE — Plant Now, Grow Soon
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Prettier config + format command
  ✅ TypeScript strict checks
  ☐ Vitest (after this sprint stabilizes)
  ☐ Playwright smoke tests

  ---

## Phase 2.5 Fix Batch — Edit Flow + Blob Leaks + Icons
Phase 3.5 Fix Batch — Edit Flow + Blob Leaks + Icons
### Issue Map
1. Edit opens empty canvas     → StudioCanvas never reads ?id= param
2. Blob URL ERR_FILE_NOT_FOUND → ArtworkCard creates URLs that leak on unmount
3. icon-192.png 404            → manifest references files that don't exist

### Fix 1: Edit Existing Artwork — The Big One

- StudioCanvas has no load logic. Let's add it properly.
src/components/canvas/StudioCanvas.tsx — REPLACED ENTIRE FILE ✅

- src/app/studio/canvas/page.tsx — Wrap in Suspense for useSearchParams ✅
```tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const StudioCanvas = dynamic(
  () => import('@/components/canvas/StudioCanvas'),
  {
    ssr: false,
    loading: () => <StudioLoading />,
  },
);

function StudioLoading() {
  return (
    <div className="flex items-center justify-center h-[100dvh] bg-studio-bg">
      <div className="text-center">
        <p className="text-5xl mb-3 animate-bounce">🎨</p>
        <p className="text-xl font-bold text-kid-purple">Opening Studio...</p>
      </div>
    </div>
  );
}

export default function StudioCanvasPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioCanvas />
    </Suspense>
  );
}
```

###  Fix 2: Blob URL Lifecycle — No More Leaks

- The problem: ArtworkCard creates blob URLs on every render, and when React re-renders or unmounts, old URLs leak. The ExhibitPage has the same issue.
src/hooks/useBlobUrl.ts — NEW (Centralized Blob URL Management) ✅

- src/components/gallery/ArtworkCard.tsx — REPLACED ENTIRE FILE ✅

- src/app/gallery/[artworkId]/page.tsx — Fixed Blob Lifecycle ✅

### Fix 3: PWA Icons — Generate from SVG

- The simplest fix: generate proper PNG icons inline. Since we don't have an image tool in the pipeline, let's create canvas-generated icons at build time. But for now — fix the manifest to not reference files that don't exist.

- public/manifest.json — Point to favicon only
- Generate Real PNG Icons — scripts/generate-icons.mjs
- update manifest to use SVG icons

#### Or the fast path — just created the icon files manually:

```bash
New-Item -ItemType Directory -Force -Path public/icons
```

- Created public/icons/icon-192.svg and public/icons/icon-512.svg

### Fix Summary
ISSUE                          FIX                              FILE(S)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Edit opens empty canvas         Load artwork from Dexie          StudioCanvas.tsx
                                via ?id= searchParam             studio/canvas/page.tsx

Blob URL leaks                  useBlobUrl hook with             hooks/useBlobUrl.ts
(ERR_FILE_NOT_FOUND)            proper cleanup on unmount        ArtworkCard.tsx
                                                                 [artworkId]/page.tsx

icon-192.png 404                SVG icons + fixed manifest       manifest.json
                                                                 public/icons/*.svg

Suspense boundary missing       Wrapped dynamic import           studio/canvas/page.tsx
for useSearchParams             in <Suspense>

FILES CHANGED: 5
FILES CREATED: 3
  └─ src/hooks/useBlobUrl.ts
  └─ public/icons/icon-192.svg
  └─ public/icons/icon-512.svg

### Test Checklist

1. npm run dev
2. Go to /studio/canvas → draw something → hit 💾
3. Hit 🏛️ → see it in gallery (no blob errors in console)
4. Tap the artwork → exhibit view loads image
5. Tap ✏️ → studio opens WITH YOUR DRAWING LOADED
6. Make edits → 💾 → back to gallery → changes visible
7. Console should be clean — no 404s, no blob errors

---

## Phase 2.6 Blob Leak Fix + Next Feature Sprint

- The console tells the story — blob URLs are still getting revoked before images finish loading. Let's kill this class of bug permanently, then push forward.

### Root Cause
React Strict Mode (dev) + useBlobUrl = double mount/unmount

  Mount 1 → createObjectURL(blob-A) → img starts loading
  Unmount 1 → revokeObjectURL(blob-A) → img gets ERR_FILE_NOT_FOUND
  Mount 2 → createObjectURL(blob-B) → works, but ghost error already logged

- Also: gallery refresh() triggers re-render → new blob URLs → old ones revoked while <img> still decoding.

### The Permanent Fix: Data URLs for Thumbnails

- Thumbnails are small (~30-50KB webp). Convert once, no lifecycle issues, no revocation needed.
src/hooks/useBlobUrl.ts — REPLACED ENTIRE FILE ✅

- src/app/gallery/[artworkId]/page.tsx — Use useLargeBlob for Full-Res
- Full file — replaced the import and the one line ✅

---

## Phase 2.7 Stickers + Room Management + Auto-Save
This completes Phase 2 and makes the app genuinely fun for a 7-year-old.

### 1. Sticker System
- Bundled SVG Stickers — src/assets/stickers/index.ts

- src/lib/fabric/stickers.ts — NEW
- src/components/canvas/StickerPanel.tsx — NEW

### 2. Room Management — Create & Organize
- src/components/gallery/CreateRoomDialog.tsx — NEW
- src/components/gallery/RoomSelector.tsx — Added Create Button

- src/app/gallery/page.tsx — Wired onRoomCreated

### 3. Wire Stickers Into Toolbar + StudioCanvas

- StudioCanvas — Add sticker panel state
In src/components/canvas/StudioCanvas.tsx, updated the Panel type and add the sticker panel 

#### Toolbar — Add stickers button

- In src/components/canvas/Toolbar.tsx, added to the interface

- Addd to destructured props, then in the extras section after the shapes button

### Files Summary
FIXED:
  src/hooks/useBlobUrl.ts          ← data URL for thumbs, deferred revoke for large
  src/app/gallery/[artworkId]/page.tsx  ← uses useLargeBlob

NEW:
  src/assets/stickers/index.ts     ← 3 sticker packs (24 stickers)
  src/lib/fabric/stickers.ts       ← addStickerToCanvas()
  src/components/canvas/StickerPanel.tsx
  src/components/gallery/CreateRoomDialog.tsx

UPDATED:
  src/components/canvas/StudioCanvas.tsx  ← stickers + auto-save
  src/components/canvas/Toolbar.tsx       ← stickers button
  src/components/gallery/RoomSelector.tsx  ← "+ New Room" button
  src/app/gallery/page.tsx               ← onRoomCreated wiring

---

## Phase 2.8 Bug Fix Batch — Stickers, Shapes, Select Mode, Blobs

### Bug Analysis
BUG                        ROOT CAUSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stickers empty              Fabric can't render emoji-in-SVG <text>
Shapes not editable         Canvas stays in drawingMode after add
Select mode doesn't stick   touch.ts forces drawingMode=true on touchEnd
Blob errors in exhibit      useLargeBlob revoked by React strict mode
Color not shared            activeColor lives in Toolbar, not parent

### Fix 1: Stickers — Render Emoji to Canvas Bitmap
src/lib/fabric/stickers.ts — REPLACED ENTIRE FILE

- src/assets/stickers/index.ts — Simplified to Emoji Strings
- src/components/canvas/StickerPanel.tsx — REPLACED ENTIRE FILE

### Fix 2: Touch Handler — Respect Select Mode

- The onTouchEnd in touch.ts blindly sets canvas.isDrawingMode = true. This kills select mode every time you lift a finger.
src/lib/fabric/touch.ts — REPLACED ENTIRE FILE

### Fix 3: Shapes — Properly Enter Select Mode After Add

- src/lib/fabric/shapes.ts — REPLACED ENTIRE FILE

### Fix 4: Toolbar + StudioCanvas — Lift Color State, Sync Select Mode

- The toolbar needs to know when shapes/stickers switch to select mode, and vice versa.
src/components/canvas/Toolbar.tsx — REPLACED ENTIRE FILE

### Fix 5: StudioCanvas — Lifted State, Mode Sync

- src/components/canvas/StudioCanvas.tsx — REPLACED ENTIRE FILE

### Fix 6: Blob Errors in Exhibit — Use Data URL for Full-Res Too

- src/hooks/useBlobUrl.ts — REPLACED ENTIRE FILE

### Summary
BUG                     FIX                              FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stickers empty          Render emoji to canvas bitmap     lib/fabric/stickers.ts
                        Simplify data model to emoji str  assets/stickers/index.ts
                                                         StickerPanel.tsx

Shapes not editable     addAndSelect() helper             lib/fabric/shapes.ts
                        Exit drawing mode after add

Select mode broken      Don't force drawingMode=true      lib/fabric/touch.ts
                        Remember pre-pinch mode

Mode not synced         Lift isSelectMode to parent        StudioCanvas.tsx
                        Toolbar reads/writes via props     Toolbar.tsx

Color not shared        Lift activeColor to parent         StudioCanvas.tsx
                        Toolbar reads/writes via props     Toolbar.tsx

Blob errors             Data URL everywhere                hooks/useBlobUrl.ts
                        No more object URLs to revoke

FILES CHANGED: 9
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Test checklist:

Studio → tap 🎯 → add cat sticker → visible emoji on canvas
Tap 👆 → can select, move, resize the sticker
Tap ✨ → add circle → immediately selectable and movable
Tap 🖍️ → back to drawing, doesn't interfere with objects
Gallery → exhibit → no blob errors in console
Gallery grid → no blob errors

---

## Phase 2.9 Fix Pass — All Known Survivors

### Fix 1: Gallery Store — Stable Refresh Without Flickering

- The gallery refresh() replaces the entire artworks array. Every ArtworkCard gets new blob references, causing a flash of re-reads. Fix: only update if data actually changed.

src/stores/gallery.store.ts — REPLACED ENTIRE FILE

### Fix 2: useFabricCanvas — Guard Against Strict Mode Double Mount

- src/hooks/useFabricCanvas.ts — REPLACED ENTIRE FILE

### Fix 3: Celebrations — Cleanup Timeout

- src/stores/ui.store.ts — REPLACED ENTIRE FILE

### Fix 4: Suppress Forced Reflow Warning

- This is a Chrome performance warning caused by Fabric.js reading layout during canvas operations. It's not a bug, but we can minimize it.

src/lib/fabric/setup.ts — REPLACED ENTIRE FILE

### Fix 5: Shapes — Call requestRenderAll Instead of renderAll

- Since we set renderOnAddRemove: false, we need explicit renders.

src/lib/fabric/shapes.ts — Updated addAndSelect only

- Actually requestRenderAll is already there — good. But we need to also patch stickers:

src/lib/fabric/stickers.ts — Ensure requestRenderAll
Already using canvas.renderAll() — change to requestRenderAll:

### Testing Setup + First Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom happy-dom

npm install -D fake-indexeddb
```
- vitest.config.ts — NEW (project root)
- src/test/setup.ts — NEW
- src/lib/storage/__tests__/artworks.test.ts — First Real Tests
- src/lib/storage/__tests__/rooms.test.ts
- src/lib/fabric/__tests__/history.test.ts
- Updated package.json scripts
- Run Tests
```bash
npm run format && npm run typecheck && npx vitest run
```

### What This Batch Delivers
FIXES:
  ✅ Forced reflow warnings reduced (renderOnAddRemove: false)
  ✅ Strict mode canvas double-mount guard
  ✅ Celebration timer cleanup (no stacking)
  ✅ Gallery store error handling
  ✅ Sticker requestRenderAll consistency

TESTING:
  ✅ Vitest configured with happy-dom
  ✅ Artwork CRUD — 7 tests
  ✅ Room CRUD — 3 tests  
  ✅ Canvas History — 5 tests
  ━━━━━━━━━━━━━━━━━━━━━━━
  Total: 15 unit tests covering core data layer

FILES:
  vitest.config.ts                           NEW
  src/test/setup.ts                          NEW
  src/lib/storage/__tests__/artworks.test.ts NEW
  src/lib/storage/__tests__/rooms.test.ts    NEW
  src/lib/fabric/__tests__/history.test.ts   NEW
  + 6 files updated for bug fixes

### Auto-Save Performance — Use requestIdleCallback

- src/components/canvas/StudioCanvas.tsx — Fix Auto-Save Section Only
Find the auto-save useEffect and replace it with:

```ts
  // Auto-save every 30 seconds — use idle callback to avoid jank
  useEffect(() => {
    if (!canvas || !isReady || !loaded) return;

    const interval = setInterval(() => {
      if (!currentArtworkId) return;

      const doSave = async () => {
        try {
          await saveArtwork(canvas, currentArtworkId);
        } catch {
          // silent
        }
      };

      // Use requestIdleCallback if available, else just run
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => doSave(), { timeout: 5000 });
      } else {
        doSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [canvas, isReady, loaded, currentArtworkId]);s
```
- src/types/global.d.ts — NEW

###  Clean Up Existing Broken Artworks
For artworks already saved with expired blob URLs, add a one-time migration. This runs on gallery load and patches any broken image sources.

- src/lib/storage/migrate.ts — NEW
- src/app/gallery/page.tsx — Added migration call

### Summary

CATEGORY        FIX                                FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests fail      Created setup.ts + fake-indexeddb    src/test/setup.ts
                Fixed vitest config path             vitest.config.ts
                Fixed all 3 test suites              __tests__/*.ts

Blob errors     Inline image sources on save         lib/storage/artworks.ts
                Migrate existing broken artworks      lib/storage/migrate.ts
                Wire migration into gallery           app/gallery/page.tsx

Perf warning    requestIdleCallback for auto-save    StudioCanvas.tsx
                Type declarations                    src/types/global.d.ts

FILES NEW: 3    (setup.ts, migrate.ts, global.d.ts)
FILES CHANGED: 7

### Fix Tests + Nuclear Blob Cleanup

- Fix 1: Artwork Tests — happy-dom Has No Canvas 2D Context
The test environment doesn't implement canvas.getContext('2d'). We need a fully mocked canvas that doesn't touch real DOM canvas API.

src/lib/storage/__tests__/artworks.test.ts — REPLACED ENTIRE FILE

### Fix 2: Nuclear Blob Cleanup — Run Every Time, Not Once

The existing artworks were saved before the inlineImageSources fix. The one-time migration may not have caught everything. Make it run on every gallery load (it's fast — just a string check per artwork).

- src/lib/storage/migrate.ts — REPLACE ENTIRE FILE
- src/app/gallery/page.tsx — Update Import

### Fix 3: Google Fonts — Self-Host or Use Fallback

- The ERR_CONNECTION_CLOSED on Google Fonts means the network request failed (offline, blocked, etc). For a kid's PWA that should work offline, don't depend on external fonts.

src/app/layout.tsx — Replacec Google Fonts with Next.js Built-in

- tailwind.config.ts — Wire the CSS variable

### Fix 4: Add Migration Test

- src/lib/storage/__tests__/migrate.test.ts — NEW


### Fix 5: Tests — happy-dom Has No Canvas 2D

generateThumbnail in artworks.ts creates a <canvas> internally. happy-dom returns null for getContext('2d'). Fix: mock canvas globally in test setup.

- src/test/setup.ts — REPLACED ENTIRE FILE

### Fix 6: Nuclear Blob URL Prevention in Save

The inlineImageSources approach is fragile — index matching breaks with nested objects. Replace with a simple string-level sanitization after JSON serialization, plus a proper pre-serialization step.

- src/lib/storage/artworks.ts — REPLACED ENTIRE FILE

### Fix 7: Clear Old Corrupted Data

### src/app/layout.tsx — Add suppressHydrationWarning

### Last Blob Error — Fabric Internal Caching

- src/lib/fabric/setup.ts — Add export config

- patch addImageToCanvas to explicitly set source property
src/lib/fabric/shapes.ts — Update addImageToCanvas function only
Replace just the addImageToCanvas function at the bottom

- Quick DB Reset (One-Time)
```bash
// Paste in Console tab:
indexedDB.deleteDatabase('TinyMuseum');
location.reload();
```
### Project Health Check

TESTS:           20/20 ✅
TYPECHECK:       Clean ✅
FORMAT:          Clean ✅
BUILD ERRORS:    None ✅

CONSOLE (after DB reset):
  Hydration:     Suppressed ✅
  Blob errors:   0 (new artworks) ✅
  Violations:    Minimal (Fabric internal) ✅

PHASE STATUS:
  Phase 1 ✅  Sketchbook (draw, save, gallery, exhibit)
  Phase 2 ✅  Import Studio (camera, files, shapes, stickers, backgrounds)
  Quality  ✅  20 tests, prettier, typecheck, strict TS

---

## Phase 3 Polish Sprint
IMPACT vs EFFORT for a 7-year-old:

  🔊 Sound effects         ████████████ HIGH impact, LOW effort
  ✨ Better eraser          ██████████   HIGH impact, LOW effort  
  🎨 Undo stickers/shapes  ████████     (already works from history fix)
  📱 Bottom toolbar mobile  ██████████   HIGH impact, MEDIUM effort
  🏛️ Gallery animation      ████████     MEDIUM impact, LOW effort

### 1. Sound Effects — The Dopamine Layer

- src/lib/audio/sounds.ts — NEW
- src/hooks/useSounds.ts — REPLACED ENTIRE FILE

### 2. Wire Sounds Into Everything

- src/components/canvas/StudioCanvas.tsx — Add Sound to Save/Gallery
Find handleSave and add sound after celebrate():

```ts
// In handleSave, after celebrate():
import { useSounds } from '@/hooks/useSounds';

// Inside the component:
const { playSound } = useSounds();

// In handleSave try block, after celebrate():
playSound('save');

// In handleSendToGallery try block, after celebrate():
playSound('celebrate');
```

- Here's the complete updated handleSave and handleSendToGallery sections — just replace these two functions in existing StudioCanvas:
```ts
  const { playSound } = useSounds();

  const handleSave = useCallback(async () => {
    if (!canvas || saving) return;
    setSaving(true);
    try {
      const artwork = await saveArtwork(canvas, currentArtworkId);
      setCurrentArtworkId(artwork.id);
      celebrate();
      playSound('save');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [canvas, saving, currentArtworkId, celebrate, playSound]);

  const handleSendToGallery = useCallback(async () => {
    if (!canvas || saving) return;
    setSaving(true);
    try {
      const artwork = await saveArtwork(canvas, currentArtworkId);
      setCurrentArtworkId(artwork.id);
      celebrate();
      playSound('celebrate');
      setTimeout(() => router.push('/gallery'), 600);
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  }, [canvas, saving, currentArtworkId, celebrate, playSound, router]);
```
- src/components/canvas/StickerPanel.tsx — Sparkle Sound
Replace playSound('toolSwitch') with:

```ts
playSound('sparkle');
```

- src/components/canvas/ShapePanel.tsx — Sparkle Sound
- src/components/gallery/RoomSelector.tsx — Room Switch Sound
Add to the room button onClick:

### 3. Sound Toggle — Mute Button

- src/components/ui/SoundToggle.tsx — NEW
- Wire into gallery header — add next to the view toggle:

In src/app/gallery/page.tsx, add import and button
In the header <div className="flex gap-2">

### 4. Better Eraser — Visual Feedback

- src/components/canvas/Toolbar.tsx — Add Eraser Active Indicator

### 5. Gallery Grid View Polish — Entrance Animation

- src/styles/globals.css — Add entrance animation
Add at the bottom

- src/components/gallery/GalleryGrid.tsx — Add Staggered Animation

- src/components/gallery/MuseumWalk.tsx — Add Entrance too

### 6. Home Page — Add Sound Toggle + Quick Stats

- src/app/page.tsx — REPLACED ENTIRE FILE
 Git Commit — Phase 2 Milestone
