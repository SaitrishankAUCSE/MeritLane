# Changelog

All notable changes to MeritLane will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-10-21

### Changed
- **Devin.ai Design System & Landing Page Transformation**: Fully redesigned the public landing page (`app/page.tsx`), navigation header (`components/Navbar.tsx`), site footer (`components/ui/footer-section.tsx`), and public theme design tokens (`app/globals.css`) to strictly match the font, UI architecture, layout aesthetic, and color palette of [devin.ai](https://devin.ai/):
  - **Typography**: Transitioned to Devin's signature Neo-Grotesk sans-serif (`NB International Pro` / `Plus Jakarta Sans`) with tight letter tracking (`-0.035em`), tight line-height (`1.04`), and high-contrast `#101010` ink.
  - **Colors**: Adopted Devin's warm off-white canvas wash (`#F8F8F6`), elevated clean white card surfaces (`#FFFFFF`), subtle borders (`rgba(0, 0, 0, 0.08)`), dark compiler and terminal surfaces (`#141414`), Devin blue accents (`#3080FF`), and verified green status badges (`#00A558` / `#22C55E`).
  - **Pill Button Architecture**: Standardized on Devin's exact `rounded-full` pill buttons for primary black actions (`#101010`), outline ghost actions, and compact navbar pills (`h-[32px] px-4`).
  - **Interactive Hero Canvas**: Implemented an interactive Devin-style application window with macOS dots, live session tracking (`meritlane/proctored-sandbox`), tabbed code execution, real-time hidden unit test suites (10/10 passing), cryptographic SHA-256 authority proof badges, and git telemetry.
  - **Bento Feature Grid**: Deployed Devin's signature 2-column and 3-column bento cards showcasing live compiler evaluation, ATS filter bypass, anti-cheat proctoring, and enterprise fine-grained controls.

### Fixed
- **TypeScript Strict Invariance**: Added `Record<string, any>` type annotation to `verifiedSkillsMap` in [app/employer/jobs/[id]/applicants/page.tsx](file:///app/employer/jobs/[id]/applicants/page.tsx) to achieve 0 TypeScript errors across the entire codebase.

## [0.1.1] - 2026-10-21

### Added
- **Bespoke "Crest & Key" Button Architecture**: Introduced signature asymmetric diagonal radii (`rounded-[16px_4px_16px_4px]` and `rounded-[20px_5px_20px_5px]`) with smooth cubic-bezier corner-inversion hover transitions (`rounded-[4px_16px_4px_16px]`), dimensional lighting, and metallic inner bevels across [Button.tsx](file:///components/ui/Button.tsx), [GlobalBackButton.tsx](file:///components/ui/GlobalBackButton.tsx), and [LogoutConfirmModal.tsx](file:///components/ui/LogoutConfirmModal.tsx).
- **GStack Agent Workflow Suite**: Integrated Garry Tan's GStack autonomous developer skills into `.agents/skills` (`gstack-cso`, `gstack-health`, `gstack-qa`, `gstack-design-review`, `gstack-office-hours`, `gstack-ship`, `gstack-benchmark`).
- **Branded Micro-Loaders**: Deployed custom rotating Meritlane logo loaders across assessment test evaluation suites and admin question draft generators.

### Fixed
- **React Rules of Hooks**: Resolved conditional `React.useMemo` pagination hook execution in [app/admin/question-drafts/page.tsx](file:///app/admin/question-drafts/page.tsx) by hoisting hooks before early loading/auth returns.
- **React Compiler Memoization**: Synchronized `useCallback` dependency array in [app/candidate/inbox/page.tsx](file:///app/candidate/inbox/page.tsx) to satisfy strict React Compiler specifications.
- **ESLint & Turbopack Health**: Purged unused variables in `jobs.ts`, `structural.ts`, and `skills.ts`; refined [eslint.config.mjs](file:///eslint.config.mjs) to bring project-wide code health to 10/10 with zero errors.
- **Variable Reassignment in Assessment API**: Ensured safe re-fetch reassignment of `candidateDoc` in [app/api/start-assessment/route.ts](file:///app/api/start-assessment/route.ts).
