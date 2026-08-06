# Panduan Alur Fitur AKI CRM

Last updated: 6 Agustus 2026

Dokumen ini menjelaskan alur penggunaan fitur utama AKI CRM setelah perubahan struktur data baru:

```txt
customer_profiles -> vehicles -> vehicle_purchases
```

Artinya:

- 1 customer bisa punya lebih dari 1 kendaraan.
- 1 kendaraan bisa punya lebih dari 1 riwayat pembelian aki.
- Reminder WhatsApp dan klaim sekarang mengacu ke pembelian aki tertentu, bukan hanya ke customer.

---

## 1. Login dan Role User

### Admin

Admin digunakan untuk operasional harian:

- Melihat data customer.
- Menambah customer.
- Menambah kendaraan.
- Menambah pembelian aki.
- Mengirim reminder WhatsApp.
- Membuat klaim.
- Menandai klaim selesai.

### Super Admin

Super Admin punya akses tambahan:

- Hapus data tertentu.
- Akses halaman manajemen user.
- Melihat fitur/admin tertentu yang dibatasi role.

---

## 2. Database Customer

Halaman:

```txt
/customers
```

Fungsi utama:

- Melihat daftar customer.
- Search customer berdasarkan nama, nomor telepon, plat, mobil, merek aki, atau tipe aki.
- Filter customer berdasarkan usia pembelian aki.
- Sort berdasarkan pembelian terlama, pembelian terbaru, atau nama A-Z.

### Filter usia pembelian

Filter yang tersedia:

- Semua
- `<3 bln`
- `3-6 bln`
- `6-12 bln`
- `12-18 bln`
- `>18 bln`

Filter ini dihitung dari tanggal pembelian aki.

### Kolom penting

Di tabel customer ada informasi:

- Customer
- Kontak
- Kendaraan
- Pembelian terbaru
- Usia pembelian
- Status garansi
- Aksi detail

Status garansi `VALID` / `EXPIRED` dihitung dari:

```txt
tanggal_pembelian + durasi_garansi_bulan
```

---

## 3. Tambah Customer Baru

Halaman:

```txt
/customers/new
```

Form customer baru dibuat supaya tidak membingungkan. Dalam satu proses, user mengisi:

### Data customer

- Nama customer
- Nomor telepon
- Catatan umum
- Status agen / bukan agen
- Detail agen jika perlu

### Data kendaraan pertama

- Jenis / merk mobil
- Plat nomor
- Merek mobil jika diperlukan

### Data pembelian aki pertama

- Merek aki
- Tipe aki
- Harga beli
- Tanggal pembelian
- Cabang pembelian
- Durasi garansi
- Reminder follow-up
- Tukar tambah
- Catatan transaksi

Setelah disimpan:

```txt
customer_profiles dibuat
vehicles dibuat
vehicle_purchases dibuat
```

Jadi customer baru langsung punya kendaraan dan pembelian pertama.

---

## 4. Detail Customer

Contoh URL:

```txt
/customers/C001
```

URL pendek seperti `C001` digunakan supaya tidak perlu membuka UUID panjang.

Di halaman detail customer, user bisa:

- Melihat informasi customer.
- Melihat ringkasan kendaraan dan aki.
- Menambah kendaraan.
- Edit kendaraan.
- Hapus kendaraan.
- Menambah pembelian aki untuk tiap kendaraan.
- Edit pembelian aki.
- Hapus pembelian aki.
- Membuat klaim dari pembelian aki tertentu.

### Alur tambah kendaraan

1. Buka detail customer.
2. Klik `+ Tambah Kendaraan`.
3. Isi data kendaraan.
4. Simpan.

### Alur tambah pembelian aki

1. Buka detail customer.
2. Pilih kendaraan.
3. Klik `+ Tambah Pembelian`.
4. Isi data aki dan transaksi.
5. Simpan.

Ini dipakai untuk pembelian kedua, ketiga, dan seterusnya pada kendaraan yang sama.

---

## 5. Dashboard Follow-Up

Halaman:

```txt
/dashboard
```

Dashboard adalah tempat kerja harian CS.

Fungsi dashboard:

