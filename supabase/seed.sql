-- ============================================================
-- AKI CRM — SEED DATA (Preview / Demo)
-- Jalankan SETELAH 001_initial.sql
-- ============================================================

-- ========================
-- BRANCHES (update/extend)
-- ========================
-- Hapus seed lama dari migration jika ada, lalu insert ulang dengan ID tetap
DELETE FROM branches;

INSERT INTO branches (id, nama_cabang, kota, aktif) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Cabang Pusat',   'Jakarta', true),
  ('11111111-0000-0000-0000-000000000002', 'Cabang Bekasi',  'Bekasi',  true),
  ('11111111-0000-0000-0000-000000000003', 'Cabang Depok',   'Depok',   true),
  ('11111111-0000-0000-0000-000000000004', 'Cabang Bogor',   'Bogor',   true);

-- ========================
-- CUSTOMERS
-- (tanggal bervariasi: ada yang overdue, hampir due, baru beli)
-- ========================
INSERT INTO customers (id, nama, nomor_telp, jenis_mobil, harga_beli, item_dibeli, tanggal_pembelian, lokasi_cabang, reminder_bulan, pernah_claim) VALUES

-- === CABANG PUSAT ===
('aaaaaaaa-0000-0000-0000-000000000001', 'Budi Santoso',       '081234567001', 'Toyota Avanza 2019',        850000,  'GS Astra NS60LS',     '2025-10-15', '11111111-0000-0000-0000-000000000001', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000002', 'Dewi Rahayu',        '081234567002', 'Honda Jazz 2020',           920000,  'Yuasa YTX5L-BS',      '2025-11-20', '11111111-0000-0000-0000-000000000001', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000003', 'Agus Wijaya',        '081234567003', 'Daihatsu Xenia 2018',       780000,  'Incoe Gold NS40Z',    '2025-06-01', '11111111-0000-0000-0000-000000000001', 6,  true),
('aaaaaaaa-0000-0000-0000-000000000004', 'Siti Nurhaliza',     '081234567004', 'Mitsubishi Pajero 2021',   1150000,  'GS Astra MF75D23L',   '2024-12-10', '11111111-0000-0000-0000-000000000001', 12, false),
('aaaaaaaa-0000-0000-0000-000000000005', 'Rudi Hermawan',      '081234567005', 'Toyota Innova 2017',        900000,  'Yuasa NS60LS',        '2024-08-25', '11111111-0000-0000-0000-000000000001', 6,  true),
('aaaaaaaa-0000-0000-0000-000000000006', 'Lina Susanti',       '081234567006', 'Honda Brio 2022',           720000,  'GS Astra NS40ZL',     '2026-04-01', '11111111-0000-0000-0000-000000000001', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000007', 'Hendra Gunawan',     '081234567007', 'Suzuki Ertiga 2020',        830000,  'Incoe Focus NS60LS',  '2025-09-14', '11111111-0000-0000-0000-000000000001', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000008', 'Yanti Puspitasari',  '081234567008', 'Nissan Grand Livina 2016',  760000,  'Yuasa NX100-S6',      '2024-11-30', '11111111-0000-0000-0000-000000000001', 6,  false),

