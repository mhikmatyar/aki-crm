-- ============================================================
-- Migration 005 — Claims support for new customer hierarchy
-- Allows claims to point directly to:
-- customer_profiles -> vehicles -> vehicle_purchases
-- instead of requiring the legacy customers table.
-- ============================================================

ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE;

ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS vehicle_purchase_id UUID REFERENCES vehicle_purchases(id) ON DELETE CASCADE;

-- New claims may no longer have a matching row in the legacy customers table.
ALTER TABLE claims
  ALTER COLUMN customer_id DROP NOT NULL;

-- Backfill profile id for installs where old ids were reused in customer_profiles.
UPDATE claims
SET customer_profile_id = customer_id
WHERE customer_profile_id IS NULL
  AND customer_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM customer_profiles
    WHERE customer_profiles.id = claims.customer_id
  );

CREATE INDEX IF NOT EXISTS idx_claims_customer_profile_id
  ON claims(customer_profile_id);

CREATE INDEX IF NOT EXISTS idx_claims_vehicle_purchase_id
  ON claims(vehicle_purchase_id);

-- Keep policies simple: all authenticated users can manage operational claims,
-- delete remains restricted to super_admin.
DROP POLICY IF EXISTS "claims_select" ON claims;
DROP POLICY IF EXISTS "claims_insert" ON claims;
DROP POLICY IF EXISTS "claims_update" ON claims;
DROP POLICY IF EXISTS "claims_delete" ON claims;

CREATE POLICY "claims_select" ON claims
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "claims_insert" ON claims
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "claims_update" ON claims
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "claims_delete" ON claims
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');
