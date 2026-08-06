# Project Status

Last checked: 23 Juli 2026

## Status

The app is currently build-ready.

Verified:

- `npm run build` passes.
- Dev server responds at `http://127.0.0.1:3003/`.
- Supabase hierarchy tables exist: `customer_profiles`, `vehicles`, `vehicle_purchases`.
- Active branches endpoint exists: `/api/admin/branches`.

Not fully verified:

- Manual browser QA after login.
- Data migration from old `customers`, because visible old and new customer row counts are both `0`.
- ESLint, because `npm run lint` still prompts for initial Next.js ESLint setup.

## Docs Kept

- `PROJECT_STATUS.md`: current high-level status.
- `API_ROUTES_SUMMARY.md`: current API list.
- `MIGRATION_FIX_GUIDE.md`: migration status and verification guide.
- `HOW_TO_TEST.md`: practical testing steps.
- `TESTING_QA_REPORT.md`: current QA report and remaining checklist.

## Docs Removed

Removed old planning, phase, and comparison documents that no longer matched the current implementation state:

- `ANALISIS_KOMPLEKSITAS_REVISI.md`
- `IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_GUIDE.md`
- `PENJELASAN_UI_STRUCTURE.md`
- `PERBANDINGAN_PRD_VS_IMPLEMENTASI.md`
- `PHASE_1_2_COMPLETE.md`
- `PHASE_4_COMPLETE.md`
- `REQUIREMENTS_BREAKDOWN.md`
- `SKENARIO_SIMPLIFIED.md`