- Menampilkan customer yang perlu di-follow up.
- Menentukan siapa yang perlu dikirim WA 1.
- Menentukan siapa yang perlu dikirim WA 2.
- Menandai customer yang sudah memberi respon.

Dashboard mengambil data dari:

```txt
vehicle_purchases
wa_logs
```

Jadi status follow-up dihitung dari riwayat pembelian aki dan log WhatsApp.

### Milestone reminder

Saat ini milestone reminder yang dipakai:

- 12 bulan
- 18 bulan
- 24 bulan

Tombol `Kirim WA 1` muncul mulai 14 hari sebelum milestone.

Contoh:

```txt
Tanggal beli: 20 Agustus 2025
Milestone 12 bulan: 20 Agustus 2026
WA 1 mulai muncul: 6 Agustus 2026
```

### Status di Dashboard

#### Belum remind

Jika belum ada log WhatsApp pada milestone itu:

```txt
Kirim WA 1
```

#### WA 1 sudah dikirim

Jika sudah ada 1 log WhatsApp:

```txt
Follow-Up 1 Sent
Kirim WA 2
Ada Respon
```

#### WA 2 sudah dikirim

Jika sudah ada minimal 2 log WhatsApp:

```txt
Follow-Up 2 Sent
WA 2 Lagi
Ada Respon
```

#### Customer sudah respon

Jika user klik `Ada Respon`, sistem membuat log khusus dengan awalan:

```txt
[ADA RESPON]
```

Setelah itu status berubah menjadi:

```txt
Selesai (Ada Respon)
```

---

## 6. Kirim WhatsApp Reminder

Tombol kirim WA tersedia dari Dashboard.

Alurnya:

1. Buka Dashboard.
2. Pilih customer yang perlu follow-up.
3. Klik `Kirim WA 1` atau `Kirim WA 2`.
4. Modal WhatsApp terbuka.
5. Pesan otomatis dibuat.
6. User bisa edit pesan.
7. Klik `Kirim via WhatsApp`.
8. Sistem mencatat log ke `wa_logs`.
9. WhatsApp Web / aplikasi WhatsApp terbuka.

Data log yang disimpan:

- Customer profile ID
- Vehicle purchase ID
- Nama customer
- Nomor telepon
- Jenis mobil
- Tanggal pembelian
- Milestone bulan
- Pesan yang dikirim
- User pengirim
- Waktu kirim

---

## 7. Log WhatsApp

Halaman:

```txt
/wa-logs
```

Log WhatsApp adalah arsip semua follow-up yang sudah dilakukan.

Perbedaan Dashboard dan Log WhatsApp:

| Halaman | Fungsi |
| --- | --- |
| Dashboard | Daftar kerja CS hari ini |
| Log WhatsApp | Arsip pesan yang sudah dikirim |
| Dashboard | Menentukan aksi berikutnya |
| Log WhatsApp | Melihat histori pengiriman |
| Dashboard | Fokus follow-up |
| Log WhatsApp | Fokus audit / bukti aktivitas |

Di Log WhatsApp, user bisa:

- Melihat semua pesan yang pernah dikirim.
- Filter berdasarkan 12, 18, atau 24 bulan.
- Search nama, nomor, mobil, atau isi pesan.
- Menandai `Ada Respon`.
- Super Admin bisa hapus log.

---

## 8. Database Klaim

Halaman:

```txt
/claims
```

Fitur klaim digunakan untuk mencatat klaim aki.

Klaim sekarang mengacu ke pembelian aki tertentu:

```txt
customer_profiles -> vehicles -> vehicle_purchases -> claims
```

Jadi klaim tidak hanya ditempel ke customer, tapi jelas aki mana yang diklaim.

### Alur buat klaim dari detail customer

1. Buka detail customer.
2. Pilih kendaraan.
3. Pilih riwayat pembelian aki.
4. Klik `Buat Klaim`.
5. Form klaim terbuka.
6. Data customer, kendaraan, dan aki otomatis terpilih.
7. Isi:
   - Posisi aki
   - Kondisi klaim
   - Tanggal klaim
   - Catatan
8. Klik `Simpan Klaim`.
9. User diarahkan ke detail klaim.

### Alur buat klaim dari Database Klaim

1. Buka `/claims`.
2. Klik `Buat Klaim`.
3. Pilih pembelian aki yang ingin diklaim.
4. Isi detail klaim.
5. Simpan.

