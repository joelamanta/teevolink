# TeevoLink — Decision Log

All significant architectural and design decisions are recorded here.
Format: date → decision → why → alternatives rejected.

---

## 2026-04-23 — Project scaffolded as Vite + React + TypeScript
Context: Starting TeevoLink from scratch.
Decision: React 18 + TypeScript + Vite as the project foundation.
Reason: Industry standard, any developer worldwide can maintain it. TypeScript catches bugs at build time — critical for handoff quality. Vite is the fastest build tool available.
Alternatives rejected: Next.js (overkill — no server-side rendering needed for a WebHID app), plain HTML/JS (not maintainable at scale).

## 2026-04-23 — Tailwind CSS v4 with @tailwindcss/vite plugin
Context: Choosing styling approach.
Decision: Tailwind CSS v4 via the official Vite plugin.
Reason: Utility-first approach means consistent spacing/sizing without separate CSS files to maintain. Built-in responsive breakpoints. Pairs cleanly with the CSS variable design tokens from the Teevo Design System.
Alternatives rejected: CSS Modules (more files to manage), Styled Components (runtime overhead), plain CSS (too hard to maintain at scale).

## 2026-04-23 — Dark mode as default theme
Context: TeevoLink is a gaming peripheral driver; the Hub App defaults to light mode.
Decision: Dark mode is the default and primary theme for TeevoLink. Light mode available via manual toggle.
Reason: Gaming peripheral software is universally dark-themed (Razer Synapse, Logitech G Hub, SteelSeries GG). Brand green #78BE1F is more vivid and premium on dark backgrounds. Same token system as Hub App — just different default.
Alternatives rejected: Light mode default (wrong context for gaming hardware), System-preference auto-detect (inconsistent, harder to design for).

## 2026-04-23 — No backend, no user accounts
Context: Architecture decision.
Decision: TeevoLink is 100% client-side. No server, no database, no auth.
Reason: All mouse settings live on the mouse flash memory. Nothing to store remotely. No backend = no data breach possible, no maintenance cost, no downtime. GDPR/privacy compliance is trivially satisfied ("we store nothing").
Alternatives rejected: Cloud profile sync (complex, requires backend, privacy implications — future optional feature if Joel decides).

## 2026-04-23 — Auto-save to flash (no Save button)
Context: How settings should be persisted.
Decision: All settings auto-save to mouse flash on change with 500ms debounce. No explicit Save button.
Reason: Modern UX standard (Adobe, Figma, Google Docs). Save buttons create user anxiety ("did I save?"). They create confusion when settings reset on disconnect.
Alternatives rejected: Manual save button (creates friction), Save on disconnect (data loss risk if crash/disconnect).

## 2026-04-23 — Feature-based folder structure
Context: Project scalability for future features and mouse models.
Decision: src/features/[feature]/ per panel, src/devices/[model]/ per mouse model.
Reason: Adding a new feature or mouse model = adding one folder with zero changes to existing code. Manufacturers can maintain individual features independently without understanding the whole codebase.
Alternatives rejected: Page-based structure (features bleed across pages), Flat structure (doesn't scale past 5 features).

## 2026-04-23 — Teevo Design System v2.0 as source of truth
Context: Brand consistency across all Teevolution products.
Decision: Use teevo-design-system.css tokens verbatim. No inventing new colors, shadows, radius, or motion values.
Reason: Same brand system as the Hub App. Manufacturers will understand the token system. Joel doesn't need to re-specify brand guidelines — they're already documented.
Alternatives rejected: Custom design system from scratch (duplicates work, risks inconsistency), Generic Tailwind theme (loses brand identity).

## 2026-04-23 — System font stack (no web fonts)
Context: Typography.
Decision: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif` — system fonts only.
Reason: Zero font loading time. OS-native rendering. Inter is widely installed. Consistent with Hub App.
Alternatives rejected: Google Fonts (adds network dependency and loading time), Custom font (adds bundle size and licensing complexity).
