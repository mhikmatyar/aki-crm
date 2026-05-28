'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Branch } from '@/lib/types'

interface CustomerFormProps {
  branches: Branch[]
  defaultCabangId?: string | null
  isSuperAdmin: boolean
  userId: string
}

export default function CustomerForm({
  branches,
  defaultCabangId,
  isSuperAdmin,
  userId,
}: CustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nama: '',
    nomor_telp: '',
    jenis_mobil: '',
    harga_beli: '',
    item_dibeli: '',
    tanggal_pembelian: '',
    lokasi_cabang: defaultCabangId || '',
    reminder_bulan: '6',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.lokasi_cabang) {
      setError('Silakan pilih cabang.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: insertError } = await supabase.from('customers').insert({
      nama: form.nama.trim(),
      nomor_telp: form.nomor_telp.trim(),
      jenis_mobil: form.jenis_mobil.trim(),
      harga_beli: parseFloat(form.harga_beli) || 0,
      item_dibeli: form.item_dibeli.trim(),
      tanggal_pembelian: form.tanggal_pembelian,
      lokasi_cabang: form.lokasi_cabang,
      reminder_bulan: parseInt(form.reminder_bulan, 10),
      created_by: userId,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/customers')
    router.refresh()
  }

  const fieldClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

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

        <div>
          <label className={labelClass}>
            Jenis / Merk Mobil <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="jenis_mobil"
            value={form.jenis_mobil}
            onChange={handleChange}
            required
            placeholder="Toyota Avanza"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Item / Tipe Aki <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="item_dibeli"
            value={form.item_dibeli}
            onChange={handleChange}
            required
            placeholder="GS NS40ZL"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Harga Beli (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="harga_beli"
            value={form.harga_beli}
            onChange={handleChange}
            required
            min="0"
            placeholder="650000"
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
          <label className={labelClass}>
            Cabang <span className="text-red-500">*</span>
          </label>
          {isSuperAdmin ? (
            <select
              name="lokasi_cabang"
              value={form.lokasi_cabang}
              onChange={handleChange}
              required
              className={fieldClass}
            >
              <option value="">Pilih cabang...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama_cabang} — {b.kota}
                </option>
              ))}
            </select>
          ) : (
            <select
              name="lokasi_cabang"
              value={form.lokasi_cabang}
              onChange={handleChange}
              required
              disabled={!!defaultCabangId}
              className={fieldClass}
            >
              {branches
                .filter((b) => b.id === defaultCabangId)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama_cabang} — {b.kota}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Reminder (bulan) <span className="text-red-500">*</span>
          </label>
          <select
            name="reminder_bulan"
            value={form.reminder_bulan}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            <option value="3">3 bulan</option>
            <option value="6">6 bulan</option>
            <option value="12">12 bulan</option>
            <option value="18">18 bulan</option>
            <option value="24">24 bulan</option>
          </select>
        </div>
      </div>

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
          {loading ? 'Menyimpan...' : 'Simpan Customer'}
        </button>
      </div>
    </form>
  )
}
