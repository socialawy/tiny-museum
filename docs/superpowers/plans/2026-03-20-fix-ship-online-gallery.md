# Fix, Ship & Online Gallery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the current product to Vercel (Phases 1–3 are done and usable now), then add a publish flow so artwork from any device can appear in a public online gallery backed by Supabase.

**Architecture:** Studio stays 100% local-first (Fabric.js + IndexedDB, unchanged). A new "Publish 🌐" action exports the canvas to PNG, uploads to Supabase Storage, and writes metadata to Supabase Postgres. A public `/gallery/published` page reads from Supabase with 60s ISR — fast, cacheable, zero auth.

**Tech Stack:** Next.js 15, Fabric.js 7, Dexie.js (IndexedDB), Supabase JS v2 (Postgres + Storage), Vercel (hosting + ISR), Vitest (tests), GitHub (source + deploy trigger)

---

## File Map

### Phase 3.5 — Ship (new / modified)
| File | Action | Purpose |
|------|--------|---------|
| `src/components/gallery/ArtworkCard.tsx` | Modify | Add flipbook badge (🎬) and published badge (🌐) |
| `vercel.json` | Create | Minimal Vercel config |

### Phase 4 — Online Gallery (new / modified)
| File | Action | Purpose |
|------|--------|---------|
| `.env.local.example` | Create | Document required env vars |
| `src/lib/cloud/client.ts` | Create | Supabase singleton |
| `src/lib/cloud/types.ts` | Create | `PublishedArtwork` interface |
| `src/lib/cloud/publish.ts` | Create | `publishArtwork`, `unpublishArtwork` |
| `src/lib/cloud/gallery.ts` | Create | `fetchPublishedArtworks` |
| `src/lib/cloud/__tests__/publish.test.ts` | Create | Unit tests (mocked Supabase) |
| `src/lib/storage/db.ts` | Modify | Add `publishedUrl?: string` to `Artwork` interface |
| `src/lib/storage/artworks.ts` | Modify | Export `dataURLtoBlob`, add `updatePublishedUrl` |
| `src/components/gallery/PublishedGallery.tsx` | Create | Public gallery grid (client component) |
| `src/app/gallery/published/page.tsx` | Create | Server page with ISR — public, zero auth |
| `src/components/canvas/StudioCanvas.tsx` | Modify | Add Publish button + publish handler |
| `src/app/gallery/[artworkId]/page.tsx` | Modify | Show published link + parent-gated unpublish |

---

## Phase 3.5 — Fix & Ship

> The app is a complete, usable product today. This phase deploys it.

---

### Task 1: Flipbook Badge on ArtworkCard

**Files:**
- Modify: `src/components/gallery/ArtworkCard.tsx`

The card doesn't distinguish flipbooks from drawings. Add a small 🎬 badge so kids know which ones animate.

- [ ] **Step 1: Open `ArtworkCard.tsx` and find the frame div** (the one with the gold gradient background, around line 33)

- [ ] **Step 2: Add a type badge inside the frame**, positioned top-right over the artwork:

```tsx
{/* Type badge */}
{artwork.type === 'flipbook' && (
  <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
    🎬
  </div>
)}
{artwork.publishedUrl && (
  <div className="absolute top-2 left-2 z-10 bg-kid-purple/80 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
    🌐
  </div>
)}
```

Place this inside the outermost `relative` div (the frame wrapper), before the gold gradient div.

- [ ] **Step 3: Verify** — run `npm run dev`, open gallery, confirm drawings show no badge and flipbooks show 🎬. The `publishedUrl` field doesn't exist yet on the type — TypeScript will complain. Suppress with `(artwork as any).publishedUrl` for now; Task 5 adds the real field.

- [ ] **Step 4: Commit**

```bash
git add src/components/gallery/ArtworkCard.tsx
git commit -m "feat: add flipbook and published badges to ArtworkCard"
```

---

### Task 2: Vercel Config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`** in the project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

- [ ] **Step 2: Verify `next.config.ts`** is clean (no webpack config that would break Vercel builds):

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Run a production build locally to confirm zero errors:**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — zero type errors, zero lint errors. Fix any that appear before continuing.

- [ ] **Step 4: Commit**

```bash
git add vercel.json
git commit -m "chore: add vercel config"
```

---

### Task 3: GitHub Push + Vercel Deploy

- [ ] **Step 1: Create a GitHub repository**

