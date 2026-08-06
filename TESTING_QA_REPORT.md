# Testing And QA Report

Last checked: 23 Juli 2026

## Summary

| Area | Status | Notes |
| --- | --- | --- |
| Build | Pass | `npm run build` completed successfully. |
| Dev server | Pass | Running at `http://127.0.0.1:3003/`. |
| Supabase schema | Pass | New hierarchy tables are present. |
| Data migration | Not proven | Visible counts are `0` for old and new customer data. |
| Manual UI QA | Pending | Needs browser testing after login. |
| Automated tests | Not configured | No test script exists in `package.json`. |
| ESLint | Not configured | `npm run lint` opens Next.js setup prompt. |

## Fixed During Cleanup

- Added missing UI components: `Card`, `Label`, `Textarea`, and `Checkbox`.
- Updated `Badge` to support the variants used by the app.
- Replaced old Supabase auth-helper imports with the existing Supabase SSR helper.
- Updated form selects to use the local native `Select` component API.
- Added missing `GET /api/admin/branches`.
- Marked Supabase-backed API routes as dynamic.

## Verified Build

Command:

```bash
npm run build
```

Result:

```txt
Compiled successfully
Linting and checking validity of types
```

## Supabase Read-Only Check

| Table | Visible row count |
| --- | ---: |
| `branches` | 4 |
| `customers` | 0 |
| `customer_profiles` | 0 |
| `vehicles` | 0 |
| `vehicle_purchases` | 0 |
| `wa_logs` | 0 |
| `claims` | 0 |

## Manual QA Checklist

- [ ] Login works.
- [ ] `/customers` loads.
- [ ] Create customer profile works.
- [ ] Customer detail page loads.
- [ ] Add vehicle works.
- [ ] Edit vehicle works.
- [ ] Delete vehicle works.
- [ ] Add battery purchase works.
- [ ] Edit battery purchase works.
- [ ] Delete battery purchase works.
- [ ] `/dashboard` loads.
- [ ] Dashboard age filter works.
- [ ] `/api/admin/branches` returns active branches.

## Current Decision

The implementation is build-ready and schema-ready. Before calling it production-ready, complete the manual QA checklist with logged-in access and confirm whether real customer data is expected in Supabase.
