# Tiny Museum — Sharp Draft v1

## 🧱 Phase 1 — "The Sketchbook" (MVP)
Core Canvas + Gallery Shell
─────────────────────────────
✅ Freehand drawing (brush, colors, eraser)
✅ Simple shapes & stickers (bundled, curated)
✅ Undo/Redo (CRITICAL for a 7-year-old)
✅ Save artwork → Gallery
✅ Gallery grid with "museum walk" view
✅ Export as PNG


## 🧱 Phase 2 — "The Camera & Collage"
Import & Compose
─────────────────────────────
✅ Camera capture → import hand drawings
✅ Background removal (lightweight ML)
✅ Layer system (simple: background/middle/foreground)
✅ Sticker/element library (expandable)
✅ Gallery gets "frames" and "rooms" theming

## 🧱 Phase 3 — "The Movie Maker"
Simple Animation
─────────────────────────────
✅ Flipbook-style frame-by-frame (PERFECT for kids)
✅ Onion skinning (see previous frame faintly)
✅ Play / adjust speed
✅ Export as GIF or short MP4
✅ Gallery supports animated works

## 🧱 Phase 4 — "The Open Studio"
Import/Export & Safe Sources
─────────────────────────────
✅ Import from safe curated sources (OpenClipart, Biodiversity Heritage Library, etc.)
✅ Whiteboard format support (SVG, JSON-canvas)
✅ Export options (PNG, SVG, GIF, PDF for printing)
✅ Share links (gallery becomes shareable — family only)

## UX Principles

**This is the most important section:**
```
┌─────────────────────────────────────────────┐
│         DESIGN FOR TINY HUMANS              │
├─────────────────────────────────────────────┤
│                                             │
│  🎯 Touch targets: minimum 48px,           │
│     prefer 56-64px                          │
│                                             │
│  🔤 Minimal text — icons + color coding     │
│                                             │
│  ↩️  Generous undo (infinite if possible)   │
│                                             │
│  🚫 No destructive actions without          │
│     a friendly confirmation                 │
│                                             │
│  🎨 UI itself should feel like art          │
│     (not a software tool)                   │
│                                             │
│  🏛️  Gallery = reward & pride moment        │
│     Make it feel SPECIAL                    │
│                                             │
│  🔒 No public sharing without               │
│     parent gate                             │
│                                             │
│  📱 One-hand reachable controls on mobile   │
│                                             │
│  🎵 Subtle sound feedback (optional         │
│     but delightful)                         │
│                                             │
│  😊 Encouraging, never punishing            │
│     "Oops! Let's try again!" not "Error"    │
│                                             │
└─────────────────────────────────────────────┘
```



