import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function WALogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, cabang_id')
    .eq('id', user.id)
    .single()

  const { data: logs } = await supabase
    .from('wa_logs')
    .select('*, branches(nama_cabang)')
    .order('waktu_kirim', { ascending: false })

  const isSuperAdmin = profile?.role === 'super_admin'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log WhatsApp</h1>
        <p className="text-gray-500 text-sm mt-1">
          {logs?.length || 0} pesan terkirim
          {!isSuperAdmin && ' dari cabang Anda'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu Kirim</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kendaraan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Telp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tgl Beli</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Durasi</th>
                {isSuperAdmin && (
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Cabang</th>
                )}
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Pesan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(logs || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    Belum ada log WhatsApp
                  </td>
                </tr>
              ) : (
                (logs || []).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={14} className="text-green-500 flex-shrink-0" />
                        {formatDateTime(log.waktu_kirim)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{log.nama_customer}</td>
                    <td className="px-4 py-3 text-gray-700">{log.jenis_mobil}</td>
                    <td className="px-4 py-3 text-gray-600">{log.nomor_telp}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(log.tanggal_pembelian)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {log.durasi_saat_kirim} bln
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {(log as any).branches?.nama_cabang || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-600 text-xs line-clamp-2 whitespace-pre-wrap">{log.pesan_dikirim}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
