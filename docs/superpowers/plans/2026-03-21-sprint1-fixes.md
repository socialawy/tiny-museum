# Sprint 1 Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix room rename (missing), favorites room display (filter bug), flipbook exhibit view (play/export/routing), and flipbook mobile layout (portrait/landscape).

**Architecture:** All changes are local-only (IndexedDB/Dexie + React components). No Supabase, no new routes. The flipbook exhibit changes add a play button that mounts the existing `PlaybackOverlay` component with pre-loaded frames. Room rename adds `renameRoom()` to storage and a long-press flow to `RoomSelector`.

**Tech Stack:** Next.js 15 App Router, React 19, Fabric.js 7, Dexie 4, Tailwind, Vitest + happy-dom for tests.

---

## File Map

| File | Change |
|------|--------|
| `src/lib/storage/rooms.ts` | Add `renameRoom()` |
| `src/lib/storage/__tests__/rooms.test.ts` | Add rename tests |
| `src/components/gallery/RoomSelector.tsx` | Long-press + ParentGate + inline edit + `onRoomRenamed` prop |
| `src/app/gallery/page.tsx` | Pass `onRoomRenamed` handler |
| `src/stores/gallery.store.ts` | Fix favorites room filter (check tags, not roomId) |
| `src/app/gallery/[artworkId]/page.tsx` | Flipbook: thumbnail display, edit routing, play button, overlay |
| `src/components/flipbook/FlipbookStudio.tsx` | Portrait + landscape layout fixes |
| `src/components/flipbook/PlaybackOverlay.tsx` | Same layout fixes if affected |

---

## Task 1: `renameRoom()` — Storage Function (TDD)

**Files:**
- Modify: `src/lib/storage/__tests__/rooms.test.ts`
- Modify: `src/lib/storage/rooms.ts`

- [ ] **Step 1: Add failing tests to `rooms.test.ts`**

Add these two tests inside the existing `describe('Room CRUD', ...)` block:

```typescript
it('renames a custom room', async () => {
  const room = await createRoom('Old Name', '🌊', '#48DBFB');
  await renameRoom(room.id, 'New Name');
  const all = await listRooms();
  const updated = all.find((r) => r.id === room.id);
  expect(updated?.name).toBe('New Name');
});

it('silently ignores rename of default rooms', async () => {
  await renameRoom('my-art', 'Hacked');
  await renameRoom('favorites', 'Hacked');
  const rooms = await listRooms();
  expect(rooms.find((r) => r.id === 'my-art')?.name).toBe('My Art');
  expect(rooms.find((r) => r.id === 'favorites')?.name).toBe('Favorites');
});
```

Also add `renameRoom` to the import line:
```typescript
import { listRooms, createRoom, deleteRoom, renameRoom } from '../rooms';
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/lib/storage/__tests__/rooms.test.ts
```

Expected: 2 failures (`renameRoom is not a function` or similar).

- [ ] **Step 3: Implement `renameRoom()` in `rooms.ts`**

Add after `deleteRoom`:

```typescript
export async function renameRoom(id: string, name: string): Promise<void> {
  if (id === 'my-art' || id === 'favorites') return;
  await db.rooms.update(id, { name });
}
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
npx vitest run src/lib/storage/__tests__/rooms.test.ts
```

Expected: 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/rooms.ts src/lib/storage/__tests__/rooms.test.ts
git commit -m "feat: add renameRoom() with default-room guard"
```

---

## Task 2: Favorites Room Filter Bug

Favorited artworks keep their original `roomId` (e.g. `'my-art'`). The gallery store calls `listArtworksByRoom('favorites')` which does `db.artworks.where('roomId').equals('favorites')` — returning zero results because no artwork has `roomId: 'favorites'`. The fix is to branch on `activeRoomId === 'favorites'` in the store's refresh function and return tag-filtered artworks instead.

**Files:**
- Modify: `src/stores/gallery.store.ts`

- [ ] **Step 1: Read the gallery store**

Open `src/stores/gallery.store.ts` and find the `refresh` function (or wherever `listArtworksByRoom(activeRoomId)` is called to populate the `artworks` state).

- [ ] **Step 2: Add a branch for the favorites room**

In the refresh function, replace the single `listArtworksByRoom(activeRoomId)` call with a branch:

```typescript
// Before (somewhere in the refresh logic):
const artworks = await listArtworksByRoom(activeRoomId);