## Architecture: The Whole Map
```
tiny-museum/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Shell: nav, parent gate, theme
│   │   ├── page.tsx                ← Landing / "Front Door" of museum
│   │   ├── gallery/
│   │   │   ├── page.tsx            ← Museum Walk (grid ↔ immersive toggle)
│   │   │   ├── [artworkId]/
│   │   │   │   └── page.tsx        ← Single artwork "exhibit" view
│   │   │   └── rooms/
│   │   │       └── [roomId]/
│   │   │           └── page.tsx    ← Themed room (e.g. "Ocean Art", "Family")
│   │   ├── studio/
│   │   │   ├── page.tsx            ← Studio launcher (new / open existing)
│   │   │   ├── canvas/
│   │   │   │   └── page.tsx        ← The Fabric.js workspace
│   │   │   ├── flipbook/
│   │   │   │   └── page.tsx        ← Phase 3: frame-by-frame animator
│   │   │   └── import/
│   │   │       └── page.tsx        ← Camera capture + file import
│   │   └── settings/
│   │       └── page.tsx            ← Parent-gated: export, sharing, sources
│   │
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── DrawingCanvas.tsx    ← Fabric.js wrapper
│   │   │   ├── Toolbar.tsx          ← Kid-friendly tool belt
│   │   │   ├── ColorWheel.tsx       ← Touch-friendly color picker
│   │   │   ├── BrushPicker.tsx      ← Visual brush selector
│   │   │   ├── StickerPanel.tsx     ← Draggable sticker drawer
│   │   │   ├── LayerTray.tsx        ← Phase 2: simple 3-layer system
│   │   │   └── UndoRedoRing.tsx     ← Circular gesture + buttons
│   │   │
│   │   ├── gallery/
│   │   │   ├── MuseumWalk.tsx       ← Horizontal scroll "hallway" view
│   │   │   ├── ArtworkCard.tsx      ← Framed thumbnail
│   │   │   ├── ExhibitView.tsx      ← Full-screen with frame + plaque
│   │   │   ├── RoomSelector.tsx     ← Room/collection picker
│   │   │   └── ShareGate.tsx        ← Parent PIN → share link
│   │   │
│   │   ├── ui/
│   │   │   ├── BigButton.tsx        ← 64px min touch target
│   │   │   ├── FriendlyDialog.tsx   ← "Oops!" style confirmations
│   │   │   ├── ParentGate.tsx       ← Simple math problem PIN
│   │   │   ├── LoadingBuddy.tsx     ← Animated character during waits
│   │   │   ├── SoundToggle.tsx      ← Global mute/unmute
│   │   │   └── Celebrations.tsx     ← Confetti / stars on save-to-gallery
│   │   │
│   │   └── layout/
│   │       ├── BottomNav.tsx         ← Mobile: Gallery | Studio | Me
│   │       ├── SideNav.tsx           ← Tablet/Desktop: expanded nav
│   │       └── ResponsiveShell.tsx   ← Breakpoint orchestrator
│   │
│   ├── lib/
│   │   ├── fabric/
│   │   │   ├── setup.ts             ← Fabric.js canvas initialization
│   │   │   ├── tools.ts             ← Brush configs, shape factories
│   │   │   ├── history.ts           ← Undo/redo state machine
│   │   │   ├── serializer.ts        ← Canvas ↔ JSON ↔ PNG/SVG export
│   │   │   └── touch.ts             ← Gesture handling (pinch, pan, draw)
│   │   │
│   │   ├── storage/
│   │   │   ├── db.ts                ← Dexie.js schema & migrations
│   │   │   ├── artworks.ts          ← CRUD for artwork records
│   │   │   ├── blobs.ts             ← Binary storage (images, exports)
│   │   │   ├── rooms.ts             ← Gallery room/collection management
│   │   │   └── sync.ts              ← Phase 4: optional cloud bridge
│   │   │
│   │   ├── import/
│   │   │   ├── camera.ts            ← getUserMedia + capture
│   │   │   ├── file.ts              ← File input handling + validation
│   │   │   ├── cleanup.ts           ← Auto-crop, contrast boost for scans
│   │   │   └── bgRemoval.ts         ← Phase 2: @imgly wrapper
│   │   │
│   │   ├── export/
│   │   │   ├── png.ts               ← Canvas → PNG blob
│   │   │   ├── svg.ts               ← Canvas → SVG string
│   │   │   ├── gif.ts               ← Phase 3: gif.js flipbook export
│   │   │   └── mp4.ts               ← Phase 3: FFmpeg.wasm (desktop only)
│   │   │
│   │   ├── audio/
│   │   │   ├── sounds.ts            ← Preloaded UI sound effects
│   │   │   └── haptics.ts           ← navigator.vibrate micro-feedback
│   │   │
│   │   └── safety/
│   │       ├── parentGate.ts         ← PIN logic (math-problem based)
│   │       ├── contentFilter.ts      ← Import source allowlist
│   │       └── shareTokens.ts        ← Phase 4: family-only share links
│   │
│   ├── stores/
│   │   ├── canvas.store.ts           ← Active canvas state (Zustand)
│   │   ├── gallery.store.ts          ← Artwork list, active room
│   │   ├── ui.store.ts               ← Theme, sound on/off, nav state
│   │   └── session.store.ts          ← Parent-unlocked features
│   │
│   ├── assets/
│   │   ├── stickers/                 ← Curated SVG packs
│   │   ├── frames/                   ← Gallery frame overlays
│   │   ├── sounds/                   ← UI feedback sounds (tiny mp3s)
│   │   ├── textures/                 ← Paper, canvas, chalkboard backgrounds
│   │   └── mascot/                   ← Loading buddy sprite/animation
│   │
│   ├── hooks/
│   │   ├── useFabricCanvas.ts        ← Canvas lifecycle management
│   │   ├── useArtworkCRUD.ts         ← Save, load, delete, duplicate
│   │   ├── useCamera.ts             ← Camera stream + snapshot
│   │   ├── useUndoRedo.ts           ← History hook wrapping lib
│   │   ├── useResponsive.ts         ← Breakpoint + device detection
│   │   └── useSounds.ts             ← Play sound with global mute check
│   │
│   └── styles/
│       ├── globals.css               ← CSS custom properties, reset
│       ├── museum-theme.css          ← Gallery aesthetic (warm, golden)
│       └── studio-theme.css          ← Studio aesthetic (bright, playful)
│
├── public/
│   ├── manifest.json                 ← PWA manifest
│   ├── sw.js                         ← Service worker (Workbox)
│   ├── icons/                        ← App icons (all sizes)
│   └── splash/                       ← iOS/Android splash screens
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Build Strategy

1. Data Model (Dexie.js / IndexedDB)
2. The Fabric.js Canvas Engine
3. Touch & Gesture Layer (The Make-or-Break for Mobile)

## The Gallery — "Museum Walk" Concept
```
MOBILE VIEW (Museum Walk Mode)
┌─────────────────────────┐
│  ╭─────────────────╮    │
│  │   ┌───────────┐ │    │  ← Horizontal scroll
│  │   │ ┌───────┐ │ │    │     Each "wall panel" is
│  │   │ │       │ │ │    │     an artwork in a frame
│  │   │ │  ART  │ │ │    │
│  │   │ │       │ │ │    │
│  │   │ └───────┘ │ │    │
│  │   │  "Sunny   │ │    │  ← Title plaque below
│  │   │   Day"    │ │    │
│  │   │  Mar 2026 │ │    │
│  │   └───────────┘ │    │
│  ╰─────────────────╯    │
│                         │
│  ◄ Swipe to explore ►   │
│                         │
│  ┌─────────────────────┐│
│  │ 🏛️ Ocean Room       ││  ← Room selector
│  │ 🌺 Garden Room      ││
│  │ 👨‍👩‍👧 Family Room     ││
│  │ ⭐ Favorites        ││
│  │ + New Room          ││
│  └─────────────────────┘│
│                         │
│ [🏛️ Gallery] [🎨 Studio] │  ← Bottom nav
└─────────────────────────┘


