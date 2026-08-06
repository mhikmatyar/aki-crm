'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Search, Calendar, Landmark, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface LogEntry {
  id: string
  waktu_kirim: string
  nama_customer: string
  jenis_mobil: string
  nomor_telp: string
  tanggal_pembelian: string
  durasi_saat_kirim: number
  pesan_dikirim: string
  customer_id: string | null
  customer_profile_id?: string | null
  vehicle_purchase_id: string
  dikirim_oleh: string
  branches?: {
    nama_cabang: string
  } | null
}

interface WALogsClientProps {
  initialLogs: LogEntry[]
  isSuperAdmin: boolean
}

export function WALogsClient({ initialLogs, isSuperAdmin }: WALogsClientProps) {
  const router = useRouter()
  const [logs] = useState<LogEntry[]>(initialLogs)
  const [activeTab, setActiveTab] = useState<'all' | '12' | '18' | '24' | 'others'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Identify which purchases at which milestones have received a response
  const respondedKeys = useMemo(() => {
    const keys = new Set<string>()
    logs.forEach(log => {
      if (log.pesan_dikirim?.startsWith('[ADA RESPON]')) {
        keys.add(`${log.vehicle_purchase_id}_${log.durasi_saat_kirim}`)
      }
    })
    return keys
  }, [logs])

  // Count milestones for stats cards (only actual messages sent)
  const stats = useMemo(() => {
    const actualSentLogs = logs.filter(l => !l.pesan_dikirim?.startsWith('[ADA RESPON]'))
    const total = actualSentLogs.length
    const count12 = actualSentLogs.filter(l => l.durasi_saat_kirim === 12).length
    const count18 = actualSentLogs.filter(l => l.durasi_saat_kirim === 18).length
    const count24 = actualSentLogs.filter(l => l.durasi_saat_kirim === 24).length
    const countOthers = total - (count12 + count18 + count24)
    return { total, count12, count18, count24, countOthers }
  }, [logs])

  // Filter logs by search and active tab
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Filter out response-marker log entries from the row list
      if (log.pesan_dikirim?.startsWith('[ADA RESPON]')) return false

      // 2. Search filter
      const matchesSearch = searchTerm === '' ||
        log.nama_customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nomor_telp.includes(searchTerm) ||
        log.jenis_mobil.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.pesan_dikirim.toLowerCase().includes(searchTerm.toLowerCase())

      // 3. Tab filter
      let matchesTab = true
      if (activeTab === '12') {
        matchesTab = log.durasi_saat_kirim === 12
      } else if (activeTab === '18') {
        matchesTab = log.durasi_saat_kirim === 18
      } else if (activeTab === '24') {
        matchesTab = log.durasi_saat_kirim === 24
      } else if (activeTab === 'others') {
        matchesTab = ![12, 18, 24].includes(log.durasi_saat_kirim)
      }

      return matchesSearch && matchesTab
    })
  }, [logs, activeTab, searchTerm])

  const handleMarkResponded = async (log: LogEntry) => {
    if (!confirm(`Tandai follow-up untuk ${log.nama_customer} pada milestone ${log.durasi_saat_kirim} bulan sebagai "Ada Respon" (Selesai)?`)) {
      return
    }

    try {
      setLoadingId(log.id)
      const supabase = createClient()
      const { error } = await supabase.from('wa_logs').insert({
        customer_id: null,
        customer_profile_id: log.customer_profile_id || log.customer_id,
        nama_customer: log.nama_customer,
        nomor_telp: log.nomor_telp,
        jenis_mobil: log.jenis_mobil,
        tanggal_pembelian: log.tanggal_pembelian,
        durasi_saat_kirim: log.durasi_saat_kirim,
        pesan_dikirim: `[ADA RESPON] Customer merespon follow-up milestone ${log.durasi_saat_kirim} bulan`,
        dikirim_oleh: log.dikirim_oleh,
        vehicle_purchase_id: log.vehicle_purchase_id,
        waktu_kirim: new Date().toISOString(),
      })

      if (error) throw error
      router.refresh()
      window.location.reload()
    } catch (err) {
      console.error('Failed to mark responded from logs:', err)
      alert('Gagal menandai respon.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteLog = async (id: string) => {
    if (!confirm('Hapus log follow-up ini? Status follow-up customer di dashboard akan otomatis disesuaikan kembali.')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('wa_logs').delete().eq('id', id)
      if (error) throw error
      router.refresh()
      window.location.reload()
    } catch (err) {
      console.error('Failed to delete log:', err)
      alert('Gagal menghapus log.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log WhatsApp Follow-Up</h1>
        <p className="text-gray-500 text-sm mt-1">
          Daftar pengiriman pesan follow-up dan status respon customer untuk pengecekan berkala.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Terkirim</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Remind 12 Bulan</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.count12}</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg flex items-center justify-center">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">12 M</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Remind 18 Bulan</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.count18}</p>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg flex items-center justify-center">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">18 M</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Remind 24 Bulan</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.count24}</p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg flex items-center justify-center">
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">24 M</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Tab Workspace */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, mobil, telp, isi pesan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('12')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === '12' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              12 Bulan ({stats.count12})
            </button>
            <button
              onClick={() => setActiveTab('18')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === '18' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              18 Bulan ({stats.count18})
            </button>
            <button
              onClick={() => setActiveTab('24')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === '24' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              24 Bulan ({stats.count24})
            </button>
            {stats.countOthers > 0 && (
              <button
                onClick={() => setActiveTab('others')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'others' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Lainnya ({stats.countOthers})
              </button>
            )}
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-3">Waktu Kirim</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Kendaraan</th>
                <th className="px-5 py-3">Nomor Telp</th>
                <th className="px-5 py-3">Tanggal Beli</th>
                <th className="px-5 py-3">Milestone</th>
                {isSuperAdmin && <th className="px-5 py-3">Cabang</th>}
                <th className="px-5 py-3">Respon</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="px-5 py-12 text-center text-gray-400">
                    Tidak ada log follow-up yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const hasResponded = respondedKeys.has(`${log.vehicle_purchase_id}_${log.durasi_saat_kirim}`)

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-gray-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={14} className="text-green-500 flex-shrink-0" />
                          {formatDateTime(log.waktu_kirim)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{log.nama_customer}</span>
                          <span className="text-[11px] text-gray-400 font-mono line-clamp-1 max-w-[200px]" title={log.pesan_dikirim}>
                            Msg: {log.pesan_dikirim}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">{log.jenis_mobil}</td>
                      <td className="px-5 py-4 text-gray-600">{log.nomor_telp}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar size={12} />
                          {formatDate(log.tanggal_pembelian)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge 
                          variant="secondary"
                          className={
                            log.durasi_saat_kirim === 12
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 text-xs'
                              : log.durasi_saat_kirim === 18
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs'
                              : log.durasi_saat_kirim === 24
                              ? 'bg-red-100 text-red-700 hover:bg-red-100 text-xs'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs'
                          }
                        >
                          {log.durasi_saat_kirim} Bulan
                        </Badge>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Landmark size={12} />
                            {log.branches?.nama_cabang || '-'}
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-4">
                        {hasResponded ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs">
                            <CheckCircle2 size={12} />
                            Ada Respon
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs">
                            <AlertCircle size={12} />
                            Menunggu
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          {!hasResponded && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] text-green-700 border-green-300 hover:bg-green-50 h-7 min-w-[96px] whitespace-nowrap"
                              disabled={loadingId === log.id}
                              onClick={() => handleMarkResponded(log)}
                            >
                              Ada Respon
                            </Button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Log"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
