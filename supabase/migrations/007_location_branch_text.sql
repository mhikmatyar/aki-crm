-- Allow admins to enter a free-form branch/location name on battery purchases.
-- Use a temporary text column because the old column is still UUID at this point.

ALTER TABLE vehicle_purchases ADD COLUMN IF NOT EXISTS lokasi_cabang_text text;

UPDATE vehicle_purchases vp
SET lokasi_cabang_text = COALESCE(b.nama_cabang || ' - ' || b.kota, vp.lokasi_cabang::text)
FROM branches b
WHERE vp.lokasi_cabang = b.id;

UPDATE vehicle_purchases
SET lokasi_cabang_text = lokasi_cabang::text
WHERE lokasi_cabang_text IS NULL AND lokasi_cabang IS NOT NULL;

ALTER TABLE vehicle_purchases
  DROP CONSTRAINT IF EXISTS vehicle_purchases_lokasi_cabang_fkey;

ALTER TABLE vehicle_purchases DROP COLUMN lokasi_cabang;
ALTER TABLE vehicle_purchases RENAME COLUMN lokasi_cabang_text TO lokasi_cabang;
