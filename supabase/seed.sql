-- ============================================================
-- AKI CRM - SEED DATA FOR NEW HIERARCHY MODEL
-- Run after:
-- 1. supabase/migrations/001_initial.sql
-- 2. supabase/migrations/002_simplify_single_branch.sql
-- 3. supabase/migrations/003_hierarchy_refactor_SAFE.sql
--
-- Model:
-- customer_profiles -> vehicles -> vehicle_purchases
-- ============================================================

ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS kode_customer TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profiles_kode_customer
ON customer_profiles(kode_customer)
WHERE kode_customer IS NOT NULL;

-- ============================================================
-- BRANCHES
-- ============================================================
INSERT INTO branches (id, nama_cabang, kota, aktif) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Cabang Pusat',  'Jakarta', true),
  ('11111111-0000-0000-0000-000000000002', 'Cabang Bekasi', 'Bekasi',  true),
  ('11111111-0000-0000-0000-000000000003', 'Cabang Depok',  'Depok',   true),
  ('11111111-0000-0000-0000-000000000004', 'Cabang Bogor',  'Bogor',   true)
ON CONFLICT (id) DO UPDATE SET
  nama_cabang = EXCLUDED.nama_cabang,
  kota = EXCLUDED.kota,
  aktif = EXCLUDED.aktif;

-- ============================================================
-- CLEAN PREVIOUS DEMO HIERARCHY DATA
-- ============================================================
DELETE FROM customer_profiles
WHERE id IN (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  '20000000-0000-0000-0000-000000000008'
);

-- ============================================================
-- CUSTOMER PROFILES
-- ============================================================
INSERT INTO customer_profiles (id, kode_customer, nama, nomor_telp, catatan_umum, is_agen, detail_agen) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'C001',
    'Budi Santoso',
    '081234567001',
    'Customer retail. Sering servis kendaraan keluarga.',
    false,
    null
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'C002',
    'Dewi Rahayu',
    '081234567002',
    'Punya dua kendaraan operasional toko.',
    false,
    null
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'C003',
    'Agus Wijaya',
    '081234567003',
    'Agen bengkel kecil, sering ambil aki untuk customer sekitar.',
    true,
    'Bengkel Wijaya Motor - area Cibubur'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'C004',
    'Siti Nurhaliza',
    '081234567004',
    'Customer keluarga. Prefer follow-up via WhatsApp pagi hari.',
    false,
    null
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'C005',
    'Rudi Hermawan',
    '081234567005',
    'Pernah klaim aki lama. Butuh reminder rutin.',
    false,
    null
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'C006',
    'Lina Susanti',
    '081234567006',
    'Customer baru dari cabang Depok.',
    false,
    null
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'C007',
    'Hendra Gunawan',
    '081234567007',
    'Armada kecil untuk usaha katering.',
    true,
    'Katering Hendra - 3 kendaraan aktif'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'C008',
    'Yanti Puspitasari',
    '081234567008',
    'Minta follow-up sebelum masa garansi habis.',
    false,
    null
  );

-- ============================================================
-- VEHICLES
-- ============================================================
INSERT INTO vehicles (id, customer_id, plat_nomor, jenis_mobil, merek_mobil) VALUES
  -- Budi Santoso: 2 cars
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'B 1234 BDS', 'Avanza 1.3 G 2019', 'Toyota'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'B 7788 BDS', 'Brio Satya 2022', 'Honda'),

  -- Dewi Rahayu: 2 cars
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'B 4567 DWI', 'Jazz RS 2020', 'Honda'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'B 6102 DWI', 'Xenia R 2018', 'Daihatsu'),

  -- Agus Wijaya: 1 car
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'B 9012 AGS', 'Xpander Ultimate 2021', 'Mitsubishi'),

  -- Siti Nurhaliza: 1 car
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'F 2024 STI', 'Pajero Sport Dakar 2021', 'Mitsubishi'),

  -- Rudi Hermawan: 2 cars
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 'B 3310 RDH', 'Innova Reborn 2017', 'Toyota'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', 'B 1188 RDH', 'Ertiga GX 2020', 'Suzuki'),

  -- Lina Susanti: 1 car
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000006', 'B 2206 LIN', 'Calya G 2020', 'Toyota'),

  -- Hendra Gunawan: 2 cars
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000007', 'B 7711 HND', 'Grand Livina 2016', 'Nissan'),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000007', 'B 8822 HND', 'L300 Pickup 2018', 'Mitsubishi'),

  -- Yanti Puspitasari: 1 car
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000008', 'F 1908 YNT', 'Yaris TRD 2021', 'Toyota');