Option A — GitHub CLI (faster):
```bash
gh repo create tiny-museum --public --source=. --remote=origin --push
```

Option B — Manual:
1. Go to github.com → New repository → name: `tiny-museum`
2. Run:
```bash
git remote add origin https://github.com/<your-username>/tiny-museum.git
git branch -M master
git push -u origin master
```

- [ ] **Step 2: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 3: Login and link project**

```bash
vercel login
vercel
```

Follow prompts:
- Link to existing project? → No (create new)
- Project name → `tiny-museum`
- Framework → Next.js (auto-detected)
- Build & output settings → accept defaults

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

Expected output: `✅ Production: https://tiny-museum.vercel.app` (or similar URL).

- [ ] **Step 5: Smoke test the deployed URL**

Open the URL in a mobile browser. Verify:
- `/` — home page loads
- `/studio/canvas` — drawing canvas opens and works
- `/gallery` — gallery loads (empty or with a test artwork)
- `/studio/flipbook` — flipbook studio opens

- [ ] **Step 6: (Optional) Connect GitHub for auto-deploy**

In Vercel dashboard → Settings → Git → connect the `tiny-museum` repo. Future pushes to `master` auto-deploy.

---

## Phase 4 — Online Gallery

> Studio stays local. "Publish" makes artwork visible to anyone with the URL.

---

### Task 4: Supabase Project Setup (Manual Steps)

No code in this task — set up the Supabase project and schema.

- [ ] **Step 1: Create a Supabase project**

1. Go to supabase.com → New project
2. Name: `tiny-museum`
3. Database password: save it somewhere safe
4. Region: pick closest to your users
5. Wait for project to provision (~2 min)

- [ ] **Step 2: Run the schema SQL**

In Supabase dashboard → SQL Editor → New query. Paste and run:

```sql
-- Published artworks table
create table published_artworks (
  id          text primary key,
  title       text not null,
  type        text not null check (type in ('drawing', 'collage', 'flipbook')),
  image_url   text not null,
  room_name   text,
  published_at timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Anyone can read
alter table published_artworks enable row level security;

create policy "Public read"
  on published_artworks for select
  using (true);

create policy "Anon insert"
  on published_artworks for insert
  with check (true);

create policy "Anon delete"
  on published_artworks for delete
  using (true);

create policy "Anon update"
  on published_artworks for update
  using (true);
```

- [ ] **Step 3: Create Storage bucket**

In Supabase dashboard → Storage → New bucket:
- Name: `artwork-files`
- Public: ✅ (checked)
- File size limit: 5MB
- Allowed MIME types: `image/png, image/gif, image/webp`

- [ ] **Step 4: Set bucket policy to allow public uploads**

In Storage → artwork-files → Policies → New policy:
- Policy name: `Allow public uploads`
- Operation: INSERT
- Target roles: anon
- Policy definition: `true`

Also add a DELETE policy for anon (for unpublish).

- [ ] **Step 5: Copy API keys**

In Supabase dashboard → Project Settings → API:
- Copy `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon` `public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 6: Create `.env.local`** in project root (gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] **Step 7: Create `.env.local.example`** (committed, no real values):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

```bash
git add .env.local.example
git commit -m "chore: add env var template"
```

---

### Task 5: Extend Artwork Type + Install Supabase

**Files:**
- Modify: `src/lib/storage/db.ts`
- Modify: `src/lib/storage/artworks.ts`

- [ ] **Step 1: Install Supabase JS**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: Add `publishedUrl` to the `Artwork` interface in `db.ts`**

Find the `Artwork` interface and add one optional field:

```typescript
export interface Artwork {
  id: string;
  title: string;
  roomId: string;
  type: 'drawing' | 'collage' | 'flipbook';
  thumbnail: Blob;
  canvasJSON: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  publishedUrl?: string; // set when artwork is published to Supabase
}
```

No Dexie version bump needed — IndexedDB stores the field automatically once the interface has it.

- [ ] **Step 3: Export `dataURLtoBlob` from `artworks.ts`**

Find the `dataURLtoBlob` function (line ~6) and add `export`:

```typescript
export function dataURLtoBlob(dataUrl: string): Blob {
```

- [ ] **Step 4: Add `updatePublishedUrl` function to `artworks.ts`** (append to end of file):

```typescript
export async function updatePublishedUrl(
  id: string,
  publishedUrl: string | undefined,
): Promise<void> {
  await db.artworks.update(id, { publishedUrl });
}
```

- [ ] **Step 5: Run typecheck — expect clean**

```bash
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage/db.ts src/lib/storage/artworks.ts package.json package-lock.json
git commit -m "feat: add publishedUrl to Artwork type, install supabase-js"
```

---

### Task 6: Cloud Library (TDD)

**Files:**
- Create: `src/lib/cloud/client.ts`
- Create: `src/lib/cloud/types.ts`
- Create: `src/lib/cloud/publish.ts`
- Create: `src/lib/cloud/gallery.ts`
- Create: `src/lib/cloud/__tests__/publish.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/cloud/__tests__/publish.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Artwork } from '@/lib/storage/db';

