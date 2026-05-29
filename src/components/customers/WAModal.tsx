'use client'

import { useState } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { buildWAMessage, buildWALink, getDurasiSejak, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/lib/types'

interface WAModalProps {
  customer: Customer
  onClose: () => void
  currentUserId: string
}

export default function WAModal({ customer, onClose, currentUserId }: WAModalProps) {
  const durasi = getDurasiSejak(customer.tanggal_pembelian)
  const defaultMessage = buildWAMessage({
    nama: customer.nama,
    jenisMobil: customer.jenis_mobil,
    tanggalPembelian: customer.tanggal_pembelian,
    durasiSaatKirim: durasi,
    namaToko: 'Toko Aki',
  })

  const [pesan, setPesan] = useState(defaultMessage)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('wa_logs').insert({
        customer_id: customer.id,
        nama_customer: customer.nama,
        nomor_telp: customer.nomor_telp,
        jenis_mobil: customer.jenis_mobil,
        tanggal_pembelian: customer.tanggal_pembelian,
        durasi_saat_kirim: durasi,
        pesan_dikirim: pesan,
        dikirim_oleh: currentUserId,
        waktu_kirim: new Date().toISOString(),
      })
      const waLink = buildWALink(customer.nomor_telp, pesan)
      window.open(waLink, '_blank')
      setSent(true)
    } catch (err) {
      console.error('Failed to log WA:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Kirim WhatsApp</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p><span className="text-gray-500">Customer:</span> <span className="font-medium">{customer.nama}</span></p>
            <p><span className="text-gray-500">Nomor:</span> <span className="font-medium">{customer.nomor_telp}</span></p>
            <p><span className="text-gray-500">Kendaraan:</span> <span className="font-medium">{customer.jenis_mobil}</span></p>
            <p>
              <span className="text-gray-500">Beli:</span>{' '}
              <span className="font-medium">{formatDate(customer.tanggal_pembelian)}</span>{' '}
              <span className="text-gray-400">({durasi} bulan lalu)</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pesan (bisa diedit)
            </label>
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              rows={7}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              Pesan berhasil dikirim dan dicatat ke log.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !pesan.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors"
          >
            <Send size={16} />
            {loading ? 'Memproses...' : 'Kirim via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
