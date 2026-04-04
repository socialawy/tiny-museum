# 🏛️ Tiny Museum

[![CI Pipeline](https://github.com/socialawy/tiny-museum/actions/workflows/pipeline.yml/badge.svg)](https://github.com/socialawy/tiny-museum/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests: 87 Passing](https://img.shields.io/badge/Tests-87%20Passing-brightgreen.svg)](https://github.com/socialawy/tiny-museum)
[![Version: 0.6.0](https://img.shields.io/badge/Version-0.6.0-blue.svg)](https://github.com/socialawy/tiny-museum)

**A creative, local-first studio for kids to create, curate, and animate.**

Tiny Museum is not just a drawing app; it's a complete **Creation → Curation → Exhibition → Publication** loop. Designed for children (ages 4-10), it turns digital sketching into a meaningful journey of pride and ownership.

## 🧠 The Philosophy: "You are an artist. This is your museum."

Unlike apps that focus on passive consumption or AI-generated shortcuts, Tiny Museum empowers kids to build their own creative legacy:
- **Real Animation**: No AI illusions. Kids learn the magic of motion through manual flipbook sequencing and onion skinning.
- **Gallery as a Core Mechanic**: The gallery isn't just a file browser—it's an immersive "Museum Walk" where art is named, framed, and curated into themed rooms.
- **Creation-First**: Every masterpiece reflects the effort and joy of the maker.
- **Local-First & Private**: Your child's art belongs to their device (IndexedDB). No accounts, no trackers, no ads.
- **Safe Publishing**: A parent-gated "Publish to Web" feature allows kids to explicitly choose which works to share in a public online gallery.

## 🏛️ Why Tiny Museum? (Unique Differentiators)

Tiny Museum fills a gap in the market by providing a cohesive **Creation → Curation → Exhibition** loop. Unlike fragmented tools, it offers:

1.  **Gallery as a Core Mechanic**: Not just a file browser, but an immersive space for identity and storytelling.
2.  **Real Animation for Kids**: Manual sequencing (flipbook) over AI automation, building real creative ownership.
3.  **Creation-First Philosophy**: Focuses on the effort and pride of the maker, not digital shortcuts.
4.  **Safe, Intentional Publishing**: Purpose-built safety for young creators.
5.  **Local-First Creative Ownership**: Your data belongs to you, working offline by default.
6.  **Physical ↔ Digital Bridge**: Import hand-drawn art and bring it to life with digital tools.
7.  **Coherent Product Metaphor**: Everything reinforces the idea: *"You are the artist, this is your museum."*

## 🎨 Features

### 1. Create & Compose
- **Core Studio**: Freehand drawing with high-touch, kid-friendly brushes (Crayon, Pencil, Marker, Spray).
- **Mobile-Optimized Toolbar**: Compact 2-row layout on mobile for maximum canvas space.
- **Collage & Import**: Bring in real-world art via camera or files, and enhance it with shapes and stickers.
- **24-Color Palette**: A curated, vibrant palette designed for maximum delight.

### 2. Animate
- **Flipbook Studio**: A simple, tactile frame-by-frame animator with compact 4-row mobile layout.
- **Onion Skinning**: See your previous frame faintly to guide your next move.
- **GIF Export**: Turn your story into a shareable animation.

### 3. Curate & Exhibit
- **Museum Walk**: An immersive horizontal gallery where your art hangs on the wall.
- **Room Management**: Organize your work into "The Giggle Gallery," "Space Adventures," or custom-named rooms.
- **Exhibit Detail**: Name your art and move it between rooms.

### 4. Publish
- **🌐 Web Gallery**: Explicitly publish chosen works to a public online collection (Supabase).
- **Live Badges**: See which of your masterpieces are "Live" globally.

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
