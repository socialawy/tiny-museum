# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
