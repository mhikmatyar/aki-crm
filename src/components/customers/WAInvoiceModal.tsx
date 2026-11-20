'use client'

import { useState } from 'react'
import { X, Send, MessageCircle, RotateCcw } from 'lucide-react'
import { buildWALink, buildInvoiceWAMessage, formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface WAInvoiceModalProps {
  customer: {
    id: string
    nama: string
    nomor_telp: string
    kode_customer?: string | null
  }
  purchase?: {
    id: string
    merek_aki: string
    tipe_aki: string
    harga_beli: number
    tanggal_pembelian: string
    durasi_garansi_bulan: number
    status_garansi?: string
    tukar_tambah: boolean
    lokasi_cabang?: string | null
    vehicle?: {
      plat_nomor?: string | null
      jenis_mobil: string
    }
  } | null
  currentUserId?: string
  onClose: () => void
  onSuccess?: () => void
}

export default function WAInvoiceModal({
  customer,
  purchase,
  currentUserId = '',
  onClose,
  onSuccess,
}: WAInvoiceModalProps) {
  const generateDefaultMessage = () => {
    return buildInvoiceWAMessage({
      nama: customer.nama,
      kodeCustomer: customer.kode_customer,
      jenisMobil: purchase?.vehicle?.jenis_mobil || 'Kendaraan',
      platNomor: purchase?.vehicle?.plat_nomor,
      merekAki: purchase?.merek_aki || '',
      tipeAki: purchase?.tipe_aki || '',
      hargaBeli: purchase?.harga_beli,
      tanggalPembelian: purchase?.tanggal_pembelian || new Date().toISOString().split('T')[0],
      durasiGaransiBulan: purchase?.durasi_garansi_bulan || 12,
      tukarTambah: purchase?.tukar_tambah,
      lokasiCabang: purchase?.lokasi_cabang || 'Cabang Pusat',
      namaToko: 'Pusat Aki',
    })
  }

  const [pesan, setPesan] = useState<string>(generateDefaultMessage())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = () => {
    setPesan(generateDefaultMessage())
  }

  async function handleSend() {
    if (!pesan.trim()) {
      setError('Pesan tidak boleh kosong')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Log invoice sent to wa_logs
      const { error: insertError } = await supabase.from('wa_logs').insert({
        customer_id: null,
        customer_profile_id: customer.id,
        nama_customer: customer.nama,
        nomor_telp: customer.nomor_telp,
        jenis_mobil: purchase?.vehicle?.jenis_mobil || '-',
        tanggal_pembelian: purchase?.tanggal_pembelian || new Date().toISOString().split('T')[0],
        durasi_saat_kirim: 0, // 0 = Hari H pembelian (Invoice baru)
        pesan_dikirim: `[INVOICE] ${pesan}`,
        dikirim_oleh: currentUserId || null,
        vehicle_purchase_id: purchase?.id || null,
        waktu_kirim: new Date().toISOString(),
      })

      if (insertError) {
        console.warn('Gagal mencatat log WA, tetap membuka link WA:', insertError.message)
      }

      // Open WhatsApp web / mobile
      const waLink = buildWALink(customer.nomor_telp, pesan)
      window.open(waLink, '_blank')

      if (onSuccess) onSuccess()
      window.setTimeout(onClose, 500)
    } catch (err: any) {
      console.error('Failed to send WA Invoice:', err)
      setError(err?.message || 'Gagal mengirim pesan WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-base">Kirim Invoice via WhatsApp</h2>
              <p className="text-xs text-gray-500">Struk & bukti garansi elektronik untuk customer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Summary Card */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Customer:</span>{' '}
                <strong className="text-gray-900">{customer.nama}</strong>{' '}
                {customer.kode_customer && (
                  <span className="text-[10px] bg-gray-200 px-1 py-0.5 rounded text-gray-700">
                    {customer.kode_customer}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500">No. WhatsApp:</span>{' '}
                <strong className="text-gray-900">{customer.nomor_telp}</strong>
              </div>
            </div>

            {purchase && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
                <div>
                  <span className="text-gray-500">Aki:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {purchase.merek_aki} {purchase.tipe_aki}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Harga:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {formatCurrency(purchase.harga_beli)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Kendaraan:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {purchase.vehicle?.jenis_mobil || '-'}{' '}
                    {purchase.vehicle?.plat_nomor && `(${purchase.vehicle.plat_nomor})`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Garansi:</span>{' '}
                  <span className="font-medium text-green-700">
                    {purchase.durasi_garansi_bulan} Bulan
                  </span>{' '}
                  <span className="text-gray-400">({formatDate(purchase.tanggal_pembelian)})</span>
                </div>
              </div>
            )}
          </div>

          {/* Editable Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                Pesan WhatsApp (Bisa diedit manual):
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={12} />
                Reset ke Format Awal
              </button>
            </div>
            <textarea
              rows={11}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="w-full text-xs font-mono p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 leading-relaxed bg-white"
              placeholder="Ketik atau edit pesan invoice di sini..."
            />
            <p className="text-[11px] text-gray-400">
              * Teks format WhatsApp: Gunakan <code className="text-gray-600 font-mono">*teks*</code> untuk tebal (bold).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-xs hover:shadow transition-all disabled:opacity-50"
          >
            <Send size={14} />
            {loading ? 'Menyiapkan WhatsApp...' : 'Kirim via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}