GRID VIEW (Quick Browse)
┌─────────────────────────┐
│  🏛️ Ocean Room      ≡ 🔀│
│ ┌─────┐┌─────┐┌─────┐  │
│ │     ││     ││     │  │
│ │ 🖼️  ││ 🖼️  ││ 🖼️  │  │
│ │     ││     ││     │  │
│ └─────┘└─────┘└─────┘  │
│ ┌─────┐┌─────┐┌─────┐  │
│ │     ││     ││     │  │
│ │ 🖼️  ││ 🖼️  ││ 🖼️  │  │
│ │     ││     ││     │  │
│ └─────┘└─────┘└─────┘  │
│                         │
│ [🏛️ Gallery] [🎨 Studio] │
└─────────────────────────┘
```

- // components/gallery/MuseumWalk.tsx

## The Studio Toolbar (Designed for Small Hands)
```
MOBILE STUDIO LAYOUT
┌─────────────────────────┐
│ [↩️] [↪️]    [💾] [🏛️→] │  ← Top: undo/redo + save + send to gallery
├─────────────────────────┤
│                         │
│                         │
│                         │
│      CANVAS AREA        │  ← Maximum drawing space
│      (full width)       │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ ┌──┐┌──┐┌──┐┌──┐┌──┐   │
│ │🖍️││✏️││🖌️││💨││🧹│   │  ← Tool belt (64px icons)
│ └──┘└──┘└──┘└──┘└──┘   │
├─────────────────────────┤
│ 🔴🟠🟡🔵🟣⚪⚫🟢 ▶      │  ← Color strip (scrollable)
│                    more  │
└─────────────────────────┘

EXPANDED COLOR PICKER (tap ▶)
┌─────────────────────────┐
│  ╭─────────────────╮    │
│  │                 │    │
│  │   Color Wheel   │    │  ← Full wheel for custom colors
│  │   (touch drag)  │    │
│  │                 │    │
│  ╰─────────────────╯    │
│                         │
│  Size: ○───●────────○   │  ← Brush size slider (chunky)
│         thin    thick    │
│                         │
│  Recent: 🔴 🔵 🟣 🖤     │
│                         │
│  [Done ✓]               │
└─────────────────────────┘
```

- // components/canvas/Toolbar.tsx


## Parent Gate (Simple & Effective)

- // components/ui/ParentGate.tsx

## PWA Configuration

- // public/manifest.json

## Phase 1 Delivery Checklist
```
PHASE 1 — "The Sketchbook"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Canvas
  ☐ Fabric.js initialized with touch support
  ☐ Freehand drawing (crayon, pencil, marker, spray)
  ☐ Eraser tool
  ☐ Color palette (12 kid-friendly colors)
  ☐ Brush size control
  ☐ Undo / Redo (50-step history)
  ☐ Pinch to zoom, two-finger pan
  ☐ Background options (white, colored, paper texture)
  ☐ Basic shapes (circle, square, star, heart)
  ☐ Sticker pack v1 (animals, nature, emojis — bundled SVGs)

Gallery
  ☐ Museum Walk (horizontal scroll, snap)
  ☐ Grid View toggle
  ☐ Rooms (default: "My Art", "Favorites")
  ☐ Create custom room
  ☐ Move artwork between rooms
  ☐ Artwork detail / "exhibit" view with frame
  ☐ Delete with friendly confirmation
  ☐ Duplicate artwork

Storage & Data
  ☐ Dexie.js schema v1
  ☐ Auto-save every 30 seconds
  ☐ Manual save
  ☐ Export as PNG (save to device)
  ☐ Thumbnail generation on save

UX & Polish
  ☐ PWA manifest + service worker
  ☐ Offline capable (all local data)
  ☐ Sound effects (toggle-able)
  ☐ Celebration animation on gallery save
  ☐ Parent gate (multiplication problem)
  ☐ Responsive: phone → tablet → desktop
  ☐ Loading buddy mascot

Safety
  ☐ No network features in Phase 1
  ☐ No external imports in Phase 1
  ☐ All data stays on device
  ☐ Parent gate on settings & delete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target: Fully usable, delightful, shippable.
```

## Sprint Order

Week 1:  Canvas + Drawing + Touch
Week 2:  Toolbar + Colors + Brushes + Undo
Week 3:  Storage + Save/Load + Thumbnails
Week 4:  Gallery views (Walk + Grid)
Week 5:  Rooms + Artwork management
Week 6:  PWA + Polish + Sounds + Celebrations
Week 7:  Testing on real devices + daughter beta test 🎉