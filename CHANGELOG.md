# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-04-04

### Added
- **Mobile Toolbar Optimization**: Significantly reduced toolbar footprint for more canvas space:
  - **Studio Canvas**: Reduced from 4 rows to 2 rows on mobile
  - **Flipbook Studio**: Reduced from 6 rows to 4 rows on mobile
- **Full-Screen Canvas Layout**: Split toolbar into top and bottom sections with canvas sandwiched between

### Changed
- **Auto-Save Interval**: Reduced from 30s to 5s for faster recovery
- **Publish Safety**: Added parent gate to prevent accidental publishing from studio

### Fixed
- **Save on Unmount**: Fixed work loss when using browser back button on mobile PWA
- **TypeScript Lint**: Fixed readonly process.env.NODE_ENV errors in tests

## [0.5.0] - 2026-03-27

### Added
- **Browser Migration**: Users can now export their entire museum to a JSON file and import it in a different browser or device. Available in the Settings page.

## [0.4.0] - 2026-03-25

### Added (Sprint 4: First Impression)
- **Coach Mark Infrastructure**: Implemented a portal-based tutorial system with animated spotlights and speech bubbles.
- **Onboarding Tours**: Created guided walkthroughs for the **Studio**, **Flipbook Studio**, and **Gallery** to help new users.
- **Demo Museum Seeder**: Added a background seeder that populates the museum with high-quality demo content (3 drawings, 1 animation) on the first visit.
- **Replayability**: Added a "Replay All Tutorials" button in Settings to reset the onboarding experience.
- **Seeder Reliability**: Improved `canvasJSON` and thumbnail generation to ensure demo content is visible and functional.

### Fixed
- **Demo Content**: Fixed an issue where demo artworks appeared blank when opened in the studio.
- **Flipbook Animation**: Fixed a bug in the seeder where demo flipbook frames were empty, preventing playback.
- **Toolbar Cleanup**: Removed unused `artworkId` state in `FlipbookStudio.tsx`.
- **Save Refinement**: Improved `handleSendToGallery` in `StudioCanvas.tsx` for more robust gallery transitions.

## [0.3.0] - 2026-03-25

### Added (Sprint 3: Product Polish & Management)
- **Canvas Guards**: Implemented `isCanvasEmpty` to prevent saving/auto-saving blank canvases in Studio and Flipbook.
- **Room Management**: Added renaming and deletion of custom rooms (parent-gated).
- **Organization**: Integrated `RoomPicker` into the exhibit view to move artworks between rooms.
- **Flipbook Studio**: 
  - Responsive **Landscape Mode** with a compact mobile-optimized toolbar.
  - **Background Picker** for animations.
  - **Onion Skin** stability and performance optimizations (pre-rendering frames).
- **Pro Polish**: 
  - **Per-tool Memory**: Brushes now remember their last used size independently.
  - **24-Color Palette**: Expanded from 12 to 24 curated vibrant colors.
  - **Brand Personality**: Randomized gallery naming (e.g., "The Giggle Gallery").
- **Documentation**: Integrated project philosophy and the "Creation → Curation → Exhibition" loop into `README.md` and `ARCHITECTURE.md`.

### Fixed
- **Flipbook Ghosting**: Fixed a race condition causing "ghost frames" during frame duplication (#2).
- **Save Hygiene**: Fixed an issue where "Save to Gallery" could still persist an empty canvas from the Studio.
- **Mobile Playback**: Swapped canvas rendering for data URLs in `PlaybackOverlay` to ensure compatibility across all mobile browsers.

### Performance & Quality
- **Test Suite**: Expanded to **73 passing unit tests**.
- **Repo Health**: Consolidated `master` branch into `main`. `main` is now the primary production branch.

---

## [0.2.0] - 2026-03-25

### Added (Autonomous Pipeline: Jules + Gemini)
- **PR #10**: Gallery thumbnails switched to `object-cover` (2026-03-22)
- **PR #11**: Mobile safe-area insets (closes #5) (2026-03-23)
- **PR #12**: Keyboard avoidance in studio (closes #6) (2026-03-24)
- **PR #13**: Studio access control — PIN gate with settings page (closes #7) (2026-03-25)

### Pipeline Health
- 4 PRs merged autonomously in 3 days — one per day, like clockwork
- Gemini APPROVED all 4 (no escalations, no request-changes)
- `delete_branch_on_merge` enabled, stale branches cleaned
- Remaining issues: #8 (Vercel Analytics), #9 (PWA install prompt)

---

## [0.1.0] - 2026-03-21

### Added
- **CI/CD Pipeline**: GitHub Actions workflow for linting, type-checking, and tests.
- **Robust Documentation**: README, CONTRIBUTING, ARCHITECTURE, LICENSE, and PR Template.
- **50 Unit Tests**: Comprehensive coverage for Cloud, Storage, Export, and Utilities.
- **Issue Templates**: Standardized Bug Report and Feature Request forms.
- **Security & Conduct**: Added `SECURITY.md` and `CODE_OF_CONDUCT.md`.

### Fixed
- **Flipbook Engine**: Fixed a critical syntax error in `FlipbookStudio.tsx` blocking builds.
- **Code Quality**: Removed unused variables in `FlipbookStudio.tsx`.
- **Workspace Hygiene**: Cleaned up the root directory with improved `.gitignore` rules.

## [0.0.1] - 2026-03-20
- Initial internal MVP release.
- Core drawing studio and early museum gallery.
