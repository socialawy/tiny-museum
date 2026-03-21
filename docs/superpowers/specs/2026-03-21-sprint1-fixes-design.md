# Sprint 1 — Bug Fixes & Feature Gaps
*Design spec — 2026-03-21*

## Scope

Three independent items, executed sequentially:

1. Room rename
2. Flipbook playback & export from Gallery
3. Flipbook mobile layout (portrait + landscape)

Fav save — investigated, code is correct. Verify manually before any work; skip if working.

---

## 1. Room Rename

### Problem
`renameRoom()` does not exist. The RoomSelector UI is a read-only pill list — rooms can be created and deleted but never renamed.

### Design

**Storage** (`src/lib/storage/rooms.ts`)
- Add `renameRoom(id: string, name: string): Promise<void>`
- Single `db.rooms.update(id, { name })` call
- Guard: if `id === 'my-art' || id === 'favorites'`, throw or silently return — default rooms must not be renamed (the delete flow and flipbook creation depend on `my-art` as a stable fallback ID)

**UI** (`src/components/gallery/RoomSelector.tsx`)
- Long-press (500ms) on a non-default room pill triggers the sequence below
- Implementation: use `onPointerDown` to start a 500 ms `setTimeout`; clear it on `onPointerUp` / `onPointerLeave`. A short tap (pointer up before 500 ms) still fires `onSelect` (room switch) as normal.
- Default rooms (`my-art`, `favorites`) do not respond to long-press
- **Sequence**:
  1. Long-press → `ParentGate` modal appears (existing multiplication-check component, full-screen)
  2. Parent solves the gate → modal closes → the pill becomes an inline `<input>` pre-filled with the current name
  3. Confirm: Enter or blur → calls `renameRoom()` → calls `onRoomRenamed()` callback → reverts to pill display
  4. Cancel: Escape → reverts without saving

**Props interface**
- Add `onRoomRenamed: () => void` to `RoomSelectorProps`
- The gallery page (`src/app/gallery/page.tsx`) passes a handler that calls `listRooms()` and refreshes state — same pattern as the existing `onRoomCreated` callback

### Files changed
- `src/lib/storage/rooms.ts` — add `renameRoom()`
- `src/components/gallery/RoomSelector.tsx` — long-press + gate + inline edit + `onRoomRenamed` prop
- `src/app/gallery/page.tsx` — pass `onRoomRenamed` handler that refreshes room list

---

## 2. Flipbook Playback & Export from Gallery

### Problem
Flipbook artworks appear as gallery cards but the exhibit view (`/gallery/[artworkId]`) has no Play or Export action. The only GIF export entry point is inside `PlaybackOverlay` in FlipbookStudio.

### Detection
- `artwork.type === 'flipbook'` — this is the correct field; there is no `flipbookId`.
- The `artwork` object is already fetched in the page's existing `useEffect` (via `loadArtwork(artworkId)`) and stored in state — no additional fetch needed for detection or FPS.
- Frames are loaded with `loadAllFrames(artwork.id)`.
- FPS is read from `JSON.parse(artwork.canvasJSON).fps`.

### Design

**Display area** (`src/app/gallery/[artworkId]/page.tsx`)
- For flipbooks, the `db.blobs` full-res blob does not exist. Instead, render `artwork.thumbnail` (a Blob stored directly on the Artwork record) as the preview image via a blob URL — same pattern used by `ArtworkCard`.
- The Edit button must route to `/studio/flipbook?id=${artwork.id}` instead of `/studio/canvas?id=` for flipbooks.

**Loading state**
- When `artwork.type === 'flipbook'`, show a **▶ Play** button instead of the PNG download button.
- On click: set `isLoadingFrames = true`, call `loadAllFrames(artwork.id)`, then mount `PlaybackOverlay`.
- While loading: show a spinner on the Play button (disable the button, replace label with "Loading…").
- On error: toast "Couldn't load animation — try opening in Studio", reset loading state.

**Canvas dimensions**
- Read `canvasWidth` and `canvasHeight` from the Fabric JSON of the first loaded frame: `JSON.parse(frames[0].canvasJSON)` contains `width` and `height` at the top level (standard Fabric serialisation). Fall back to `400` / `300` (the FlipbookStudio runtime defaults) if the fields are absent.
- Do **not** hardcode 800×600.

**Empty-frames guard**
- If `loadAllFrames()` resolves but returns `[]`, show the error toast and do **not** mount `PlaybackOverlay`.

**Mounting PlaybackOverlay**
- `PlaybackOverlay` requires: `frames: FlipbookFrame[]`, `fps: number`, `canvasWidth: number`, `canvasHeight: number`, `onClose: () => void`.
- Derive dimensions as above. No live canvas exists in the gallery page.
- The overlay already contains its own **💾 Save GIF** button — no separate export path is needed. Reuse as-is.

**Files changed**
- `src/app/gallery/[artworkId]/page.tsx` — add Play button, async frame load, mount PlaybackOverlay

---

## 3. Flipbook Mobile Layout

### Problem
Two distinct layout bugs in `FlipbookStudio`:
- **Portrait**: play button (and other controls) are cut off below the viewport
- **Landscape**: canvas is too narrow, doesn't fill available width

### Design

**Portrait fix** (`src/components/flipbook/FlipbookStudio.tsx`)
- Outer container: change from `h-screen` to `h-[100dvh]` to account for mobile browser chrome
- Canvas flex child: `flex-1 min-h-0` — yields space rather than overflowing
- Control strip: `flex-shrink-0` — always visible, never pushed off-screen
- Frame strip: `flex-shrink-0` — same

**Landscape fix** (`src/components/flipbook/FlipbookStudio.tsx`)
- Keep `FrameStrip` horizontal (no vertical mode needed — the simpler fix)
- In landscape (`@media (orientation: landscape)` or Tailwind `landscape:` variant): the canvas fills the full width minus any side chrome, and the frame strip sits at the bottom at a reduced height (e.g., `h-20` instead of default)
- Remove any `max-w-*` or fixed-width constraint on the canvas container that fires only in landscape
- `PlaybackOverlay` (`src/components/flipbook/PlaybackOverlay.tsx`): apply the same `h-[100dvh]` and portrait/landscape treatment if it has the same layout constraints

### Files changed
- `src/components/flipbook/FlipbookStudio.tsx` — dvh, flex fixes, landscape override
- `src/components/flipbook/PlaybackOverlay.tsx` — same treatment if affected

---

## Verification

| Item | How to verify |
|------|---------------|
| Room rename | Long-press a non-default room → parent gate → rename → refresh → name persists |
| Default rooms | Long-press "My Art" or "Favorites" → nothing happens |
| Fav save | Toggle fav in exhibit → navigate away → return → still favorited |
| Flipbook play in gallery | Open flipbook exhibit → ▶ Play → overlay opens and animates |
| Flipbook GIF from gallery | Inside overlay → 💾 Save GIF → valid .gif downloads |
| Portrait layout | Mobile Chrome portrait — all controls visible, no scrolling needed |
| Landscape layout | Mobile Chrome landscape — canvas fills width, frame strip visible at bottom |

---

## Out of Scope (Sprint 2)
- Demo/seed artwork for new visitors
- Gallery thumbnail `next/image` migration
- PIN gate for studio
- CI/CD and test coverage
