-- ============================================================
-- Migration 003 — Hierarchy Refactor (Simplified Version)
-- 
-- GOAL: Transform flat customer structure into hierarchy:
--   customer_profiles → vehicles → vehicle_purchases
--
-- SCOPE: 
--   ✅ Create 3-level hierarchy
--   ✅ Migrate existing data
--   ✅ Update foreign keys (wa_logs, claims)
--   ✅ Update RLS policies
--   ❌ NO multi-milestone follow-up (kept simple)
--
-- Timeline: Phase 1 of simplified implementation
-- ============================================================

-- ========================
-- STEP 1: CREATE NEW TABLES
-- ========================

-- 1.1 CUSTOMER PROFILES (basic info only)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  nomor_telp TEXT NOT NULL,
  
  -- New fields for customer profile
  catatan_umum TEXT,
  is_agen BOOLEAN NOT NULL DEFAULT false,
  detail_agen TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- 1.2 VEHICLES (multiple per customer)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  
  plat_nomor TEXT,
  jenis_mobil TEXT NOT NULL,
  merek_mobil TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 VEHICLE PURCHASES (multiple aki purchases per vehicle)
CREATE TABLE IF NOT EXISTS vehicle_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  -- Aki details
  tipe_aki TEXT NOT NULL,
  merek_aki TEXT NOT NULL,
  
  -- Purchase details
  harga_beli NUMERIC NOT NULL DEFAULT 0,
  tanggal_pembelian DATE NOT NULL,
  lokasi_cabang UUID REFERENCES branches(id),
  
  -- Warranty info
  durasi_garansi_bulan INT NOT NULL DEFAULT 12,
  status_garansi TEXT NOT NULL DEFAULT 'valid' CHECK (status_garansi IN ('valid', 'expired')),
  
  -- Additional fields
  tukar_tambah BOOLEAN NOT NULL DEFAULT false,
  catatan_transaksi TEXT,
  
  -- Simple reminder (NO complex multi-milestone)
  reminder_bulan INT NOT NULL DEFAULT 12,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- ========================
-- STEP 2: CREATE INDEXES
-- ========================
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicle_purchases_vehicle_id ON vehicle_purchases(vehicle_id);
CREATE INDEX idx_vehicle_purchases_tanggal ON vehicle_purchases(tanggal_pembelian);
CREATE INDEX idx_customer_profiles_nama ON customer_profiles(nama);
CREATE INDEX idx_customer_profiles_nomor_telp ON customer_profiles(nomor_telp);

-- ========================
-- STEP 3: ADD TRIGGERS
-- ========================

-- Auto-update updated_at timestamp
CREATE TRIGGER customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vehicle_purchases_updated_at BEFORE UPDATE ON vehicle_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update warranty status based on date
CREATE OR REPLACE FUNCTION update_warranty_status()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.tanggal_pembelian + (NEW.durasi_garansi_bulan || ' months')::INTERVAL) < CURRENT_DATE THEN
    NEW.status_garansi = 'expired';
  ELSE
    NEW.status_garansi = 'valid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_purchases_warranty_status 
  BEFORE INSERT OR UPDATE ON vehicle_purchases
  FOR EACH ROW EXECUTE FUNCTION update_warranty_status();

-- ========================
-- STEP 4: MIGRATE EXISTING DATA
-- ========================

-- 4.1 Migrate customers to customer_profiles
INSERT INTO customer_profiles (id, nama, nomor_telp, created_at, updated_at, created_by)
SELECT 
  id,
  nama,
  nomor_telp,
  created_at,
  updated_at,
  created_by
FROM customers
ON CONFLICT (id) DO NOTHING;

-- 4.2 Create vehicles for each customer
INSERT INTO vehicles (customer_id, jenis_mobil, created_at)
SELECT 
  id as customer_id,
  jenis_mobil,
  created_at
FROM customers
ON CONFLICT DO NOTHING;

-- 4.3 Create vehicle_purchases (link to vehicles)
INSERT INTO vehicle_purchases (
  vehicle_id,
  tipe_aki,
  merek_aki,
  harga_beli,
  tanggal_pembelian,
  lokasi_cabang,
  reminder_bulan,
  created_at,
  updated_at,
  created_by
)
SELECT 
  v.id as vehicle_id,
  c.item_dibeli as tipe_aki,
  'Generic' as merek_aki, -- Default value, bisa diupdate manual
  c.harga_beli,
  c.tanggal_pembelian,
  c.lokasi_cabang,
  c.reminder_bulan,
  c.created_at,
  c.updated_at,
  c.created_by
FROM customers c
INNER JOIN vehicles v ON v.customer_id = c.id
ON CONFLICT DO NOTHING;

-- ========================
-- STEP 5: UPDATE FOREIGN KEYS
-- ========================

-- 5.1 Add new foreign key columns to wa_logs (keep old for now)
ALTER TABLE wa_logs ADD COLUMN IF NOT EXISTS vehicle_purchase_id UUID REFERENCES vehicle_purchases(id) ON DELETE CASCADE;

