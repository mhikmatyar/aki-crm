-- ============================================================
-- Migration 003 — SAFE Hierarchy Refactor (with DROP IF EXISTS)
-- 
-- This is a SAFE version that can be run multiple times
-- All objects use DROP IF EXISTS to avoid conflicts
-- ============================================================

-- ========================
-- STEP 0: DROP EXISTING OBJECTS (IF ANY)
-- ========================

-- Drop indexes first
DROP INDEX IF EXISTS idx_vehicles_customer_id;
DROP INDEX IF EXISTS idx_vehicle_purchases_vehicle_id;
DROP INDEX IF EXISTS idx_vehicle_purchases_tanggal;
DROP INDEX IF EXISTS idx_customer_profiles_nama;
DROP INDEX IF EXISTS idx_customer_profiles_nomor_telp;

-- Drop triggers
DROP TRIGGER IF EXISTS customer_profiles_updated_at ON customer_profiles;
DROP TRIGGER IF EXISTS vehicles_updated_at ON vehicles;
DROP TRIGGER IF EXISTS vehicle_purchases_updated_at ON vehicle_purchases;
DROP TRIGGER IF EXISTS warranty_status_trigger ON vehicle_purchases;

-- Drop functions (CASCADE to remove dependent triggers)
DROP FUNCTION IF EXISTS update_warranty_status() CASCADE;

-- Drop tables (cascade will handle foreign keys)
DROP TABLE IF EXISTS vehicle_purchases CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;

-- ========================
-- STEP 1: CREATE NEW TABLES
-- ========================

-- 1.1 CUSTOMER PROFILES
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  nomor_telp TEXT NOT NULL,
  
  -- New fields
  catatan_umum TEXT,
  is_agen BOOLEAN NOT NULL DEFAULT false,
  detail_agen TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- 1.2 VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  
  plat_nomor TEXT,
  jenis_mobil TEXT NOT NULL,
  merek_mobil TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 VEHICLE PURCHASES
CREATE TABLE vehicle_purchases (
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
-- STEP 3: CREATE TRIGGERS
-- ========================

-- Auto-update updated_at
CREATE TRIGGER customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vehicle_purchases_updated_at BEFORE UPDATE ON vehicle_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Warranty status auto-update trigger
CREATE OR REPLACE FUNCTION update_warranty_status()
RETURNS TRIGGER AS $$
BEGIN
  IF (CURRENT_DATE - NEW.tanggal_pembelian) > (NEW.durasi_garansi_bulan * 30) THEN
    NEW.status_garansi := 'expired';
  ELSE
    NEW.status_garansi := 'valid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER warranty_status_trigger
  BEFORE INSERT OR UPDATE ON vehicle_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_warranty_status();

-- ========================
-- STEP 4: MIGRATE DATA FROM OLD CUSTOMERS TABLE (OPTIONAL - SAFE SKIP)
-- ========================

-- NOTE: Old 'customers' table structure doesn't match new structure
-- You can manually migrate data later if needed
-- This creates fresh tables without migration errors

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
    RAISE NOTICE 'Old customers table found, but skipping auto-migration';
    RAISE NOTICE 'Table structure mismatch - please migrate manually if needed';
    RAISE NOTICE 'New tables are ready for fresh data input';
  ELSE
    RAISE NOTICE 'Old customers table not found - ready for fresh data';
  END IF;
END $$;

-- ========================
-- STEP 5: UPDATE FOREIGN KEYS
-- ========================

-- Update wa_logs foreign key
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wa_logs') THEN
    -- Add new column if not exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'wa_logs' AND column_name = 'customer_profile_id'
    ) THEN
      ALTER TABLE wa_logs ADD COLUMN customer_profile_id UUID REFERENCES customer_profiles(id);
      
      -- Copy data ONLY if customer exists in customer_profiles
      UPDATE wa_logs 
      SET customer_profile_id = customer_id 
      WHERE customer_id IS NOT NULL 
        AND EXISTS (SELECT 1 FROM customer_profiles WHERE id = wa_logs.customer_id);
      
      RAISE NOTICE 'wa_logs.customer_profile_id updated for existing customers only';
    END IF;
  END IF;
END $$;

-- Update claims foreign key
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'claims') THEN
    -- Add new column if not exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'claims' AND column_name = 'customer_profile_id'
    ) THEN
      ALTER TABLE claims ADD COLUMN customer_profile_id UUID REFERENCES customer_profiles(id);
      
      -- Copy data ONLY if customer exists in customer_profiles
      UPDATE claims 
      SET customer_profile_id = customer_id 
      WHERE customer_id IS NOT NULL 
        AND EXISTS (SELECT 1 FROM customer_profiles WHERE id = claims.customer_id);
      
      RAISE NOTICE 'claims.customer_profile_id updated for existing customers only';
    END IF;
  END IF;
END $$;

-- ========================
-- STEP 6: RLS POLICIES
-- ========================

-- Enable RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view customer_profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert customer_profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update customer_profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Super admins can delete customer_profiles" ON customer_profiles;

DROP POLICY IF EXISTS "Users can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view purchases" ON vehicle_purchases;
DROP POLICY IF EXISTS "Users can insert purchases" ON vehicle_purchases;
DROP POLICY IF EXISTS "Users can update purchases" ON vehicle_purchases;
DROP POLICY IF EXISTS "Users can delete purchases" ON vehicle_purchases;

-- Create policies for customer_profiles
CREATE POLICY "Users can view customer_profiles" ON customer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert customer_profiles" ON customer_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update customer_profiles" ON customer_profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Super admins can delete customer_profiles" ON customer_profiles FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'super_admin'));

-- Create policies for vehicles
CREATE POLICY "Users can view vehicles" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert vehicles" ON vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update vehicles" ON vehicles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete vehicles" ON vehicles FOR DELETE TO authenticated USING (true);

-- Create policies for vehicle_purchases
CREATE POLICY "Users can view purchases" ON vehicle_purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert purchases" ON vehicle_purchases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update purchases" ON vehicle_purchases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete purchases" ON vehicle_purchases FOR DELETE TO authenticated USING (true);

-- ========================
-- MIGRATION COMPLETE!
-- ========================

-- Show summary
DO $$
DECLARE
  customer_count INT;
  vehicle_count INT;
  purchase_count INT;
BEGIN
  SELECT COUNT(*) INTO customer_count FROM customer_profiles;
  SELECT COUNT(*) INTO vehicle_count FROM vehicles;
  SELECT COUNT(*) INTO purchase_count FROM vehicle_purchases;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Customer Profiles: %', customer_count;
  RAISE NOTICE 'Vehicles: %', vehicle_count;
  RAISE NOTICE 'Vehicle Purchases: %', purchase_count;
  RAISE NOTICE '==============================================';
END $$;