-- ============================================================
-- VEHICLE PURCHASES
-- Dates are intentionally varied for dashboard age filters:
-- <3, 3-6, 6-12, 12-18, and >18 months.
-- Warranty status is calculated by database trigger.
-- ============================================================
INSERT INTO vehicle_purchases (
  id,
  vehicle_id,
  tipe_aki,
  merek_aki,
  harga_beli,
  tanggal_pembelian,
  lokasi_cabang,
  durasi_garansi_bulan,
  tukar_tambah,
  catatan_transaksi,
  reminder_bulan
) VALUES
  -- Budi / Avanza: more than 1 battery purchase
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'NS60LS', 'GS Astra', 850000, '2024-08-15', '11111111-0000-0000-0000-000000000001', 12, true,  'Aki lama ditukar tambah. Terminal dibersihkan.', 12),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'NS60LS', 'Yuasa',    910000, '2026-05-10', '11111111-0000-0000-0000-000000000001', 12, false, 'Ganti baru setelah aki sebelumnya mulai drop.', 12),

  -- Budi / Brio
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'NS40ZL', 'GS Astra', 720000, '2026-03-20', '11111111-0000-0000-0000-000000000001', 12, false, 'Mobil jarang dipakai, disarankan cek tiap 3 bulan.', 6),

  -- Dewi / Jazz: more than 1 battery purchase
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', 'N-55',   'Amaron',   980000, '2025-01-12', '11111111-0000-0000-0000-000000000002', 18, true,  'Upgrade aki maintenance free.', 12),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'N-55',   'GS Astra', 1020000, '2026-06-05', '11111111-0000-0000-0000-000000000002', 18, false, 'Pembelian terbaru untuk operasional toko.', 12),

  -- Dewi / Xenia
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', 'NS60LS', 'Incoe Gold', 790000, '2025-09-02', '11111111-0000-0000-0000-000000000002', 12, false, 'Reminder 12 bulan.', 12),

  -- Agus / Xpander: agent customer
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', 'DIN55',  'Varta',    1180000, '2024-11-18', '11111111-0000-0000-0000-000000000001', 18, false, 'Pembelian untuk mobil pribadi agen.', 12),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 'DIN55',  'Varta',    1210000, '2026-02-28', '11111111-0000-0000-0000-000000000001', 18, true,  'Aki lama diterima sebagai tukar tambah.', 12),

  -- Siti / Pajero
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', 'MF75D23L', 'GS Astra', 1450000, '2025-07-24', '11111111-0000-0000-0000-000000000004', 18, false, 'Unit besar, cek alternator saat pemasangan.', 12),

  -- Rudi / Innova: more than 1 battery purchase
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000007', 'NS70',   'Incoe',    1030000, '2024-05-22', '11111111-0000-0000-0000-000000000001', 12, true,  'Pernah klaim pada aki lama.', 12),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000007', 'NS70',   'GS Astra', 1090000, '2025-12-08', '11111111-0000-0000-0000-000000000001', 12, false, 'Follow-up sebelum 12 bulan.', 12),

  -- Rudi / Ertiga
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000008', 'NS60LS', 'Yuasa',    880000, '2026-01-14', '11111111-0000-0000-0000-000000000002', 12, false, 'Kendaraan istri.', 12),

  -- Lina / Calya
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000009', 'NS40ZL', 'Incoe',    690000, '2026-07-01', '11111111-0000-0000-0000-000000000003', 12, false, 'Customer baru, pembelian bulan ini.', 6),

  -- Hendra / Livina
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000010', 'NX100-S6', 'Yuasa',   960000, '2025-04-30', '11111111-0000-0000-0000-000000000003', 12, false, 'Mobil pengiriman katering.', 12),

  -- Hendra / L300: more than 1 battery purchase
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000011', 'N100',   'GS Astra', 1320000, '2024-03-10', '11111111-0000-0000-0000-000000000003', 12, true,  'Aki pickup lama drop berat.', 12),
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000011', 'N100',   'Incoe',    1280000, '2025-10-19', '11111111-0000-0000-0000-000000000003', 12, false, 'Penggantian rutin untuk armada.', 12),

  -- Yanti / Yaris: more than 1 battery purchase
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000012', 'NS60Z',  'GS Astra', 870000, '2024-12-02', '11111111-0000-0000-0000-000000000004', 12, false, 'Minta diingatkan sebelum garansi habis.', 12),
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000012', 'NS60Z',  'Amaron',   940000, '2026-04-17', '11111111-0000-0000-0000-000000000004', 18, true,  'Upgrade ke aki dengan garansi lebih panjang.', 12);

-- ============================================================
-- QUICK CHECK
-- ============================================================
DO $$
DECLARE
  customer_count INT;
  vehicle_count INT;
  purchase_count INT;
BEGIN
  SELECT COUNT(*) INTO customer_count
  FROM customer_profiles
  WHERE id::TEXT LIKE '20000000-%';

  SELECT COUNT(*) INTO vehicle_count
  FROM vehicles
  WHERE id::TEXT LIKE '30000000-%';

  SELECT COUNT(*) INTO purchase_count
  FROM vehicle_purchases
  WHERE id::TEXT LIKE '40000000-%';

  RAISE NOTICE 'Seed complete: % customers, % vehicles, % purchases',
    customer_count,
    vehicle_count,
    purchase_count;
END $$;
