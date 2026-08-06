-- ============================================================
-- Migration 004 - Customer short codes
-- Enables shorter URLs such as /customers/C002.
-- ============================================================

ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS kode_customer TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profiles_kode_customer
ON customer_profiles(kode_customer)
WHERE kode_customer IS NOT NULL;

UPDATE customer_profiles
SET kode_customer = 'C' || LPAD(sequence_number::TEXT, 3, '0')
FROM (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at, nama, id) AS sequence_number
  FROM customer_profiles
  WHERE kode_customer IS NULL
) numbered_customers
WHERE customer_profiles.id = numbered_customers.id;