// After:
const artworks = activeRoomId === 'favorites'
  ? (await listArtworksByRoom('my-art'))  // get all artworks (or use a listAllArtworks helper)
      .concat(await listArtworksByRoom(/* other rooms if needed */))
      .filter(a => a.tags.includes('favorite'))
  : await listArtworksByRoom(activeRoomId);
```

**Simpler approach** — if the store already loads all artworks somewhere, just filter in memory:

```typescript
const all = await db.artworks.orderBy('updatedAt').reverse().toArray();
const artworks = activeRoomId === 'favorites'
  ? all.filter(a => a.tags.includes('favorite'))
  : all.filter(a => a.roomId === activeRoomId);
```

Read the actual store code first to pick the right approach — the key invariant is: **when `activeRoomId === 'favorites'`, filter by `tags.includes('favorite')` across all artworks, not by `roomId`.**

- [ ] **Step 4: Manual verification**

1. Run `npm run dev`
2. Mark an artwork as favorite (⭐) in the exhibit view
3. Go to Gallery → tap "Favorites" room pill
4. Confirm the favorited artwork appears

- [ ] **Step 5: Commit**

```bash
git add src/stores/gallery.store.ts
git commit -m "fix: favorites room filters by tag not roomId"
```

---

## Task 3: RoomSelector — Long-press Rename UI

**Files:**
- Modify: `src/components/gallery/RoomSelector.tsx`
- Modify: `src/app/gallery/page.tsx`

- [ ] **Step 1: Replace `RoomSelector.tsx` with the new implementation**

```typescript
'use client';

import { useState, useRef } from 'react';
import type { Room } from '@/lib/storage/db';
import { CreateRoomDialog } from './CreateRoomDialog';
import { ParentGate } from '@/components/ui/ParentGate';
import { renameRoom } from '@/lib/storage/rooms';
import { useSounds } from '@/hooks/useSounds';

const DEFAULT_ROOM_IDS = ['my-art', 'favorites'];
const LONG_PRESS_MS = 500;

