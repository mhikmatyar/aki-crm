'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { KONDISI_KLAIM_LABELS, KondisiKlaim } from '@/lib/types'
import { formatCurrency, formatDate, getWarrantyStatus } from '@/lib/utils'

interface ClaimPurchaseOption {
  id: string
  merek_aki: string
  tipe_aki: string
  harga_beli: number
  tanggal_pembelian: string
  durasi_garansi_bulan: number
  status_garansi: string
  lokasi_cabang?: string | null
  vehicle: {
    id: string
    customer_id: string
    jenis_mobil: string
    merek_mobil?: string | null
    plat_nomor?: string | null
  }
  customer: {
    id: string
    kode_customer?: string | null
    nama: string
    nomor_telp: string
  }
}

interface ClaimFormProps {
  customers: any[]
  userId: string
  initialPurchaseId?: string
}

function flattenPurchases(customers: any[]): ClaimPurchaseOption[] {
  return customers.flatMap((customer) =>
    (customer.vehicles || []).flatMap((vehicle: any) =>
      (vehicle.vehicle_purchases || []).map((purchase: any) => ({
        ...purchase,
        vehicle,
        customer: {
          id: customer.id,
          kode_customer: customer.kode_customer,
          nama: customer.nama,
          nomor_telp: customer.nomor_telp,
        },
      }))
    )
  )
}

export default function ClaimForm({ customers, userId, initialPurchaseId }: ClaimFormProps) {
  const router = useRouter()
  const purchaseOptions = useMemo(() => flattenPurchases(customers), [customers])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    vehicle_purchase_id:
      initialPurchaseId && purchaseOptions.some((purchase) => purchase.id === initialPurchaseId)
        ? initialPurchaseId
        : purchaseOptions[0]?.id || '',
    posisi_aki: '',
    kondisi_klaim: '' as KondisiKlaim | '',
    catatan: '',
    tanggal_klaim: new Date().toISOString().split('T')[0],
  })

  const selectedPurchase = purchaseOptions.find(
    (purchase) => purchase.id === form.vehicle_purchase_id
  )
  const selectedWarrantyStatus = selectedPurchase
    ? getWarrantyStatus(selectedPurchase.tanggal_pembelian, selectedPurchase.durasi_garansi_bulan)
    : null

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedPurchase) {
      setError('Silakan pilih pembelian aki yang ingin diklaim.')
      return
    }

    if (!form.posisi_aki.trim()) {
      setError('Silakan isi posisi aki.')
      return
    }

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
        customer_id: null,
        customer_profile_id: selectedPurchase.customer.id,
        vehicle_purchase_id: selectedPurchase.id,
        posisi_aki: form.posisi_aki.trim(),
        kondisi_klaim: form.kondisi_klaim,
        catatan: form.catatan.trim() || null,
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

  if (purchaseOptions.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm">
        Belum ada data pembelian aki yang bisa diklaim. Tambahkan kendaraan dan pembelian aki di
        detail customer terlebih dahulu.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>
          Pembelian Aki yang Diklaim <span className="text-red-500">*</span>
        </label>
        <select
          name="vehicle_purchase_id"
          value={form.vehicle_purchase_id}
          onChange={handleChange}
          required
          className={fieldClass}
        >
          {purchaseOptions.map((purchase) => (
            <option key={purchase.id} value={purchase.id}>
              {purchase.customer.kode_customer ? `${purchase.customer.kode_customer} - ` : ''}
              {purchase.customer.nama} - {purchase.vehicle.jenis_mobil}
              {purchase.vehicle.plat_nomor ? ` (${purchase.vehicle.plat_nomor})` : ''}
              {' - '}
              {purchase.merek_aki} {purchase.tipe_aki}
            </option>
          ))}
        </select>
      </div>

      {selectedPurchase && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-3">Data Pembelian Terpilih</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-red-600 text-xs">Customer</p>
              <p className="font-medium text-gray-900">{selectedPurchase.customer.nama}</p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">No. Telp</p>
              <p className="font-medium text-gray-900">{selectedPurchase.customer.nomor_telp}</p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">Kendaraan</p>
              <p className="font-medium text-gray-900">
                {selectedPurchase.vehicle.jenis_mobil}
                {selectedPurchase.vehicle.plat_nomor && ` - ${selectedPurchase.vehicle.plat_nomor}`}
              </p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">Aki</p>
              <p className="font-medium text-gray-900">
                {selectedPurchase.merek_aki} {selectedPurchase.tipe_aki}
              </p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">Tgl Pembelian</p>
              <p className="font-medium text-gray-900">
                {formatDate(selectedPurchase.tanggal_pembelian)}
              </p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">Harga Beli</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(selectedPurchase.harga_beli)}
              </p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">Garansi</p>
              <p className="font-medium text-gray-900">
                {selectedWarrantyStatus === 'valid' ? 'VALID' : 'EXPIRED'} ·{' '}
                {selectedPurchase.durasi_garansi_bulan} bulan
              </p>
            </div>
            <div>
              <p className="text-blue-600 text-xs">Cabang</p>
              <p className="font-medium text-gray-900">
                {selectedPurchase.lokasi_cabang || '-'}
              </p>
            </div>
          </div>
        </div>
      )}

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
            placeholder="Contoh: Utama, depan, bagasi"
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
