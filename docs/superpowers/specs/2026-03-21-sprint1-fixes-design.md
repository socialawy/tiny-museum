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

**UI** (`src/components/gallery/RoomSelector.tsx`)
- Long-press (500ms) on a room pill triggers inline rename
- Pill text becomes a text `<input>` pre-filled with current name
- Confirm: Enter key or blur — calls `renameRoom()`, reverts to pill
- Cancel: Escape key — reverts without saving
- Guard: wrap in the existing parent-gate (multiplication check) to prevent accidental rename by a child

### Files changed
- `src/lib/storage/rooms.ts` — add `renameRoom()`
- `src/components/gallery/RoomSelector.tsx` — add long-press + inline edit

---

## 2. Flipbook Playback & Export from Gallery

### Problem
Flipbook artworks appear as gallery cards but the exhibit view (`/gallery/[artworkId]`) has no Play or Export action. The only GIF export entry point is the PlaybackOverlay inside FlipbookStudio — the "purple drawer".

### Design

**Detect flipbook in exhibit view** (`src/app/gallery/[artworkId]/page.tsx`)
- Check `artwork.flipbookId` (or equivalent field). If present, render flipbook-specific actions instead of the regular PNG download.

**Actions added to exhibit view**
- **▶ Play** button — mounts `PlaybackOverlay` in-place (already handles its own frame loading and dismiss). Pass `flipbookId` as prop.
- **💾 Save GIF** button — loads frames via `getFlipbook(artwork.flipbookId)`, calls `exportToGif(frames, fps)`, triggers browser download. Show a loading spinner during export (GIF encoding takes ~1–3s).

**Error handling**
- If flipbook frames are missing or export fails, show a brief toast ("Couldn't export — try opening in Studio").

### Files changed
- `src/app/gallery/[artworkId]/page.tsx` — add Play + Save GIF actions for flipbooks
- No changes to `PlaybackOverlay` or `exportToGif` — reuse as-is

---

## 3. Flipbook Mobile Layout

### Problem
Two distinct layout bugs on mobile:
- **Portrait**: play button is cut off / hidden below viewport
- **Landscape**: canvas/player is too narrow, doesn't fill available width

Both are in FlipbookStudio (`src/components/flipbook/FlipbookStudio.tsx`) and/or PlaybackOverlay.

### Design

**Portrait fix**
- Root cause: canvas flex child is growing to fill all space, pushing the control strip off-screen.
- Fix: give the canvas `flex-1 min-h-0` so it yields space to the control strip. Give the control strip `flex-shrink-0`.
- Ensure the outer container is `h-[100dvh]` (dynamic viewport height) to handle mobile browser chrome correctly.

**Landscape fix**
- Root cause: container has a fixed or max-width constraint that doesn't account for landscape orientation where width > height.
- Fix: in landscape (`@media (orientation: landscape)`), let the canvas fill `100vw` minus the frame strip width. Remove or override any conflicting max-width.
- Frame strip repositions to the side (vertical) in landscape for better use of the wider viewport.

### Files changed
- `src/components/flipbook/FlipbookStudio.tsx` — layout fixes (dvh, flex, landscape orientation)
- `src/components/flipbook/PlaybackOverlay.tsx` — same portrait/landscape treatment if affected

---

## Verification

| Item | How to verify |
|------|---------------|
| Room rename | Long-press a room → rename → refresh page → name persists |
| Fav save | Toggle fav in exhibit → navigate away → return → still favorited |
| Flipbook in gallery | Open a flipbook artwork in exhibit → Play works, Save GIF downloads a valid file |
| Portrait layout | Mobile Chrome, portrait — all controls visible without scrolling |
| Landscape layout | Mobile Chrome, landscape — canvas fills the screen width properly |

---

## Out of Scope (Sprint 2)
- Demo/seed artwork for new visitors
- Gallery thumbnail `next/image` migration
- PIN gate for studio
- CI/CD and test coverage
