'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { customerHref } from '@/lib/customer-code'

interface CustomerFormProps {
  userId: string
}

interface Branch {
  id: string
  nama_cabang: string
  kota: string
}

export default function CustomerForm({ userId }: CustomerFormProps) {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nama: '',
    nomor_telp: '',
    catatan_umum: '',
    is_agen: false,
    detail_agen: '',
    plat_nomor: '',
    jenis_mobil: '',
    merek_mobil: '',
    merek_aki: '',
    tipe_aki: '',
    harga_beli: '',
    tanggal_pembelian: '',
    lokasi_cabang: '',
    durasi_garansi_bulan: '12',
    tukar_tambah: false,
    reminder_bulan: '12',
    catatan_transaksi: '',
  })

  useEffect(() => {
    fetch('/api/admin/branches')
      .then((res) => res.json())
      .then((data) => setBranches(data || []))
      .catch(() => setBranches([]))
  }, [])

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const target = event.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox'
      ? target.checked
      : target.value

    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan data.')
    }

    return data
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const customer = await postJson('/api/customer-profiles', {
        nama: form.nama.trim(),
        nomor_telp: form.nomor_telp.trim(),
        catatan_umum: form.catatan_umum.trim() || undefined,
        is_agen: form.is_agen,
        detail_agen: form.is_agen ? form.detail_agen.trim() || undefined : undefined,
      })

      const vehicle = await postJson('/api/vehicles', {
        customer_id: customer.id,
        plat_nomor: form.plat_nomor.trim() || undefined,
        jenis_mobil: form.jenis_mobil.trim(),
        merek_mobil: form.merek_mobil.trim() || undefined,
      })

      await postJson('/api/vehicle-purchases', {
        vehicle_id: vehicle.id,
        merek_aki: form.merek_aki.trim(),
        tipe_aki: form.tipe_aki.trim(),
        harga_beli: Number(form.harga_beli) || 0,
        tanggal_pembelian: form.tanggal_pembelian,
        lokasi_cabang: form.lokasi_cabang || undefined,
        durasi_garansi_bulan: Number(form.durasi_garansi_bulan) || 12,
        tukar_tambah: form.tukar_tambah,
        reminder_bulan: Number(form.reminder_bulan) || 12,
        catatan_transaksi: form.catatan_transaksi.trim() || undefined,
      })

      router.push(customerHref(customer))
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan customer.')
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'
  const sectionTitleClass = 'text-base font-semibold text-gray-900'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className={sectionTitleClass}>1. Data Customer</h2>
          <p className="text-sm text-gray-500 mt-1">Identitas utama customer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Nama Customer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              placeholder="Budi Santoso"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="nomor_telp"
              value={form.nomor_telp}
              onChange={handleChange}
              required
              placeholder="08123456789"
              className={fieldClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Catatan Customer</label>
            <textarea
              name="catatan_umum"
              value={form.catatan_umum}
              onChange={handleChange}
              rows={3}
              placeholder="Contoh: customer agen, minta harga khusus, prefer follow-up pagi..."
              className={fieldClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_agen"
              checked={form.is_agen}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            Customer ini agen/dealer
          </label>

          {form.is_agen && (
            <div>
              <label className={labelClass}>Detail Agen</label>
              <input
                type="text"
                name="detail_agen"
                value={form.detail_agen}
                onChange={handleChange}
                placeholder="Contoh: Bengkel Wijaya Motor"
                className={fieldClass}
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h2 className={sectionTitleClass}>2. Kendaraan Pertama</h2>
          <p className="text-sm text-gray-500 mt-1">Nanti kendaraan kedua bisa ditambahkan dari detail customer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Plat Nomor</label>
            <input
              type="text"
              name="plat_nomor"
              value={form.plat_nomor}
              onChange={handleChange}
              placeholder="B 1234 ABC"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Jenis Mobil <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="jenis_mobil"
              value={form.jenis_mobil}
              onChange={handleChange}
              required
              placeholder="Avanza 1.3 G 2019"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Merek Mobil</label>
            <input
              type="text"
              name="merek_mobil"
              value={form.merek_mobil}
              onChange={handleChange}
              placeholder="Toyota"
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h2 className={sectionTitleClass}>3. Pembelian Aki Pertama</h2>
          <p className="text-sm text-gray-500 mt-1">Pembelian berikutnya ditambahkan dari kendaraan yang sama.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Merek Aki <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="merek_aki"
              value={form.merek_aki}
              onChange={handleChange}
              required
              placeholder="GS Astra"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Tipe Aki <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tipe_aki"
              value={form.tipe_aki}
              onChange={handleChange}
              required
              placeholder="NS60LS"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Harga Beli (Rp)</label>
            <input
              type="number"
              name="harga_beli"
              value={form.harga_beli}
              onChange={handleChange}
              min="0"
              placeholder="850000"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Tanggal Pembelian <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_pembelian"
              value={form.tanggal_pembelian}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Lokasi Cabang</label>
            <select
              name="lokasi_cabang"
              value={form.lokasi_cabang}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="">Tidak dipilih</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.nama_cabang} - {branch.kota}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Durasi Garansi</label>
            <select
              name="durasi_garansi_bulan"
              value={form.durasi_garansi_bulan}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="6">6 bulan</option>
              <option value="12">12 bulan</option>
              <option value="18">18 bulan</option>
              <option value="24">24 bulan</option>
              <option value="36">36 bulan</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Reminder Follow-up</label>
            <select
              name="reminder_bulan"
              value={form.reminder_bulan}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="12">12 bulan</option>
              <option value="18">18 bulan</option>
              <option value="24">24 bulan</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 md:pt-8">
            <input
              type="checkbox"
              name="tukar_tambah"
              checked={form.tukar_tambah}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            Transaksi tukar tambah
          </label>

          <div className="md:col-span-2">
            <label className={labelClass}>Catatan Transaksi</label>
            <textarea
              name="catatan_transaksi"
              value={form.catatan_transaksi}
              onChange={handleChange}
              rows={3}
              placeholder="Catatan khusus transaksi ini..."
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Menyimpan...' : 'Simpan Customer + Pembelian Pertama'}
        </button>
      </div>
    </form>
  )
}
