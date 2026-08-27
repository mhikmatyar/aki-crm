# AI Video Prompts Manager

Sistem manajemen prompt untuk produksi video AI yang memudahkan Anda mengelola character sheet dan video prompt untuk berbagai model AI.

## Fitur Utama

### 1. **Manajemen Prompt Lengkap**
- Buat, edit, dan hapus prompt dengan mudah
- Simpan character sheet dan video prompt dalam satu tempat
- Organisir prompt dengan tags untuk pencarian yang lebih mudah
- Support untuk berbagai model AI (Runway Gen-3, Pika Labs, Leonardo AI, dll)

### 2. **Template Bawaan**
- **Character Sheet Templates:**
  - Anime Character
  - Realistic Person
  - 3D Character
- **Video Prompt Templates:**
  - Camera Movement
  - Scene Description
  - Runway Gen-3 Format

### 3. **Pencarian & Filter**
- Cari prompt berdasarkan judul, tags, atau konten
- Filter berdasarkan model AI
- Tampilan yang mudah dibaca dengan syntax highlighting

### 4. **Copy to Clipboard**
- Copy character sheet atau video prompt dengan satu klik
- Notifikasi visual saat berhasil di-copy

### 5. **Export & Import**
- Export semua prompt ke file JSON
- Import prompt dari file backup
- Backup data secara berkala

## Cara Menggunakan

### Membuat Prompt Baru
1. Klik "**Tambah Prompt Baru**" di halaman AI Video Prompts
2. Isi informasi dasar:
   - **Judul Prompt**: Nama deskriptif untuk prompt Anda
   - **Model AI**: Pilih model yang akan digunakan
   - **Tags**: Tambahkan tags untuk organisasi (opsional)
3. Isi **Character Sheet**:
   - Gunakan template atau tulis dari awal
   - Semakin detail, semakin konsisten hasil video
4. Isi **Video Prompt**:
   - Sesuaikan format dengan model AI yang dipilih
   - Gunakan template sebagai panduan
5. Klik "**Simpan Prompt**"

### Menggunakan Prompt
1. Buka halaman AI Video Prompts
2. Cari prompt yang ingin digunakan
3. Klik tombol "**Copy**" pada Character Sheet atau Video Prompt
4. Paste ke aplikasi video AI Anda

### Mengedit Prompt
1. Klik icon **Edit** (pensil) pada prompt
2. Ubah informasi yang diperlukan
3. Klik "**Update Prompt**"

### Menghapus Prompt
1. Klik icon **Trash** (tempat sampah) pada prompt
2. Konfirmasi penghapusan

### Export & Import
- **Export**: Klik tombol "Export" untuk download semua prompt sebagai file JSON
- **Import**: Klik tombol "Import" dan pilih file JSON yang sudah di-export sebelumnya

## Tips & Best Practices

### Character Sheet
- Buat character sheet yang detail dan konsisten
- Simpan informasi penting seperti:
  - Physical appearance (warna rambut, mata, tinggi badan)
  - Clothing style dan accessories
  - Personality traits
  - Default expression

### Video Prompt
- Sesuaikan format prompt dengan model AI yang digunakan
- Runway Gen-3: `[Subject + action], [camera], [environment], [lighting], [style]`
- Include informasi tentang:
  - Camera movement (zoom in, pan, track)
  - Lighting conditions
  - Mood dan style
  - Duration (jika diperlukan)

### Organisasi
- Gunakan naming convention yang konsisten untuk judul
- Tambahkan tags yang relevan (genre, style, mood)
- Export backup secara berkala

## Model AI yang Didukung

- Runway Gen-3
- Runway Gen-2
- Pika Labs
- Stable Video Diffusion
- AnimateDiff
- Deforum
- Leonardo AI
- Midjourney Video
- Custom Model (untuk model lainnya)

## Penyimpanan Data

Data prompt disimpan di **localStorage browser**. Ini berarti:
- ✅ Akses cepat tanpa perlu koneksi internet
- ✅ Data tersimpan di device Anda
- ⚠️ Data akan hilang jika browser cache dibersihkan
- 💡 **Penting**: Export backup secara berkala!

## Upgrade ke Database (Opsional)

Jika ingin menyimpan prompt di database Supabase:
1. Buat tabel `ai_prompts` di Supabase
2. Ubah fungsi `loadPrompts` dan `handleSubmit` di `AIPromptForm.tsx`
3. Ganti localStorage dengan Supabase queries

## Lokasi File

```
src/
├── app/(protected)/ai-prompts/
│   ├── page.tsx                    # Halaman utama daftar prompt
│   ├── new/
│   │   └── page.tsx                # Halaman buat prompt baru
│   └── [id]/
│       └── page.tsx                # Halaman edit prompt
└── components/ai-prompts/
    ├── AIPromptClient.tsx          # Component client untuk list & filter
    └── AIPromptForm.tsx            # Component form untuk create/edit
```

## Troubleshooting

### Prompt tidak tersimpan
- Pastikan browser mendukung localStorage
- Check browser console untuk error
- Pastikan semua field required terisi

### Data hilang setelah clear cache
- Export prompt secara berkala
- Import kembali dari file backup

### Template tidak muncul
- Refresh halaman
- Check browser console untuk error

## Support

Untuk pertanyaan atau bantuan, hubungi tim development.

---

**Dibuat dengan ❤️ untuk mempermudah produksi video AI**
