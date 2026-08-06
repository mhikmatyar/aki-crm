-- ============================================================
-- Migration 006 — WA logs support for new customer hierarchy
-- Allows WhatsApp reminder logs to point to:
-- customer_profiles -> vehicles -> vehicle_purchases
-- instead of requiring a legacy customers row.
-- ============================================================

ALTER TABLE wa_logs
  ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE;

ALTER TABLE wa_logs
  ADD COLUMN IF NOT EXISTS vehicle_purchase_id UUID REFERENCES vehicle_purchases(id) ON DELETE CASCADE;

-- New customer profiles may no longer have a matching row in the legacy customers table.
ALTER TABLE wa_logs
  ALTER COLUMN customer_id DROP NOT NULL;

-- Keep old data connected when legacy ids were reused as customer profile ids.
UPDATE wa_logs
SET customer_profile_id = customer_id
WHERE customer_profile_id IS NULL
  AND customer_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM customer_profiles
    WHERE customer_profiles.id = wa_logs.customer_id
  );

CREATE INDEX IF NOT EXISTS idx_wa_logs_customer_profile_id
  ON wa_logs(customer_profile_id);

CREATE INDEX IF NOT EXISTS idx_wa_logs_vehicle_purchase_id
  ON wa_logs(vehicle_purchase_id);

DROP POLICY IF EXISTS "wa_logs_select" ON wa_logs;
DROP POLICY IF EXISTS "wa_logs_insert" ON wa_logs;
DROP POLICY IF EXISTS "wa_logs_delete" ON wa_logs;

CREATE POLICY "wa_logs_select" ON wa_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "wa_logs_insert" ON wa_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "wa_logs_delete" ON wa_logs
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');
