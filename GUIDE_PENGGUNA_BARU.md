# Panduan Singkat untuk Pengguna Baru AKI CRM

Last updated: 7 Agustus 2026

Dokumen ini dibuat khusus untuk pengguna baru agar lebih mudah memahami aplikasi AKI CRM sebelum mulai menggunakannya.

Tujuan dokumen ini:

- menjelaskan fitur-fitur utama AKI CRM
- menjelaskan alur kerja sehari-hari
- membantu user baru memahami apa yang harus dilakukan pertama kali

---

## 1. Apa itu AKI CRM?

AKI CRM adalah sistem bantu untuk mengelola customer, kendaraan, riwayat pembelian aki, reminder WhatsApp, dan klaim aki.

Secara sederhana, aplikasi ini membantu tim toko aki untuk:

- mengelola data customer
- melihat kendaraan yang dimiliki customer
- mencatat pembelian aki
- mengingatkan customer lewat WhatsApp
- mencatat klaim aki
- melihat aktivitas harian dalam satu dashboard

---

## 2. Fitur Utama yang Harus Diketahui

### A. Database Customer

Bagian ini berisi semua data customer.

Fungsi utamanya:

- melihat daftar customer
- mencari customer berdasarkan nama, telepon, plat, atau jenis mobil
- melihat riwayat pembelian aki
- melihat status garansi

Halaman yang biasanya dipakai:

```txt
/customers
```

### B. Detail Customer

Saat Anda membuka satu customer, Anda bisa melihat:

- data customer
- kendaraan yang dimiliki
- riwayat pembelian aki
- status garansi
- tombol untuk menambah kendaraan atau pembelian baru

Ini adalah pusat informasi utama untuk setiap customer.

### C. Dashboard Follow-Up

Dashboard adalah halaman kerja harian.

Di sini Anda bisa melihat:

- customer yang perlu di-follow up
- customer yang sudah waktunya dikirim reminder WhatsApp
- status follow-up 1, follow-up 2, atau sudah ada respon

Halaman yang dipakai:

```txt
/dashboard
```

### D. Reminder WhatsApp

Fitur ini dipakai untuk mengirim pesan pengingat ke customer.

Biasanya digunakan untuk:

- reminder 12 bulan
- reminder 18 bulan
- reminder 24 bulan

Setelah pesan dikirim, sistem akan mencatatnya di log WhatsApp.

### E. Log WhatsApp

Log WhatsApp adalah riwayat semua pesan yang sudah dikirim.

Di sini Anda bisa:

- melihat semua reminder yang pernah dikirim
- mencari riwayat tertentu
- melihat apakah customer sudah merespon

Halaman:

```txt
/wa-logs
```

### F. Klaim Aki

Fitur klaim dipakai untuk mencatat jika ada masalah pada aki yang pernah dibeli.

Klaim akan dikaitkan ke pembelian aki tertentu, bukan hanya ke customer secara umum.

Halaman:

```txt
/claims
```

### G. Manajemen User

Bagian ini hanya untuk role tertentu, biasanya Super Admin.

Fungsinya:

- menambah user
- melihat daftar user
- mengatur role user

Halaman:

```txt
/admin/users
```

---

## 3. Alur Kerja yang Paling Sering Dipakai

### A. Saat ada customer baru

1. Masuk ke halaman customer.
2. Klik tombol untuk menambah customer baru.
3. Isi data customer.
4. Tambahkan kendaraan pertama customer.
5. Tambahkan pembelian aki pertama.
6. Simpan data.

Setelah itu, customer sudah masuk ke sistem dan siap dipantau.

### B. Saat ingin melihat data customer

1. Buka halaman customer.
2. Cari customer yang ingin dilihat.
3. Buka detail customer.
4. Lihat kendaraan dan riwayat pembelian aki.
5. Jika perlu, tambahkan kendaraan atau pembelian baru.

### C. Saat ingin melakukan reminder WhatsApp

1. Buka dashboard.
2. Lihat daftar customer yang masuk jadwal reminder.
3. Pilih customer yang perlu dikirim pesan.
4. Klik tombol kirim WA.
5. Edit pesan jika perlu.
6. Kirim pesan.
7. Cek log WA setelah pengiriman.

### D. Saat ada klaim aki

1. Buka detail customer atau halaman klaim.
2. Pilih pembelian aki yang ingin diklaim.
3. Isi data klaim.
4. Simpan.
5. Jika klaim sudah selesai, tandai sebagai selesai.

### E. Saat ingin melihat aktivitas harian

1. Buka dashboard untuk melihat prioritas kerja.
2. Buka WA log untuk melihat histori kirim pesan.
3. Buka claims untuk memastikan klaim aktif dan selesai.

---

## 4. Alur Kerja Harian yang Disarankan

### Pagi hari

- buka dashboard
- cek customer yang perlu reminder
- lihat klaim yang masih aktif

### Siang hari

- kirim reminder WhatsApp
- cek respon customer
- tambahkan data customer baru jika ada

### Sore / akhir hari

- cek log WhatsApp
- pastikan klaim sudah ditangani
- lakukan update data jika ada perubahan

---

## 5. Tips Penting untuk Pemula

- Jangan buru-buru menghapus data tanpa memastikan bahwa data tersebut memang tidak dipakai lagi.
- Pastikan setiap customer punya kendaraan dan pembelian aki yang benar.
- Jika ada customer yang sudah pernah dibeli aki lebih dari sekali, tambahkan pembelian baru untuk riwayat yang benar.
- Gunakan dashboard sebagai pusat prioritas kerja harian.
- Kalau ragu, cek detail customer terlebih dahulu sebelum mengedit atau menambah data.

---

## 6. Ringkasan Singkat

Secara sederhana, alur kerja AKI CRM adalah:

```txt
Customer baru
  -> tambahkan kendaraan
    -> tambahkan pembelian aki
      -> pantau reminder di dashboard
        -> kirim WA jika perlu
          -> catat klaim jika ada masalah
```

Dengan begitu, user baru bisa memahami bahwa aplikasi ini fokus pada tiga hal utama:

1. mengelola customer
2. mengelola pembelian aki dan garansi
3. mengelola follow-up dan klaim
