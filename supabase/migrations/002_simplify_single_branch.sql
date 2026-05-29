-- ============================================================
-- Migration 002 — Simplify to single branch
-- - Remove branch-based RLS isolation
-- - All authenticated users can SELECT / INSERT / UPDATE
-- - Only super_admin can DELETE
-- - Make lokasi_cabang and wa_logs.cabang nullable
-- ============================================================

-- Make columns nullable (not all installs may already be NOT NULL)
ALTER TABLE customers ALTER COLUMN lokasi_cabang DROP NOT NULL;
ALTER TABLE wa_logs   ALTER COLUMN cabang         DROP NOT NULL;

-- ========================
-- CUSTOMERS policies
-- ========================
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;

CREATE POLICY "customers_select" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "customers_insert" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "customers_update" ON customers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "customers_delete" ON customers
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');

-- ========================
-- CLAIMS policies
-- ========================
DROP POLICY IF EXISTS "claims_select" ON claims;
DROP POLICY IF EXISTS "claims_insert" ON claims;
DROP POLICY IF EXISTS "claims_update" ON claims;

CREATE POLICY "claims_select" ON claims
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "claims_insert" ON claims
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "claims_update" ON claims
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "claims_delete" ON claims
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');

-- ========================
-- WA_LOGS policies
-- ========================
DROP POLICY IF EXISTS "wa_logs_select" ON wa_logs;
DROP POLICY IF EXISTS "wa_logs_insert" ON wa_logs;

CREATE POLICY "wa_logs_select" ON wa_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "wa_logs_insert" ON wa_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "wa_logs_delete" ON wa_logs
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');

-- ========================
-- USER PROFILES policies
-- ========================
DROP POLICY IF EXISTS "profiles_read_own"           ON user_profiles;
DROP POLICY IF EXISTS "profiles_insert_superadmin"  ON user_profiles;
DROP POLICY IF EXISTS "profiles_update_superadmin"  ON user_profiles;

CREATE POLICY "profiles_select" ON user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "profiles_update" ON user_profiles
  FOR UPDATE USING (get_my_role() = 'super_admin');

CREATE POLICY "profiles_delete" ON user_profiles
  FOR DELETE USING (get_my_role() = 'super_admin');
