# 📂 Tiny Museum Project Structure

This document provides a detailed overview of the Tiny Museum codebase, mapping out the directories and key files.

## 📁 Root Directory
- `.github/`: GitHub Actions and workflows.
- `docs/`: Project documentation (Architecture, Blueprint, Devlog).
- `public/`: Static assets, icons, and PWA manifest.
- `scripts/`: Utility scripts for development (e.g., icon generation).
- `src/`: Main source code of the application.
- `package.json`: Project dependencies and scripts.
- `next.config.ts`: Next.js configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `tsconfig.json`: TypeScript configuration.
- `vitest.config.ts`: Vitest configuration for testing.

---

## 📁 `src/` Directory Details

### 🌐 `app/` (Next.js App Router)
- `layout.tsx`: Root layout, including providers and global shell.
- `page.tsx`: Landing page ("Front Door").
- `gallery/`: Museum gallery views.
    - `page.tsx`: Main gallery (Room/Grid view).
    - `[artworkId]/`: Single artwork exhibit view.
    - `published/`: Online published artworks view.
- `studio/`: Creative workspace.
    - `canvas/`: Freehand drawing studio.
    - `flipbook/`: Animation studio.
- `settings/`: App settings and parent gates.

### 🧩 `components/`
- `canvas/`: React components for the drawing engine.
    - `StudioCanvas.tsx`: The main Fabric.js workspace component.
    - `Toolbar.tsx`: Drawing tools and controls.
    - `BackgroundPicker.tsx`, `ImportPanel.tsx`, `ShapePanel.tsx`, `StickerPanel.tsx`.
- `gallery/`: Components for displaying and managing art.
    - `MuseumWalk.tsx`: Horizontal scroll view.
    - `GalleryGrid.tsx`: Grid view.
    - `ArtworkCard.tsx`, `RoomSelector.tsx`, `CreateRoomDialog.tsx`.
- `ui/`: Common UI elements designed for kids.
    - `BigButton.tsx`, `FriendlyDialog.tsx`, `Celebrations.tsx`.
    - `ParentGate.tsx`, `PinGate.tsx`: Safety gates for adults.
    - `SoundToggle.tsx`.
- `layout/`: App-wide layout components (Nav, Shell).

### 📚 `lib/` (Core Logic)
- `storage/`: Database logic using Dexie.js (IndexedDB).
    - `db.ts`: Database schema.
    - `artworks.ts`: CRUD for artwork records.
    - `rooms.ts`: Gallery internal organization.
    - `flipbook.ts`: Animation frame management.
- `fabric/`: Fabric.js utilities and custom hooks.
- `audio/`: Sound effects management.
- `export/`: Image and GIF export logic.

### 🧠 `stores/` (State Management)
- `gallery.store.ts`: Zustand store for gallery state.
- `ui.store.ts`: Zustand store for UI preferences (sound, theme).

### 🎨 `assets/`
- `stickers/`, `frames/`, `sounds/`, `textures/`, `mascot/`.

---

## 🧪 Testing
- `src/test/`: Global test setup and mocks.
- `**/__tests__/`: Colocated unit tests for components and logic.

---

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Canvas Engine**: Fabric.js
- **Local Database**: Dexie.js (IndexedDB)
- **State Management**: Zustand
- **Testing**: Vitest
