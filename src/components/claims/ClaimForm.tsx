'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Customer, KONDISI_KLAIM_LABELS, KondisiKlaim } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ClaimFormProps {
  customer: Customer
  userId: string
}

export default function ClaimForm({ customer, userId }: ClaimFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    posisi_aki: '',
    kondisi_klaim: '' as KondisiKlaim | '',
    catatan: '',
    tanggal_klaim: new Date().toISOString().split('T')[0],
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kondisi_klaim) {
      setError('Silakan pilih kondisi klaim.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: claim, error: insertError } = await supabase
      .from('claims')
      .insert({
        customer_id: customer.id,
        posisi_aki: form.posisi_aki.trim(),
        kondisi_klaim: form.kondisi_klaim,
        catatan: form.catatan.trim(),
        tanggal_klaim: form.tanggal_klaim,
        status: 'aktif',
        created_by: userId,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/claims/${claim.id}`)
    router.refresh()
  }

  const fieldClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Data Customer</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-blue-600 text-xs">Nama</p>
            <p className="font-medium text-gray-900">{customer.nama}</p>
          </div>
          <div>
            <p className="text-blue-600 text-xs">No. Telp</p>
            <p className="font-medium text-gray-900">{customer.nomor_telp}</p>
          </div>
          <div>
            <p className="text-blue-600 text-xs">Kendaraan</p>
            <p className="font-medium text-gray-900">{customer.jenis_mobil}</p>
          </div>
          <div>
            <p className="text-blue-600 text-xs">Item Aki</p>
            <p className="font-medium text-gray-900">{customer.item_dibeli}</p>
          </div>
          <div>
            <p className="text-blue-600 text-xs">Tgl Pembelian</p>
            <p className="font-medium text-gray-900">{formatDate(customer.tanggal_pembelian)}</p>
          </div>
          <div>
            <p className="text-blue-600 text-xs">Harga Beli</p>
            <p className="font-medium text-gray-900">{formatCurrency(customer.harga_beli)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Posisi Aki <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="posisi_aki"
            value={form.posisi_aki}
            onChange={handleChange}
            required
            placeholder="Contoh: Depan kiri, Belakang kanan"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Kondisi Klaim <span className="text-red-500">*</span>
          </label>
          <select
            name="kondisi_klaim"
            value={form.kondisi_klaim}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            <option value="">Pilih kondisi...</option>
            {(Object.entries(KONDISI_KLAIM_LABELS) as [KondisiKlaim, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Tanggal Klaim <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_klaim"
            value={form.tanggal_klaim}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Catatan</label>
        <textarea
          name="catatan"
          value={form.catatan}
          onChange={handleChange}
          rows={4}
          placeholder="Tambahkan catatan tambahan jika diperlukan..."
          className={fieldClass}
        />
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
          {loading ? 'Menyimpan...' : 'Simpan Klaim'}
        </button>
      </div>
    </form>
  )
}
