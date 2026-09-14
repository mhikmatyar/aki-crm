-- ============================================================
-- Migration 008 — Owner Role and Permissions
-- Adds 'owner' to user_profiles check constraint.
-- Ensures DELETE permissions for customer_profiles, vehicles,
-- vehicle_purchases, claims, and wa_logs are granted to
-- 'super_admin' and 'owner' only (admin is restricted from deleting).
-- ============================================================

-- 1. Update user_profiles role check constraint
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('super_admin', 'owner', 'admin'));

-- 2. Customer profiles delete policy
DROP POLICY IF EXISTS "Super admins can delete customer_profiles" ON customer_profiles;
DROP POLICY IF EXISTS "customer_profiles_delete" ON customer_profiles;

CREATE POLICY "customer_profiles_delete" ON customer_profiles
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('super_admin', 'owner'));

-- 3. Vehicles delete policy
DROP POLICY IF EXISTS "Users can delete vehicles" ON vehicles;
DROP POLICY IF EXISTS "vehicles_delete" ON vehicles;

CREATE POLICY "vehicles_delete" ON vehicles
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('super_admin', 'owner'));

-- 4. Vehicle purchases delete policy
DROP POLICY IF EXISTS "Users can delete purchases" ON vehicle_purchases;
DROP POLICY IF EXISTS "vehicle_purchases_delete" ON vehicle_purchases;

CREATE POLICY "vehicle_purchases_delete" ON vehicle_purchases
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('super_admin', 'owner'));

-- 5. Claims delete policy
DROP POLICY IF EXISTS "claims_delete" ON claims;

CREATE POLICY "claims_delete" ON claims
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('super_admin', 'owner'));

-- 6. WA Logs delete policy
DROP POLICY IF EXISTS "wa_logs_delete" ON wa_logs;

CREATE POLICY "wa_logs_delete" ON wa_logs
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('super_admin', 'owner'));
