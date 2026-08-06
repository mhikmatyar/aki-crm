# API Routes Summary

Last checked: 23 Juli 2026

Status: build passed with `npm run build`.

## Active Routes

### Customer Profiles

Base path: `/api/customer-profiles`

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/customer-profiles` | List customer profiles. Supports `search` and `limit`. |
| POST | `/api/customer-profiles` | Create a customer profile. |
| GET | `/api/customer-profiles/[id]` | Get one customer profile with vehicles and purchases. |
| PATCH | `/api/customer-profiles/[id]` | Update a customer profile. |
| DELETE | `/api/customer-profiles/[id]` | Delete a customer profile. Related vehicles and purchases are deleted by cascade. |

### Vehicles

Base path: `/api/vehicles`

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/vehicles` | List vehicles. Supports `customer_id`. |
| POST | `/api/vehicles` | Create a vehicle for an existing customer profile. |
| GET | `/api/vehicles/[id]` | Get one vehicle with purchase history. |
| PATCH | `/api/vehicles/[id]` | Update a vehicle. |
| DELETE | `/api/vehicles/[id]` | Delete a vehicle. Related purchases are deleted by cascade. |

### Vehicle Purchases

Base path: `/api/vehicle-purchases`

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/vehicle-purchases` | List purchases with vehicle, customer, and branch details. |
| POST | `/api/vehicle-purchases` | Create a battery purchase for an existing vehicle. |
| GET | `/api/vehicle-purchases/[id]` | Get one purchase. |
| PATCH | `/api/vehicle-purchases/[id]` | Update a purchase. |
| DELETE | `/api/vehicle-purchases/[id]` | Delete a purchase. |

Supported query parameters:

- `vehicle_id`: filter purchases by vehicle.
- `customer_id`: filter purchases by customer through vehicles.
- `age_filter`: one of `all`, `<3`, `3-6`, `6-12`, `12-18`, `>18`.

### Admin

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/admin/branches` | List active branches for purchase forms. |
| POST | `/api/admin/create-user` | Create a user. Requires authenticated `super_admin`. |

## Notes

- API routes use `@/lib/supabase/server`; the old `@supabase/auth-helpers-nextjs` import has been removed.
- Dynamic API routes are marked with `export const dynamic = 'force-dynamic'` because they use cookies through Supabase SSR.
- There is no automated API test suite yet; current verification is build plus read-only Supabase table checks.
