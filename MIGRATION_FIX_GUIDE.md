# Migration Status And Guide

Last checked: 23 Juli 2026

## Current Status

Schema migration is present in Supabase.

Read-only check using the project `.env.local` confirmed:

| Table | Status | Visible rows |
| --- | --- | ---: |
| `branches` | exists | 4 |
| `customer_profiles` | exists | 0 |
| `vehicles` | exists | 0 |
| `vehicle_purchases` | exists | 0 |
| `customers` | exists | 0 |
| `wa_logs` | exists | 0 |
| `claims` | exists | 0 |

This means the new schema exists. It does not prove that old customer data was moved, because the old `customers` table is also visible as `0` rows with the available anon key.

## Recommended Migration File

Use the safe migration file:

```txt
supabase/migrations/003_hierarchy_refactor_SAFE.sql
```

This file is preferred because it uses `DROP IF EXISTS` before recreating hierarchy objects, which avoids errors from partially applied previous runs.

## Verify In Supabase SQL Editor

Run:

```sql
SELECT COUNT(*) AS branches FROM branches;
SELECT COUNT(*) AS customer_profiles FROM customer_profiles;
SELECT COUNT(*) AS vehicles FROM vehicles;
SELECT COUNT(*) AS vehicle_purchases FROM vehicle_purchases;
SELECT COUNT(*) AS old_customers FROM customers;
```

If old customers should exist but `old_customers = 0`, there is no old data available to migrate in the current database.

## Success Criteria

Migration is considered structurally successful when:

- `customer_profiles`, `vehicles`, and `vehicle_purchases` exist.
- Foreign keys reference the correct parent tables.
- RLS is enabled and policies exist.
- The application builds with `npm run build`.

Migration is considered data-successful only when:

- old `customers` rows existed before migration, and
- corresponding rows now exist in `customer_profiles`, `vehicles`, and `vehicle_purchases`.