-- === CABANG BEKASI ===
('aaaaaaaa-0000-0000-0000-000000000009', 'Fajar Nugroho',      '081234567009', 'Toyota Rush 2021',          890000,  'GS Astra NS60LS',     '2025-08-20', '11111111-0000-0000-0000-000000000002', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000010', 'Mega Wati',          '081234567010', 'Honda HRV 2022',            980000,  'GS Astra MF75D23L',   '2025-12-05', '11111111-0000-0000-0000-000000000002', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000011', 'Doni Setiawan',      '081234567011', 'Daihatsu Terios 2019',      810000,  'Incoe Gold NS60LS',   '2025-05-10', '11111111-0000-0000-0000-000000000002', 6,  true),
('aaaaaaaa-0000-0000-0000-000000000012', 'Rina Marlina',       '081234567012', 'Mitsubishi Xpander 2020',   870000,  'Yuasa NS60LS',        '2025-01-18', '11111111-0000-0000-0000-000000000002', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000013', 'Bambang Susilo',     '081234567013', 'Toyota Fortuner 2018',     1200000,  'GS Astra MF105D31L',  '2024-07-22', '11111111-0000-0000-0000-000000000002', 12, false),
('aaaaaaaa-0000-0000-0000-000000000014', 'Kartini Dewi',       '081234567014', 'Honda Freed 2017',          750000,  'Incoe Focus NS60Z',   '2026-03-10', '11111111-0000-0000-0000-000000000002', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000015', 'Wahyu Pratama',      '081234567015', 'Suzuki XL7 2021',           860000,  'Yuasa YTX5L-BS',      '2025-10-01', '11111111-0000-0000-0000-000000000002', 6,  false),

-- === CABANG DEPOK ===
('aaaaaaaa-0000-0000-0000-000000000016', 'Eko Prasetyo',       '081234567016', 'Toyota Calya 2020',         740000,  'GS Astra NS40ZL',     '2025-07-15', '11111111-0000-0000-0000-000000000003', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000017', 'Nisa Fitrianti',     '081234567017', 'Honda Mobilio 2019',        800000,  'Yuasa NS60LS',        '2025-04-28', '11111111-0000-0000-0000-000000000003', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000018', 'Rizal Maulana',      '081234567018', 'Mitsubishi Colt L300 2016', 680000,  'Incoe Gold NX100-S6', '2024-10-12', '11111111-0000-0000-0000-000000000003', 6,  true),
('aaaaaaaa-0000-0000-0000-000000000019', 'Indah Permatasari',  '081234567019', 'Daihatsu Sigra 2021',       710000,  'GS Astra NS40Z',      '2026-02-14', '11111111-0000-0000-0000-000000000003', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000020', 'Tono Hartono',       '081234567020', 'Toyota Kijang Innova 2015', 950000,  'GS Astra NS60LS',     '2024-06-05', '11111111-0000-0000-0000-000000000003', 6,  false),

-- === CABANG BOGOR ===
('aaaaaaaa-0000-0000-0000-000000000021', 'Surya Abadi',        '081234567021', 'Honda BR-V 2020',           910000,  'Yuasa MF75D23L',      '2025-09-09', '11111111-0000-0000-0000-000000000004', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000022', 'Mira Anggraini',     '081234567022', 'Toyota Yaris 2021',         820000,  'GS Astra NS60Z',      '2026-01-20', '11111111-0000-0000-0000-000000000004', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000023', 'Faisal Rahman',      '081234567023', 'Wuling Almaz 2022',         870000,  'Incoe Focus NS70',    '2025-11-11', '11111111-0000-0000-0000-000000000004', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000024', 'Ratna Sari',         '081234567024', 'Toyota Avanza 2020',        850000,  'GS Astra NS60LS',     '2025-03-07', '11111111-0000-0000-0000-000000000004', 6,  false),
('aaaaaaaa-0000-0000-0000-000000000025', 'Irwan Hidayat',      '081234567025', 'Daihatsu Ayla 2021',        640000,  'GS Astra NS40ZL',     '2024-09-18', '11111111-0000-0000-0000-000000000004', 6,  false);


-- ========================
-- CLAIMS
-- ========================
INSERT INTO claims (id, customer_id, posisi_aki, kondisi_klaim, catatan, tanggal_klaim, status, done_at) VALUES

-- Agus Wijaya (Pusat) — sudah done
('bbbbbbbb-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000003',
 'Di cabang Pusat',
 'C',
 'Aki sudah dicharging, kondisi kembali normal. Customer puas.',
 '2025-08-10',
 'done',
 '2025-08-12 14:30:00+07'),

-- Rudi Hermawan (Pusat) — masih aktif charging
('bbbbbbbb-0000-0000-0000-000000000002',
 'aaaaaaaa-0000-0000-0000-000000000005',
 'Di cabang Pusat',
 'A',
 'Aki lemah, tegangan 9.8V. Sedang dalam proses charging.',
 '2026-05-20',
 'aktif',
 NULL),

-- Doni Setiawan (Bekasi) — dikirim ke distributor
('bbbbbbbb-0000-0000-0000-000000000003',
 'aaaaaaaa-0000-0000-0000-000000000011',
 'Di cabang Bekasi',
 'B',
 'Aki tidak bisa menahan charge, dikirim ke distributor GS untuk klaim garansi. No. resi: GS-2026-04871.',
 '2026-05-15',
 'aktif',
 NULL),

-- Rizal Maulana (Depok) — rusak total
('bbbbbbbb-0000-0000-0000-000000000004',
 'aaaaaaaa-0000-0000-0000-000000000018',
 'Di cabang Depok',
 'D',
 'Aki sudah rusak total, tidak bisa diperbaiki. Sel kering. Direkomendasikan beli baru.',
 '2026-01-05',
 'done',
 '2026-01-05 16:00:00+07'),

-- Budi Santoso (Pusat) — sudah done charged
('bbbbbbbb-0000-0000-0000-000000000005',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'Di cabang Pusat',
 'C',
 'Proses charging 8 jam selesai, aki kembali normal. CCA 420A.',
 '2025-12-20',
 'done',
 '2025-12-21 10:00:00+07');


-- ========================
-- WA LOGS
-- ========================
INSERT INTO wa_logs (customer_id, nama_customer, nomor_telp, jenis_mobil, tanggal_pembelian, durasi_saat_kirim, pesan_dikirim, cabang, waktu_kirim) VALUES

-- Reminder untuk Agus Wijaya
('aaaaaaaa-0000-0000-0000-000000000003',
 'Agus Wijaya', '081234567003', 'Daihatsu Xenia 2018', '2025-06-01',
 11,
 'Halo Agus Wijaya, aki Daihatsu Xenia 2018 Anda sudah 11 bulan sejak pembelian tanggal 01 Jun 2025. Mau kami bantu pengecekan ke lokasi?',
 '11111111-0000-0000-0000-000000000001',
 '2026-05-01 09:15:00+07'),

-- Reminder untuk Rudi Hermawan (2x)
('aaaaaaaa-0000-0000-0000-000000000005',
 'Rudi Hermawan', '081234567005', 'Toyota Innova 2017', '2024-08-25',
 9,
 'Halo Pak Rudi, aki Toyota Innova Anda sudah 9 bulan. Saatnya pengecekan rutin, kami siap bantu!',
 '11111111-0000-0000-0000-000000000001',
 '2025-05-27 10:30:00+07'),

('aaaaaaaa-0000-0000-0000-000000000005',
 'Rudi Hermawan', '081234567005', 'Toyota Innova 2017', '2024-08-25',
 21,
 'Halo Pak Rudi, aki Toyota Innova Anda sudah 21 bulan sejak pembelian. Kami sangat menyarankan pengecekan segera. Hubungi kami ya!',
 '11111111-0000-0000-0000-000000000001',
 '2026-05-25 11:00:00+07'),

-- Reminder untuk Yanti
('aaaaaaaa-0000-0000-0000-000000000008',
 'Yanti Puspitasari', '081234567008', 'Nissan Grand Livina 2016', '2024-11-30',
 6,
 'Halo Yanti, aki Nissan Grand Livina Anda sudah 6 bulan. Waktunya pengecekan! Datang ke toko atau minta kunjungan ke lokasi?',
 '11111111-0000-0000-0000-000000000001',
 '2025-05-31 13:45:00+07'),

-- Reminder untuk Bambang Susilo (Bekasi)
('aaaaaaaa-0000-0000-0000-000000000013',
 'Bambang Susilo', '081234567013', 'Toyota Fortuner 2018', '2024-07-22',
 12,
 'Halo Pak Bambang, aki Toyota Fortuner Anda sudah 12 bulan. Rekomendasi pengecekan rutin setahun sekali. Bisa kami bantu jadwalkan?',
 '11111111-0000-0000-0000-000000000002',
 '2025-07-22 08:00:00+07'),

-- Reminder untuk Rina Marlina (Bekasi)
('aaaaaaaa-0000-0000-0000-000000000012',
 'Rina Marlina', '081234567012', 'Mitsubishi Xpander 2020', '2025-01-18',
 6,
 'Halo Rina, aki Xpander Anda sudah 6 bulan nih. Mau kami bantu cek kondisi aki ke lokasi Anda?',
 '11111111-0000-0000-0000-000000000002',
 '2025-07-20 14:20:00+07'),

-- Reminder untuk Tono Hartono (Depok)
('aaaaaaaa-0000-0000-0000-000000000020',
 'Tono Hartono', '081234567020', 'Toyota Kijang Innova 2015', '2024-06-05',
 12,
 'Halo Pak Tono, aki Kijang Innova Anda sudah 12 bulan lebih. Jangan sampai mogok di jalan, yuk cek sekarang!',
 '11111111-0000-0000-0000-000000000003',
 '2025-06-10 09:30:00+07'),

-- Reminder untuk Irwan Hidayat (Bogor)
('aaaaaaaa-0000-0000-0000-000000000025',
 'Irwan Hidayat', '081234567025', 'Daihatsu Ayla 2021', '2024-09-18',
 8,
 'Halo Irwan, aki Daihatsu Ayla Anda sudah 8 bulan. Mau kami bantu cek kondisi aki?',
 '11111111-0000-0000-0000-000000000004',
 '2025-05-20 15:10:00+07');
