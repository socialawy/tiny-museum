# 🏛️ Tiny Museum

**A creative space for tiny humans.**

Tiny Museum is a digital sketchbook, collage studio, and animator designed specifically for children (best for ages 4-10). It focuses on high-touch, low-friction creativity, ensuring that every interaction is delightful and encouraging.

## 🎨 Features

- **Core Studio**: Freehand drawing with kid-friendly brushes (Crayon, Pencil, Marker, Spray).
- **Import & Collage**: Bring in photos via camera or files, add shapes, and use curated stickers.
- **Flipbook Animator**: Create frame-by-frame animations with onion skinning and export as GIFs.
- **Museum Walk**: Horizontal, immersive gallery view where your art hangs on the wall.
- **Multi-Room Gallery**: Organize your masterpieces into different themed rooms.
- **Local-First & Safe**: All data stays on your device (IndexedDB). No trackers, no ads, and no social features without a parent gate.
- **Publish to Web**: Explicitly choose to publish artworks to a public online gallery (Supabase).

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Canvas Engine**: [Fabric.js](http://fabricjs.com/)
- **Storage**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & CSS keyframes
- **Database & Storage**: [Supabase](https://supabase.com/) (Postgres + Cloud Storage)
- **Export**: [gif.js](https://jnordberg.github.io/gif.js/) (integrated logic)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/socialawy/tiny-museum.git
    cd tiny-museum
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env.local` file with your Supabase credentials (see `.env.local.example`).
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) (or your network IP) in your browser.

## 🏛️ Project Structure

- `src/app`: Next.js pages and layouts.
- `src/components`: React components (Studio, Gallery, UI).
- `src/lib`: Core logic (Storage, Fabric.js wrappers, Cloud publishing, GIF export).
- `src/hooks`: Custom React hooks for canvas and data lifecycle.
- `src/stores`: Zustand stores for global application state.
- `docs/`: Design blueprint and project devlog.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
