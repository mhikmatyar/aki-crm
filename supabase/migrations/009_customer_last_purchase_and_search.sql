-- ============================================================
-- Migration 009 — last_purchase_at + server-side customer search
--
-- 1. Kolom customer_profiles.last_purchase_at (tanggal pembelian aki
--    terakhir dari semua kendaraan customer), dijaga otomatis oleh trigger.
-- 2. Fungsi search_customer_page() untuk halaman Database Customer:
--    search + filter usia + sort + pagination dalam satu query, tanpa
--    batas 1000 baris dan tanpa daftar ID raksasa di URL.
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- 1. Kolom + index
ALTER TABLE customer_profiles
  ADD COLUMN IF NOT EXISTS last_purchase_at DATE;

CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_purchase_at
  ON customer_profiles(last_purchase_at);

-- 2. Helper: hitung ulang last_purchase_at untuk satu customer
CREATE OR REPLACE FUNCTION refresh_customer_last_purchase(p_customer_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE customer_profiles cp
  SET last_purchase_at = (
    SELECT MAX(vp.tanggal_pembelian)
    FROM vehicles v
    JOIN vehicle_purchases vp ON vp.vehicle_id = v.id
    WHERE v.customer_id = p_customer_id
  )
  WHERE cp.id = p_customer_id;
$$;

-- Hanya dipanggil dari trigger, tidak perlu bisa dipanggil lewat API
REVOKE EXECUTE ON FUNCTION refresh_customer_last_purchase(UUID) FROM PUBLIC, anon, authenticated;

-- 3. Trigger di vehicle_purchases (insert / update / delete)
CREATE OR REPLACE FUNCTION trg_vehicle_purchases_last_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer UUID;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT customer_id INTO v_customer FROM vehicles WHERE id = OLD.vehicle_id;
    IF v_customer IS NOT NULL THEN
      PERFORM refresh_customer_last_purchase(v_customer);
    END IF;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT customer_id INTO v_customer FROM vehicles WHERE id = NEW.vehicle_id;
    IF v_customer IS NOT NULL THEN
      PERFORM refresh_customer_last_purchase(v_customer);
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS vehicle_purchases_last_purchase ON vehicle_purchases;
CREATE TRIGGER vehicle_purchases_last_purchase
  AFTER INSERT OR DELETE OR UPDATE OF tanggal_pembelian, vehicle_id ON vehicle_purchases
  FOR EACH ROW EXECUTE FUNCTION trg_vehicle_purchases_last_purchase();

-- 4. Trigger di vehicles (kendaraan dipindah ke customer lain / dihapus)
CREATE OR REPLACE FUNCTION trg_vehicles_last_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.customer_id IS NOT NULL THEN
    PERFORM refresh_customer_last_purchase(OLD.customer_id);
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.customer_id IS NOT NULL THEN
    PERFORM refresh_customer_last_purchase(NEW.customer_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS vehicles_last_purchase ON vehicles;
CREATE TRIGGER vehicles_last_purchase
  AFTER DELETE OR UPDATE OF customer_id ON vehicles
  FOR EACH ROW EXECUTE FUNCTION trg_vehicles_last_purchase();

-- 5. Backfill data lama
UPDATE customer_profiles cp
SET last_purchase_at = sub.last_date
FROM (
  SELECT v.customer_id, MAX(vp.tanggal_pembelian) AS last_date
  FROM vehicles v
  JOIN vehicle_purchases vp ON vp.vehicle_id = v.id
  GROUP BY v.customer_id
) sub
WHERE cp.id = sub.customer_id
  AND cp.last_purchase_at IS DISTINCT FROM sub.last_date;

-- 6. Fungsi pencarian berhalaman
--    SECURITY INVOKER: RLS user yang login tetap berlaku.
--    Mengembalikan {"total": <jumlah>, "ids": [<id urut sesuai sort>]}
CREATE OR REPLACE FUNCTION search_customer_page(
  p_search TEXT DEFAULT NULL,
  p_age TEXT DEFAULT 'all',
  p_sort TEXT DEFAULT 'newest',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      CASE
        WHEN NULLIF(btrim(p_search), '') IS NULL THEN NULL
        -- escape wildcard LIKE supaya %, _ dan \ dicari apa adanya
        ELSE '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%'
      END AS pat
  ),
  filtered AS (
    SELECT
      cp.id,
      cp.nama,
      COALESCE(cp.last_purchase_at::timestamptz, cp.created_at) AS sort_date
    FROM customer_profiles cp, params p
    WHERE
      (
        p.pat IS NULL
        OR cp.nama ILIKE p.pat
        OR cp.nomor_telp ILIKE p.pat
        OR cp.kode_customer ILIKE p.pat
        OR EXISTS (
          SELECT 1 FROM vehicles v
          WHERE v.customer_id = cp.id
            AND (v.plat_nomor ILIKE p.pat OR v.jenis_mobil ILIKE p.pat OR v.merek_mobil ILIKE p.pat)
        )
        OR EXISTS (
          SELECT 1 FROM vehicles v
          JOIN vehicle_purchases vp ON vp.vehicle_id = v.id
          WHERE v.customer_id = cp.id
            AND (vp.merek_aki ILIKE p.pat OR vp.tipe_aki ILIKE p.pat)
        )
      )
      AND (
        COALESCE(p_age, 'all') = 'all'
        OR (p_age = '<3'    AND cp.last_purchase_at >= CURRENT_DATE - INTERVAL '3 months')
        OR (p_age = '3-6'   AND cp.last_purchase_at <  CURRENT_DATE - INTERVAL '3 months'
                            AND cp.last_purchase_at >= CURRENT_DATE - INTERVAL '6 months')
        OR (p_age = '6-12'  AND cp.last_purchase_at <  CURRENT_DATE - INTERVAL '6 months'
                            AND cp.last_purchase_at >= CURRENT_DATE - INTERVAL '12 months')
        OR (p_age = '12-18' AND cp.last_purchase_at <  CURRENT_DATE - INTERVAL '12 months'
                            AND cp.last_purchase_at >= CURRENT_DATE - INTERVAL '18 months')
        OR (p_age = '>18'   AND cp.last_purchase_at <  CURRENT_DATE - INTERVAL '18 months')
      )
  ),
  page AS (
    SELECT
      f.id,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE WHEN p_sort = 'name' THEN lower(f.nama) END ASC,
          CASE WHEN p_sort = 'oldest' THEN f.sort_date END ASC,
          CASE WHEN p_sort NOT IN ('name', 'oldest') OR p_sort IS NULL THEN f.sort_date END DESC,
          f.id
      ) AS rn
    FROM filtered f
  )
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM filtered),
    'ids', COALESCE(
      (SELECT jsonb_agg(pg.id ORDER BY pg.rn)
       FROM page pg
       WHERE pg.rn > GREATEST(p_offset, 0)
         AND pg.rn <= GREATEST(p_offset, 0) + LEAST(GREATEST(p_limit, 1), 100)),
      '[]'::jsonb
    )
  );
$$;

GRANT EXECUTE ON FUNCTION search_customer_page(TEXT, TEXT, TEXT, INT, INT) TO authenticated;