interface RoomSelectorProps {
  rooms: Room[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
  onRoomCreated: () => void;
  onRoomRenamed: () => void;
}

export function RoomSelector({
  rooms,
  activeRoomId,
  onSelect,
  onRoomCreated,
  onRoomRenamed,
}: RoomSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [gateForRoomId, setGateForRoomId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPress = useRef(false);
  const { playSound } = useSounds();

  function handlePointerDown(room: Room) {
    if (DEFAULT_ROOM_IDS.includes(room.id)) return;
    pressTimer.current = setTimeout(() => {
      wasLongPress.current = true;
      setGateForRoomId(room.id);
      pressTimer.current = null;
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function handleGateUnlock() {
    const room = rooms.find((r) => r.id === gateForRoomId);
    if (!room) return;
    setEditValue(room.name);
    setEditingRoomId(gateForRoomId);
    setGateForRoomId(null);
  }

  async function handleRenameConfirm(roomId: string) {
    const trimmed = editValue.trim();
    if (trimmed) {
      await renameRoom(roomId, trimmed);
      onRoomRenamed();
    }
    setEditingRoomId(null);
    setEditValue('');
  }

  function handleRenameCancel() {
    setEditingRoomId(null);
    setEditValue('');
  }

  return (
    <>
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {rooms.map((room) => (
          <div key={room.id} className="flex-shrink-0">
            {editingRoomId === room.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleRenameConfirm(room.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm(room.id);
                  if (e.key === 'Escape') handleRenameCancel();
                }}
                className="px-4 py-2 rounded-full font-bold text-sm border-2 border-kid-purple outline-none"
                style={{ minWidth: 80 }}
              />
            ) : (
              <button
                onClick={() => {
                  // If this click was the tail of a long-press, swallow it
                  if (wasLongPress.current) {
                    wasLongPress.current = false;
                    return;
                  }
                  onSelect(room.id);
                  playSound('roomSwitch');
                }}
                onPointerDown={() => handlePointerDown(room)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full
                  font-bold text-sm whitespace-nowrap
                  transition-all duration-150
                  ${
                    activeRoomId === room.id
                      ? 'text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 border-2 border-gray-200 active:scale-95'
                  }
                `}
                style={activeRoomId === room.id ? { backgroundColor: room.color } : undefined}
              >
                <span>{room.icon}</span>
                <span>{room.name}</span>
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full
                     bg-gray-100 text-gray-400 font-bold text-sm
                     whitespace-nowrap active:scale-95 transition-transform flex-shrink-0"
          style={{ minHeight: 36 }}
        >
          <span>＋</span>
          <span>New Room</span>
        </button>
      </div>

      {showCreate && (
        <CreateRoomDialog
          onCreated={() => {
            setShowCreate(false);
            onRoomCreated();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {gateForRoomId && (
        <ParentGate
          message="A grown-up needs to confirm renaming this room."
          onUnlock={handleGateUnlock}
          onCancel={() => setGateForRoomId(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Update `gallery/page.tsx` — add `onRoomRenamed` prop**

Find the `<RoomSelector` usage and add the new prop:

```typescript
<RoomSelector
  rooms={rooms}
  activeRoomId={activeRoomId}
  onSelect={setActiveRoom}
  onRoomCreated={() => refresh()}
  onRoomRenamed={() => refresh()}
/>
```

- [ ] **Step 3: Manual verification**

1. Run `npm run dev`
2. Create a new room (e.g. "Animals 🦁")
3. Long-press (hold ~0.5s) on it → parent gate appears
4. Solve the multiplication → inline input appears pre-filled
5. Type new name → Enter → pill updates
6. Reload the page → new name persists
7. Long-press "My Art" or "Favorites" → nothing happens

- [ ] **Step 4: Run full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery/RoomSelector.tsx src/app/gallery/page.tsx
git commit -m "feat: room rename via long-press + parent gate"
```

---

## Task 4: Flipbook Exhibit View — Display, Edit Routing, Play Button

**Files:**
- Modify: `src/app/gallery/[artworkId]/page.tsx`

- [ ] **Step 1: Add imports at the top of the exhibit page**

Add these to the existing import block:

```typescript
import { loadAllFrames } from '@/lib/storage/flipbook';
import type { FlipbookFrame } from '@/lib/storage/db';
import { PlaybackOverlay } from '@/components/flipbook/PlaybackOverlay';
```

- [ ] **Step 2: Add flipbook state variables**

Inside `ExhibitPage`, after the existing state declarations, add:

```typescript
const [isLoadingFrames, setIsLoadingFrames] = useState(false);
const [flipbookFrames, setFlipbookFrames] = useState<FlipbookFrame[] | null>(null);
```

- [ ] **Step 3: Fix `handleEdit()` to route flipbooks to the flipbook studio**

Replace the existing `handleEdit` function. Use `artwork!` (non-null assertion) — `handleEdit` is only callable from a button that renders after the `if (!artwork) return` guard, but TypeScript can't infer that:

```typescript
function handleEdit() {
  if (artwork!.type === 'flipbook') {
    router.push(`/studio/flipbook?id=${artworkId}`);
  } else {
    router.push(`/studio/canvas?id=${artworkId}`);
  }
}
```

- [ ] **Step 4: Add the `handlePlay()` function for flipbooks**

Add after `handleEdit`:

```typescript
async function handlePlay() {
  setIsLoadingFrames(true);
  try {
    const frames = await loadAllFrames(artworkId);
    if (frames.length === 0) {
      alert("Couldn't load animation — try opening in Studio");
      return;
    }
    setFlipbookFrames(frames);
  } catch (err) {
    console.error('Frame load failed:', err);
    alert("Couldn't load animation — try opening in Studio");
  } finally {
    setIsLoadingFrames(false);
  }
}
```

- [ ] **Step 5: Fix the artwork image display area for flipbooks**

In the JSX, find the image rendering block (the `<img>` or placeholder inside the gold-frame `<div>`). Replace it with flipbook-aware logic:

```typescript
{/* Display area */}
{artwork.type === 'flipbook' ? (
  <FlipbookThumbnail artwork={artwork} />
) : imageUrl ? (
  <img
    src={imageUrl}
    alt={artwork.title}
    className="w-full rounded"
    draggable={false}
  />
) : (
  <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded">
    <span className="text-5xl">🖼️</span>
  </div>
)}
```

Add the `FlipbookThumbnail` as a small inline component at the top of the file (before `ExhibitPage`):

```typescript
function FlipbookThumbnail({ artwork }: { artwork: Artwork }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!artwork.thumbnail) return;
    const url = URL.createObjectURL(artwork.thumbnail);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [artwork.thumbnail]);

  return thumbUrl ? (
    <img src={thumbUrl} alt={artwork.title} className="w-full rounded" draggable={false} />
  ) : (
    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded">
      <span className="text-5xl">🎬</span>
    </div>
  );
}
```

- [ ] **Step 6: Replace the Download button with a Play button for flipbooks**

Find the `<BigButton onClick={handleDownload} aria-label="Download">📥</BigButton>` line and make it conditional:

```typescript
{artwork.type === 'flipbook' ? (
  <BigButton
    onClick={handlePlay}
    disabled={isLoadingFrames}
    aria-label="Play animation"
  >
    {isLoadingFrames ? '⏳' : '▶️'}
  </BigButton>
) : (
  <BigButton onClick={handleDownload} aria-label="Download">
    📥
  </BigButton>
)}
```

- [ ] **Step 7: Mount PlaybackOverlay when frames are loaded**

Add this at the end of the JSX return, just before the closing `</div>`:

```typescript
{flipbookFrames && (() => {
  // Canvas dims are NOT stored in frame JSON — the flipbook studio reads them
  // from the live Fabric instance at runtime. Use the same hardcoded defaults
  // that FlipbookStudio uses: 400×300.
  const canvasWidth = 400;
  const canvasHeight = 300;
  const fps = (() => {
    try { return JSON.parse(artwork!.canvasJSON).fps ?? 4; }
    catch { return 4; }
  })();
  return (
    <PlaybackOverlay
      frames={flipbookFrames}
      fps={fps}
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      onClose={() => setFlipbookFrames(null)}
    />
  );
})()}
```

- [ ] **Step 8: Manual verification**

1. Create a flipbook in the studio (draw on a frame, add a second frame, draw on that, hit 🏛️ to save)
2. Go to Gallery → tap the flipbook card
3. Confirm: thumbnail shows (frame image, not broken)
4. Confirm: ✏️ Edit routes to `/studio/flipbook?id=...` not canvas
5. Confirm: ▶️ Play loads and opens the animation overlay
6. Inside overlay: hit 💾 Save as GIF → .gif file downloads
7. Confirm: ✕ closes the overlay

- [ ] **Step 9: Commit**

```bash
git add src/app/gallery/[artworkId]/page.tsx
git commit -m "feat: flipbook exhibit — thumbnail, play button, correct edit routing"
```

---

## Task 5: Flipbook Mobile Layout — Portrait & Landscape

**Files:**
- Modify: `src/components/flipbook/FlipbookStudio.tsx`
- Modify: `src/components/flipbook/PlaybackOverlay.tsx`

- [ ] **Step 1: Fix portrait layout in `FlipbookStudio.tsx`**

Find the outer container div (has `className="flex flex-col h-[100dvh] bg-studio-bg"`) — this one is already using `h-[100dvh]` which is correct. Verify the canvas container uses `flex-1`:

```typescript
{/* Canvas container — the ref div */}
<div
  ref={containerRef}
  className="flex-1 min-h-0 relative overflow-hidden"
  style={{ touchAction: 'none' }}
>
```

The key change is adding `min-h-0` to the canvas container. Without it, a flex child won't shrink below its content size, pushing controls off screen.

- [ ] **Step 2: Fix landscape layout in `FlipbookStudio.tsx`**

Find the `FrameStrip` usage and apply landscape height reduction. The frame strip sits below the canvas. We need it to be shorter in landscape.

Find the `<FrameStrip .../>` line and wrap it with a div:

```typescript
<div className="flex-shrink-0 landscape:h-20 landscape:overflow-hidden">
  <FrameStrip frames={frames} currentIndex={currentIndex} onSelectFrame={goToFrame} />
</div>
```

Also ensure the bottom controls div has `flex-shrink-0`:

```typescript
<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-t-2 border-gray-100">
```

And the speed control div:

```typescript
<div className="flex-shrink-0 flex items-center gap-3 px-6 py-2 bg-white border-t border-gray-50">
```

- [ ] **Step 3: Fix `PlaybackOverlay.tsx` for mobile**

The overlay uses `fixed inset-0` which is correct. But make sure it's using `h-[100dvh]` style to avoid browser chrome issues. Find the root div and update:

```typescript
<div
  className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
  style={{ height: '100dvh' }}
  onClick={onClose}
>
```

- [ ] **Step 4: Enable Tailwind `landscape:` variant if needed**

Check `tailwind.config.ts` (or `tailwind.config.js`). If it doesn't have a `landscape` variant, add it:

```typescript
// In the `theme.extend` or `plugins` section — NOT needed in Tailwind v3.3+
// which supports landscape: out of the box via responsive variants.
// Just use `landscape:` prefix directly — it works in Tailwind 3.x.
```

Tailwind 3.x supports `@media (orientation: landscape)` via the `landscape:` variant automatically. No config change needed.

- [ ] **Step 5: Manual verification on mobile**

**Portrait test:**
1. Open Chrome DevTools → mobile device simulation → portrait
2. Navigate to `/studio/flipbook`
3. Confirm all buttons (◀ ▶ 👻 ＋ 📋 ▶️) are visible without scrolling
4. Confirm the canvas takes the space between top bar and controls

**Landscape test:**
1. Switch to landscape in DevTools
2. Confirm the canvas fills the width
3. Confirm the frame strip is visible (smaller) at the bottom
4. Confirm the play ▶️ button is visible

- [ ] **Step 6: Commit**

```bash
git add src/components/flipbook/FlipbookStudio.tsx src/components/flipbook/PlaybackOverlay.tsx
git commit -m "fix: flipbook mobile layout — portrait controls visible, landscape fills width"
```

---

## Task 6: Final Verification Pass

- [ ] **Run full test suite**

```bash
npx vitest run
```

Expected: all tests passing (28 existing + 2 new = 30 total).

- [ ] **Run typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Manual end-to-end walkthrough**

| Scenario | Expected |
|----------|----------|
| Long-press custom room → gate → rename | Name persists on reload |
| Long-press "My Art" | Nothing happens |
| Favorite an artwork → go to Favorites room | Artwork appears |
| Open flipbook exhibit → thumbnail visible | Not a broken image |
| ✏️ Edit on flipbook | Routes to `/studio/flipbook?id=...` |
| ▶️ Play on flipbook | Overlay animates |
| 💾 Save GIF in overlay | File downloads |
| Flipbook studio on mobile portrait | All controls visible |
| Flipbook studio on mobile landscape | Canvas fills width |

- [ ] **Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: sprint 1 post-verification cleanup"
```
