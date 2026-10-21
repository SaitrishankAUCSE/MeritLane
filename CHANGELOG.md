# Changelog

All notable changes to MeritLane will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
