# 🏛️ Tiny Museum Architecture

Tiny Museum is a local-first creative application built with Next.js, Fabric.js, and Dexie.js. It is designed to be resilient, offline-capable, and simple to maintain.

## 🧱 System Overview

Tiny Museum operates in a "hybrid" mode: the studio, gallery, and core creative loop are 100% local, while publishing art online is an explicit opt-in action.

```mermaid
graph TD
    subgraph Browser
        A[Next.js App Router] --> B[Fabric.js Canvas Engine]
        A --> C[Dexie.js / IndexedDB]
        A --> D[Zustand Stores]
        B <--> C[Artwork & Frame Data]
        C <--> E[Local Storage (Thumbnails, Audio)]
    end

    subgraph Cloud
        F[Supabase Storage]
        G[Supabase Postgres]
        H[Vercel ISR Gallery]
    end

    A -- "Explicit Publish" --> F
    A -- "Metadata Sync" --> G
    H -- "Fetch Artworks" --> G
    H -- "Fetch Images" --> F
```

## 🏗️ Core Layers

### 🎨 Canvas Engine (Fabric.js)
The heart of the application. It handles freehand drawing, shapes, stickers, and undo/redo history. Fabric.js is wrapped in a custom hook `useFabricCanvas` for lifecycle management and touch abstraction.

### 💾 Storage Layer (Dexie.js)
We use IndexedDB to store all user data (artworks, frames, and rooms). Dexie.js provides a clean, promise-based API and handles schema migrations.
- `Artwork`: Metadata for each canvas masterpiece.
- `FlipbookFrame`: Individual frames for animations.
- `ArtworkBlob`: High-resolution exports (PNG, SVG, GIF).

### 🎬 Flipbook Studio
A custom implementation of a frame-by-frame animator. It manages frame order, onion skinning, and GIF rendering. Each frame is a Fabric.js JSON snapshot.

### 🌐 Cloud Bridge (Supabase)
When a user chooses to "Publish" their art:
1.  The canvas is rendered to a PNG blob.
2.  The blob is uploaded to a public Supabase Storage bucket.
3.  Metadata (title, room, etc.) is written to a Supabase Postgres table.
4.  The online gallery (`/gallery/published`) is revalidated using Next.js ISR.

## 📱 Design for Tiny Humans

The application adheres to strict UX principles for kids:
- **Chunky touch targets** (min 48px).
- **Minimal text**; reliance on icons and color coding.
- **Generous undo** (50+ steps per session).
- **No destructive actions** without a parent gate.
- **Vibrant aesthetics** that feel like an art tool, not software.