-- 5.2 Update wa_logs to link to vehicle_purchases
UPDATE wa_logs wl
SET vehicle_purchase_id = vp.id
FROM customers c
INNER JOIN vehicles v ON v.customer_id = c.id
INNER JOIN vehicle_purchases vp ON vp.vehicle_id = v.id
WHERE wl.customer_id = c.id;

-- 5.3 Add new foreign key to claims (keep old for backward compatibility)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS vehicle_purchase_id UUID REFERENCES vehicle_purchases(id) ON DELETE CASCADE;

-- 5.4 Update claims to link to vehicle_purchases
UPDATE claims cl
SET vehicle_purchase_id = vp.id
FROM customers c
INNER JOIN vehicles v ON v.customer_id = c.id
INNER JOIN vehicle_purchases vp ON vp.vehicle_id = v.id
WHERE cl.customer_id = c.id;

-- ========================
-- STEP 6: ENABLE RLS
-- ========================
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_purchases ENABLE ROW LEVEL SECURITY;

-- ========================
-- STEP 7: CREATE RLS POLICIES
-- ========================

-- CUSTOMER PROFILES policies
CREATE POLICY "customer_profiles_select" ON customer_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "customer_profiles_insert" ON customer_profiles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "customer_profiles_update" ON customer_profiles
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "customer_profiles_delete" ON customer_profiles
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');

-- VEHICLES policies
CREATE POLICY "vehicles_select" ON vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vehicles_insert" ON vehicles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "vehicles_update" ON vehicles
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "vehicles_delete" ON vehicles
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');

-- VEHICLE PURCHASES policies
CREATE POLICY "vehicle_purchases_select" ON vehicle_purchases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vehicle_purchases_insert" ON vehicle_purchases
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "vehicle_purchases_update" ON vehicle_purchases
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "vehicle_purchases_delete" ON vehicle_purchases
  FOR DELETE TO authenticated USING (get_my_role() = 'super_admin');

-- ========================
-- STEP 8: CREATE HELPER VIEWS
-- ========================

-- View for easy querying: customer with all vehicles and purchases
CREATE OR REPLACE VIEW customer_full_details AS
SELECT 
  cp.id as customer_id,
  cp.nama as customer_nama,
  cp.nomor_telp,
  cp.catatan_umum,
  cp.is_agen,
  cp.detail_agen,
  
  v.id as vehicle_id,
  v.plat_nomor,
  v.jenis_mobil,
  v.merek_mobil,
  
  vp.id as purchase_id,
  vp.tipe_aki,
  vp.merek_aki,
  vp.harga_beli,
  vp.tanggal_pembelian,
  vp.durasi_garansi_bulan,
  vp.status_garansi,
  vp.tukar_tambah,
  vp.reminder_bulan,
  vp.catatan_transaksi,
  
  b.nama_cabang as lokasi_cabang_nama,
  
  -- Calculate age in months
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, vp.tanggal_pembelian)) * 12 + 
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, vp.tanggal_pembelian)) as usia_bulan,
  
  -- Calculate reminder status (simple)
  CASE 
    WHEN vp.tanggal_pembelian + (vp.reminder_bulan || ' months')::INTERVAL < CURRENT_DATE THEN 'overdue'
    WHEN vp.tanggal_pembelian + (vp.reminder_bulan || ' months')::INTERVAL <= CURRENT_DATE + INTERVAL '14 days' THEN 'upcoming'
    ELSE 'ok'
  END as reminder_status
  
FROM customer_profiles cp
LEFT JOIN vehicles v ON v.customer_id = cp.id
LEFT JOIN vehicle_purchases vp ON vp.vehicle_id = v.id
LEFT JOIN branches b ON b.id = vp.lokasi_cabang;

-- ========================
-- STEP 9: COMMENTS
-- ========================
COMMENT ON TABLE customer_profiles IS 'Customer basic profile information';
COMMENT ON TABLE vehicles IS 'Vehicles owned by customers (one-to-many)';
COMMENT ON TABLE vehicle_purchases IS 'Battery purchases for each vehicle (one-to-many)';
COMMENT ON VIEW customer_full_details IS 'Denormalized view for easy querying of customer hierarchy';

-- ========================
-- MIGRATION COMPLETE
-- ========================
-- 
-- NOTES:
-- - Old 'customers' table is KEPT for backward compatibility
-- - wa_logs and claims now have BOTH old and new foreign keys
-- - To complete migration, update application code to use new tables
-- - After validation, can drop old 'customers' table with separate migration
--
-- NEXT STEPS:
-- 1. Update application queries to use new tables
-- 2. Update UI components (CustomerForm, VehicleForm, PurchaseForm)
-- 3. Test CRUD operations
-- 4. Validate data integrity
-- 5. (Optional) Drop old customers table after full validation
-- ============================================================