### Status klaim

Status klaim:

- `Aktif`
- `Selesai`

Untuk menyelesaikan klaim:

1. Buka detail klaim.
2. Klik `Done Claim`.
3. Konfirmasi.
4. Status berubah menjadi `Selesai`.

---

## 9. Migration yang Dibutuhkan

Migration utama:

```txt
003_hierarchy_refactor_SAFE.sql
004_customer_short_codes.sql
005_claims_hierarchy_support.sql
006_wa_logs_hierarchy_support.sql
```

### 003

Membuat struktur baru:

- `customer_profiles`
- `vehicles`
- `vehicle_purchases`

### 004

Menambahkan kode customer pendek seperti:

```txt
C001
C002
C003
```

### 005

Membuat `claims` bisa terhubung ke struktur baru:

- `customer_profile_id`
- `vehicle_purchase_id`

Dan membuat `customer_id` lama tidak wajib.

### 006

Membuat `wa_logs` bisa terhubung ke struktur baru:

- `customer_profile_id`
- `vehicle_purchase_id`

Dan membuat `customer_id` lama tidak wajib.

---

## 10. Seed Data

File seed:

```txt
supabase/seed.sql
```

Seed data dibuat untuk struktur baru:

- 8 customer demo
- 12 kendaraan
- 18 pembelian aki

Seed juga dibuat untuk mengetes:

- 1 customer punya lebih dari 1 kendaraan.
- 1 kendaraan punya lebih dari 1 pembelian aki.
- Filter usia pembelian.
- Status garansi valid / expired.
- Reminder 12, 18, 24 bulan.

---

## 11. Checklist QA Manual

Gunakan checklist ini setelah deploy online.

### Customer

- Login berhasil.
- `/customers` tampil.
- Search customer berjalan.
- Filter usia pembelian berjalan.
- Sort pembelian terbaru / terlama berjalan.
- Detail customer bisa dibuka dengan URL pendek seperti `/customers/C001`.
- Tambah customer baru berhasil.
- Tambah kendaraan berhasil.
- Tambah pembelian aki berhasil.
- Edit pembelian aki berhasil.

### Reminder WhatsApp

- Dashboard menampilkan data follow-up.
- `Kirim WA 1` muncul pada customer yang masuk window reminder.
- Klik `Kirim WA 1` membuka modal.
- Klik `Kirim via WhatsApp` mencatat log.
- Log muncul di `/wa-logs`.
- Dashboard berubah menjadi `Kirim WA 2`.
- Klik `Ada Respon` membuat status selesai.

### Klaim

- Tombol `Buat Klaim` muncul di riwayat pembelian aki.
- Form klaim bisa memilih pembelian aki.
- Klaim berhasil disimpan.
- Klaim muncul di `/claims`.
- Detail klaim bisa dibuka.
- `Done Claim` mengubah status menjadi selesai.

### Role

- Admin bisa input dan edit data.
- Super Admin bisa melihat tombol hapus.
- Admin biasa tidak melihat tombol hapus yang dibatasi.

---

## 12. Catatan Operasional

Untuk testing reminder tanpa menunggu waktu asli, ubah tanggal pembelian data dummy.

Contoh untuk test reminder 12 bulan pada 6 Agustus 2026:

```txt
Tanggal pembelian: 20 Agustus 2025
```

Maka milestone 12 bulan jatuh pada 20 Agustus 2026, dan WA 1 sudah muncul sejak 14 hari sebelumnya.

Untuk test overdue 12 bulan:

```txt
Tanggal pembelian: 1 Juli 2025
```

---

## 13. Ringkasan Alur Utama

Alur normal operasional:

```txt
Tambah Customer
  -> Tambah Kendaraan
    -> Tambah Pembelian Aki
      -> Dashboard menghitung reminder
        -> Kirim WA 1
          -> Log WhatsApp tercatat
            -> Kirim WA 2 jika belum respon
              -> Tandai Ada Respon jika customer membalas
```

Alur klaim:

```txt
Customer Detail
  -> Pilih Kendaraan
    -> Pilih Pembelian Aki
      -> Buat Klaim
        -> Simpan Klaim
          -> Done Claim jika selesai
```