// Mock the supabase client before importing publish
const mockUpload = vi.fn().mockResolvedValue({ error: null });
const mockRemove = vi.fn().mockResolvedValue({ error: null });
const mockGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/artwork-files/test-id.png' },
});
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockResolvedValue({ error: null });
const mockEq = vi.fn().mockReturnValue({ error: null });
const mockSelect = vi.fn().mockReturnValue({
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
});

vi.mock('../client', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'published_artworks') {
        return {
          upsert: mockUpsert,
          delete: () => ({ eq: mockEq }),
          select: mockSelect,
        };
      }
    }),
  },
}));

const mockArtwork: Artwork = {
  id: 'test-id',
  title: 'My Painting',
  roomId: 'my-art',
  type: 'drawing',
  thumbnail: new Blob(),
  canvasJSON: '{}',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: [],
};

describe('publishArtwork', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads PNG to Supabase Storage', async () => {
    const { publishArtwork } = await import('../publish');
    const imageBlob = new Blob(['fake-png'], { type: 'image/png' });
    await publishArtwork(mockArtwork, imageBlob);
    expect(mockUpload).toHaveBeenCalledWith(
      'test-id.png',
      imageBlob,
      expect.objectContaining({ contentType: 'image/png', upsert: true }),
    );
  });

  it('inserts row into published_artworks', async () => {
    const { publishArtwork } = await import('../publish');
    const imageBlob = new Blob(['fake-png'], { type: 'image/png' });
    await publishArtwork(mockArtwork, imageBlob);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-id', title: 'My Painting', type: 'drawing' }),
    );
  });

  it('returns the public URL', async () => {
    const { publishArtwork } = await import('../publish');
    const imageBlob = new Blob(['fake-png'], { type: 'image/png' });
    const url = await publishArtwork(mockArtwork, imageBlob);
    expect(url).toContain('test-id.png');
  });
});

describe('unpublishArtwork', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes from published_artworks table', async () => {
    const { unpublishArtwork } = await import('../publish');
    await unpublishArtwork('test-id');
    expect(mockEq).toHaveBeenCalledWith('id', 'test-id');
  });

  it('removes file from Storage', async () => {
    const { unpublishArtwork } = await import('../publish');
    await unpublishArtwork('test-id');
    expect(mockRemove).toHaveBeenCalledWith(['test-id.png']);
  });
});

