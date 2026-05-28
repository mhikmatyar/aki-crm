import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageCircle, ShieldAlert, Phone, Car, Calendar, MapPin, Clock } from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime, getReminderStatus } from '@/lib/utils'
import type { KondisiKlaim } from '@/lib/types'
import { KONDISI_KLAIM_LABELS } from '@/lib/types'
import WAButtonClient from '@/components/customers/WAButtonClient'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, cabang_id')
    .eq('id', user!.id)
    .single()

  const [{ data: customer }, { data: claims }, { data: waLogs }] = await Promise.all([
    supabase
      .from('customers')
      .select('*, branches(nama_cabang, kota)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('claims')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('wa_logs')
      .select('*')
      .eq('customer_id', params.id)
      .order('waktu_kirim', { ascending: false }),
  ])

  if (!customer) notFound()

  const reminder = getReminderStatus(customer.tanggal_pembelian, customer.reminder_bulan)

  const statusColors: Record<string, string> = {
    A: 'bg-blue-100 text-blue-700',
    B: 'bg-orange-100 text-orange-700',
    C: 'bg-green-100 text-green-700',
    D: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ChevronLeft size={16} />
          Kembali ke Database Customer
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.nama}</h1>
            <p className="text-gray-500 text-sm mt-1">{customer.nomor_telp}</p>
          </div>
          <div className="flex items-center gap-2">
            <WAButtonClient
              customer={customer}
              currentUserId={user!.id}
              currentCabang={profile?.cabang_id ?? null}
            />
            <Link
              href={`/claims/new?customerId=${customer.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
            >
              <ShieldAlert size={16} />
              Buat Klaim
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Informasi Customer</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500">Jenis Kendaraan</p>
                <p className="font-medium">{customer.jenis_mobil}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{customer.nomor_telp}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500">Cabang</p>
                <p className="font-medium">{(customer as any).branches?.nama_cabang}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Pembelian & Reminder</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500">Tanggal Pembelian</p>
                <p className="font-medium">{formatDate(customer.tanggal_pembelian)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 shrink-0 text-center">
                <span className="text-gray-400 text-xs">Rp</span>
              </div>
              <div>
                <p className="text-gray-500">Harga Beli</p>
                <p className="font-medium">{formatCurrency(customer.harga_beli)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500">Status Reminder</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                  reminder.color === 'red' ? 'bg-red-100 text-red-700' :
                  reminder.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {reminder.label}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-sm">
            <p className="text-gray-500">Item yang Dibeli</p>
            <p className="font-medium">{customer.item_dibeli}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Riwayat Klaim ({claims?.length || 0})</h2>
          <Link
            href={`/claims/new?customerId=${customer.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            + Tambah Klaim
          </Link>
        </div>
        {claims && claims.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[claim.kondisi_klaim]}`}>
                      {KONDISI_KLAIM_LABELS[claim.kondisi_klaim as KondisiKlaim]}
                    </span>
                    <span className={`text-xs font-medium ${claim.status === 'done' ? 'text-green-600' : 'text-amber-600'}`}>
                      {claim.status === 'done' ? 'Selesai' : 'Aktif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(claim.tanggal_klaim)} · Posisi: {claim.posisi_aki}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-400">Belum ada riwayat klaim.</div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Riwayat WhatsApp ({waLogs?.length || 0})</h2>
        </div>
        {waLogs && waLogs.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {waLogs.map((log) => (
              <div key={log.id} className="px-6 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <MessageCircle size={12} className="text-green-500" />
                      {formatDateTime(log.waktu_kirim)}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap line-clamp-2">{log.pesan_dikirim}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-400">Belum ada riwayat WhatsApp.</div>
        )}
      </div>
    </div>
  )
}
