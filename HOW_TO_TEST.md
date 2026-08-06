# How To Test

Last checked: 23 Juli 2026

## Current Local URL

The dev server is running at:

```txt
http://127.0.0.1:3003/
```

## 1. Build Check

Run:

```bash
npm run build
```

Expected result:

- Next.js compiles successfully.
- TypeScript validation passes.
- Route list includes `/api/admin/branches`, `/api/customer-profiles`, `/api/vehicles`, and `/api/vehicle-purchases`.

## 2. Migration Check

Use Supabase SQL Editor for the most reliable result.

Recommended migration file:

```txt
supabase/migrations/003_hierarchy_refactor_SAFE.sql
```

Verify tables:

```sql
SELECT COUNT(*) FROM branches;
SELECT COUNT(*) FROM customer_profiles;
SELECT COUNT(*) FROM vehicles;
SELECT COUNT(*) FROM vehicle_purchases;
```

Current read-only check from `.env.local` confirmed these tables exist:

| Table | Count visible with anon key |
| --- | ---: |
| branches | 4 |
| customer_profiles | 0 |
| vehicles | 0 |
| vehicle_purchases | 0 |

The zero counts do not necessarily mean migration failed. They mean either no data exists yet or RLS limits what the anon key can see.

## 3. Manual UI Test

1. Open `/login` and sign in.
2. Open `/customers`.
3. Create a customer profile.
4. Open the customer detail page.
5. Add a vehicle.
6. Add a battery purchase.
7. Edit and delete one vehicle or purchase.
8. Open `/dashboard` and test the age filter.

## 4. Browser Console API Smoke Tests

After login, run these from the browser console:

```javascript
fetch('/api/customer-profiles').then((r) => r.json()).then(console.log)
fetch('/api/vehicles').then((r) => r.json()).then(console.log)
fetch('/api/vehicle-purchases').then((r) => r.json()).then(console.log)
fetch('/api/admin/branches').then((r) => r.json()).then(console.log)
```

Expected result:

- Each request returns JSON.
- Branches should return the active branch list.
- Customer, vehicle, and purchase lists may be empty until test data is created.

## Known Gaps

- No automated unit/integration tests are configured.
- `npm run lint` still triggers Next.js ESLint setup prompt because ESLint has not been configured.
- Migration data movement cannot be fully proven from anon key access. Use Supabase SQL Editor for admin-level confirmation.