describe('fetchPublishedArtworks', () => {
  it('returns empty array when no artworks published', async () => {
    const { fetchPublishedArtworks } = await import('../gallery');
    const result = await fetchPublishedArtworks();
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL (modules don't exist yet)**

```bash
npx vitest run src/lib/cloud/__tests__/publish.test.ts
```

Expected: FAIL — `Cannot find module '../client'`

- [ ] **Step 3: Create `src/lib/cloud/client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Create `src/lib/cloud/types.ts`**

```typescript
export interface PublishedArtwork {
  id: string;
  title: string;
  type: 'drawing' | 'collage' | 'flipbook';
  image_url: string;
  room_name: string | null;
  published_at: string;
  updated_at: string;
}
```

- [ ] **Step 5: Create `src/lib/cloud/publish.ts`**

```typescript
import type { Artwork } from '@/lib/storage/db';
import { supabase } from './client';

export async function publishArtwork(artwork: Artwork, imageBlob: Blob): Promise<string> {
  const filename = `${artwork.id}.png`;

  // 1. Upload image file
  const { error: uploadError } = await supabase.storage
    .from('artwork-files')
    .upload(filename, imageBlob, { upsert: true, contentType: 'image/png' });

  if (uploadError) throw uploadError;

  // 2. Get public URL (sync — no network call)
  const { data: urlData } = supabase.storage
    .from('artwork-files')
    .getPublicUrl(filename);

  const imageUrl = urlData.publicUrl;

  // 3. Write metadata row
  const { error: dbError } = await supabase.from('published_artworks').upsert({
    id: artwork.id,
    title: artwork.title,
    type: artwork.type,
    image_url: imageUrl,
    room_name: null,
    updated_at: new Date().toISOString(),
  });

  if (dbError) throw dbError;

  return imageUrl;
}

export async function unpublishArtwork(id: string): Promise<void> {
  const { error: dbError } = await supabase
    .from('published_artworks')
    .delete()
    .eq('id', id);

  if (dbError) throw dbError;

  // Best-effort file removal — don't throw if this fails
  await supabase.storage.from('artwork-files').remove([`${id}.png`]);
}
```

- [ ] **Step 6: Create `src/lib/cloud/gallery.ts`**

```typescript
import { supabase } from './client';
import type { PublishedArtwork } from './types';

export async function fetchPublishedArtworks(): Promise<PublishedArtwork[]> {
  const { data, error } = await supabase
    .from('published_artworks')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx vitest run src/lib/cloud/__tests__/publish.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 8: Run full test suite — expect all green**

```bash
npx vitest run
```

Expected: 25 tests passing (20 existing + 5 new).

- [ ] **Step 9: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 10: Commit**

```bash
git add src/lib/cloud/ package.json package-lock.json
git commit -m "feat: cloud library for publish/unpublish/fetch (5 tests)"
```

---

### Task 7: Publish Button in Studio

**Files:**
- Modify: `src/components/canvas/Toolbar.tsx` — add publish button (where 💾 and 🏛️ live)
- Modify: `src/components/canvas/StudioCanvas.tsx` — add handler + toast + pass props to Toolbar

The Publish button sits in the top bar next to 🏛️. The 💾 and 🏛️ buttons are in `Toolbar.tsx` (not `StudioCanvas.tsx`), passed as `onSave` and `onSendToGallery` props. Publish follows the same pattern: handler in `StudioCanvas`, button in `Toolbar`.

- [ ] **Step 1: Add publish props to `ToolbarProps` in `Toolbar.tsx`**

Find the `ToolbarProps` interface (line ~10) and add three new optional props after `onSendToGallery`:

```typescript
onPublish?: () => void;
publishing?: boolean;
publishedLink?: string | null;
```

- [ ] **Step 2: Destructure the new props** in the `Toolbar` function signature (after `onSendToGallery`):

```typescript
onPublish,
publishing = false,
publishedLink = null,
```

- [ ] **Step 3: Add the Publish button** in `Toolbar.tsx` after the 🏛️ `BigButton` (around line 178):

```tsx
{onPublish && (
  <BigButton onClick={onPublish} disabled={publishing} aria-label="Publish online">
    {publishing ? '⏳' : publishedLink ? '✅' : '🌐'}
  </BigButton>
)}
```

- [ ] **Step 4: In `StudioCanvas.tsx`, add imports at the top**:

```typescript
import { publishArtwork } from '@/lib/cloud/publish';
import { updatePublishedUrl, dataURLtoBlob } from '@/lib/storage/artworks';
```

- [ ] **Step 5: Add publish state** in `StudioCanvas.tsx` near the other state declarations:

```typescript
const [publishing, setPublishing] = useState(false);
const [publishedLink, setPublishedLink] = useState<string | null>(null);
```

- [ ] **Step 6: Add the `handlePublish` function** in `StudioCanvas.tsx` after `handleSendToGallery`:

```typescript
const handlePublish = useCallback(async () => {
  if (!canvas || !currentArtworkId || publishing) return;
  setPublishing(true);
  try {
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
    const imageBlob = dataURLtoBlob(dataUrl);
    const { loadArtwork } = await import('@/lib/storage/artworks');
    const artwork = await loadArtwork(currentArtworkId);
    if (!artwork) throw new Error('Artwork not found');
    const url = await publishArtwork(artwork, imageBlob);
    await updatePublishedUrl(currentArtworkId, url);
    setPublishedLink(url);
    playSound('celebrate');
  } catch (err) {
    console.error('Publish failed:', err);
  } finally {
    setPublishing(false);
  }
}, [canvas, currentArtworkId, publishing, playSound]);
```

- [ ] **Step 7: Pass publish props to `<Toolbar>` in `StudioCanvas.tsx`**

Find the `<Toolbar>` usage (around line 170) and add three new props:

```tsx
onPublish={currentArtworkId ? handlePublish : undefined}
publishing={publishing}
publishedLink={publishedLink}
```

- [ ] **Step 8: Add published link toast** in `StudioCanvas.tsx` — a dismissible overlay that appears after publish succeeds. Place it just before the closing `</div>` of the root container:

```tsx
{publishedLink && (
  <div className="absolute top-16 right-2 z-50 bg-white rounded-kid shadow-lg p-3 text-sm max-w-[220px]">
    <p className="font-bold text-kid-purple mb-1">Published! 🎉</p>
    <a href="/gallery/published" target="_blank" className="text-blue-600 underline text-xs">
      View online gallery →
    </a>
    <button
      onClick={() => setPublishedLink(null)}
      className="absolute top-1 right-2 text-gray-400 text-xs"
    >
      ✕
    </button>
  </div>
)}
```

- [ ] **Step 9: Verify** — run dev, draw something, save, tap 🌐. Should see ⏳ during upload then ✅. Check Supabase dashboard → Table Editor → `published_artworks` to confirm a row appeared.

- [ ] **Step 10: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 11: Commit**

```bash
git add src/components/canvas/Toolbar.tsx src/components/canvas/StudioCanvas.tsx
git commit -m "feat: publish button in studio — uploads to Supabase on tap"
```

---

### Task 8: Published Gallery Page

**Files:**
- Create: `src/components/gallery/PublishedGallery.tsx`
- Create: `src/app/gallery/published/page.tsx`

This page is public, fast (ISR), and shows all published artworks. No auth, no login.

- [ ] **Step 1: Create `src/components/gallery/PublishedGallery.tsx`** (client component):

```tsx
'use client';

import type { PublishedArtwork } from '@/lib/cloud/types';

interface PublishedGalleryProps {
  artworks: PublishedArtwork[];
}

export function PublishedGallery({ artworks }: PublishedGalleryProps) {
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-6">
        <p className="text-6xl">🏛️</p>
        <h2 className="text-2xl font-extrabold text-kid-purple">The gallery is empty!</h2>
        <p className="text-gray-500">Publish artwork from the studio to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {artworks.map((artwork, i) => (
        <div
          key={artwork.id}
          className="gallery-card-enter flex flex-col items-center"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Frame */}
          <div
            className="relative w-full rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 50%, #C9A84C 100%)',
              padding: 8,
              aspectRatio: '4 / 5',
            }}
          >
            <div className="w-full h-full rounded-sm overflow-hidden bg-[#FFFEF7] p-1.5">
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            {artwork.type === 'flipbook' && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full px-1.5 py-0.5">
                🎬
              </div>
            )}
          </div>
          {/* Plaque */}
          <div className="mt-2 px-3 py-1.5 rounded-lg text-center w-full"
               style={{ background: '#2D1B69', color: '#F5E6D3' }}>
            <p className="text-sm font-bold truncate">{artwork.title}</p>
            <p className="text-xs opacity-70">
              {new Date(artwork.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/gallery/published/page.tsx`** (server component, ISR):

```tsx
import { fetchPublishedArtworks } from '@/lib/cloud/gallery';
import { PublishedGallery } from '@/components/gallery/PublishedGallery';
import Link from 'next/link';

export const revalidate = 60; // rebuild at most every 60 seconds

export const metadata = {
  title: 'Tiny Museum — Gallery',
  description: 'A tiny museum of original artwork',
};

export default async function PublishedGalleryPage() {
  let artworks = [];
  try {
    artworks = await fetchPublishedArtworks();
  } catch {
    // Supabase unavailable — show empty state gracefully
    artworks = [];
  }

  return (
    <main className="min-h-screen bg-museum-canvas">
      <header className="flex items-center justify-between px-4 py-3 border-b border-kid-yellow/30">
        <h1 className="text-xl font-extrabold text-kid-purple">🏛️ Tiny Museum</h1>
        <Link
          href="/gallery"
          className="text-sm text-kid-purple font-bold underline"
        >
          My Art
        </Link>
      </header>
      <PublishedGallery artworks={artworks} />
    </main>
  );
}
```

- [ ] **Step 3: Verify** — run dev, navigate to `/gallery/published`. Should show the empty state (or your published artwork if Task 7 was done). No errors in console.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery/PublishedGallery.tsx src/app/gallery/published/
git commit -m "feat: public /gallery/published page with ISR (60s)"
```

---

### Task 9: Publish Status + Unpublish in Exhibit View

**Files:**
- Modify: `src/app/gallery/[artworkId]/page.tsx`

When viewing a published artwork in the exhibit, show a link to the online gallery + a parent-gated Unpublish button.

- [ ] **Step 1: Open `src/app/gallery/[artworkId]/page.tsx`** and read the current delete/unpublish flow structure.

- [ ] **Step 2: Add unpublish state** alongside the delete state:

```typescript
const [showUnpublishGate, setShowUnpublishGate] = useState(false);
```

- [ ] **Step 3: Add `handleUnpublish` function**:

```typescript
const handleUnpublish = useCallback(async () => {
  if (!artwork) return;
  try {
    const { unpublishArtwork } = await import('@/lib/cloud/publish');
    await unpublishArtwork(artwork.id);
    const { updatePublishedUrl } = await import('@/lib/storage/artworks');
    await updatePublishedUrl(artwork.id, undefined);
    setArtwork({ ...artwork, publishedUrl: undefined });
  } catch (err) {
    console.error('Unpublish failed:', err);
  } finally {
    setShowUnpublishGate(false);
  }
}, [artwork]);
```

- [ ] **Step 4: Add published section to the exhibit view UI** — below the artwork title/actions area:

```tsx
{artwork.publishedUrl && (
  <div className="mt-4 p-3 bg-kid-purple/10 rounded-kid text-center">
    <p className="text-sm font-bold text-kid-purple mb-1">🌐 Published online</p>
    <a
      href="/gallery/published"
      target="_blank"
      className="text-xs text-blue-600 underline"
    >
      View in online gallery →
    </a>
    <div className="mt-2">
      <button
        onClick={() => setShowUnpublishGate(true)}
        className="text-xs text-gray-500 underline"
      >
        Unpublish
      </button>
    </div>
  </div>
)}

{showUnpublishGate && (
  <ParentGate
    message="Unpublish this artwork?"
    onUnlock={handleUnpublish}
    onCancel={() => setShowUnpublishGate(false)}
  />
)}
```

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 6: Full test suite**

```bash
npx vitest run
```

Expected: 25 tests passing.

- [ ] **Step 7: Commit**

```bash
git add src/app/gallery/[artworkId]/page.tsx
git commit -m "feat: published status and parent-gated unpublish in exhibit view"
```

---

### Task 10: Set Env Vars in Vercel + Redeploy

- [ ] **Step 1: Add env vars to Vercel**

Option A — Vercel CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# paste the URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# paste the anon key when prompted
```

Option B — Vercel Dashboard:
Settings → Environment Variables → add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production.

- [ ] **Step 2: Push everything and deploy**

```bash
git push origin master
vercel --prod
```

- [ ] **Step 3: Final smoke test on production URL**

1. Open the deployed URL on a phone
2. Draw something → Save → tap 🌐 Publish
3. Open `<your-url>/gallery/published` in an incognito window (or another device)
4. Your artwork should appear within 60 seconds (ISR revalidation)
5. Open the exhibit view → confirm published status and Unpublish option shows
6. Check Supabase Table Editor → `published_artworks` → row is there

---

## Phase 5 — Horizon: The Real Museum (Future)

> Not planned yet. Captured here so architectural decisions today don't close doors.

The gallery is currently a flat grid. The long-term vision is a **walkable 3D museum** — rooms you walk through, artwork hanging on walls, perspective shifting as you move. The data model is already shaped for it:

- `rooms` table → gallery rooms / halls
- `published_artworks.room_name` → which room an artwork belongs to
- Each artwork has position, type, metadata

When this becomes a priority, the build will extend the current schema (no breaking changes) and add a Three.js / React Three Fiber layer on top of `/gallery/published`. The flat grid becomes the fallback for low-end devices.

**Other future phases from the original blueprint:**
- Phase 4 (original): Import from OpenClipart/Biodiversity Heritage Library, SVG export, PDF print
- Parent dashboard: manage published artworks, set gallery title, share link
- GIF export for flipbooks in the public gallery (currently shows static thumbnail)
