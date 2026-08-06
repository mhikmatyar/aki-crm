'use client'

import { useState, useEffect } from 'react'
import { Users, Bell, Car, AlertTriangle, CheckCircle2, MessageCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import WAModal from '@/components/customers/WAModal'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalCustomers: number
  totalVehicles: number
  remindersDue: number
  remindersOverdue: number
  remindersWaiting: number
  remindersDone: number
  totalTracked: number
}

interface ReminderItem {
  purchaseId: string
  customerId: string
  customerName: string
  nomorTelp: string
  catatanCustomer: string | null
  isAgen: boolean
  vehicleId: string
  platNomor: string | null
  jenisMobil: string
  merekAki: string
  tipeAki: string
  hargaBeli: number
  tanggalPembelian: string
  tukarTambah: boolean
  cabangNama: string
  ageDays: number
  ageMonths: number
  milestone: number
  status: 'due' | 'overdue' | 'done'
  statusText: string
  statusColor: string
  followupState: 'pending' | 'followup_1' | 'followup_2' | 'responded'
}

interface DashboardClientProps {
  currentUserId: string
}

export function DashboardClient({ currentUserId }: DashboardClientProps) {
  const [purchases, setPurchases] = useState<any[]>([])
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalVehicles: 0,
    remindersDue: 0,
    remindersOverdue: 0,
    remindersWaiting: 0,
    remindersDone: 0,
    totalTracked: 0,
  })
  
  // Filters
  const [milestoneFilter, setMilestoneFilter] = useState<'all' | '12' | '18' | '24'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'waiting' | 'done'>('all')
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'due' | 'overdue'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // WA Modal state
  const [activeWaModal, setActiveWaModal] = useState<{
    purchaseId: string
    customer: {
      id: string
      nama: string
      nomor_telp: string
      jenis_mobil: string
      tanggal_pembelian: string
    }
    milestone: number
    tahap: number
  } | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/vehicle-purchases')
      const purchasesData = await res.json()
      setPurchases(purchasesData || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (purchases.length === 0) return

    const now = new Date()
    const reminderMilestones = [12, 18, 24]
    const reminderItems: ReminderItem[] = []
    
    const uniqueCustomers = new Set<string>()
    const uniqueVehicles = new Set<string>()

    purchases.forEach((purchase: any) => {
      const customerProfile = purchase.vehicle?.customer_profile
      const vehicle = purchase.vehicle
      
      if (!customerProfile || !vehicle) return

      uniqueCustomers.add(customerProfile.id)
      uniqueVehicles.add(vehicle.id)

      const purchaseDate = new Date(purchase.tanggal_pembelian)
      const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const d2 = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate())
      const ageDays = Math.max(0, Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)))
      
      const ageMonths = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                        (now.getMonth() - purchaseDate.getMonth())

      let activeMilestone = null
      let activeStatus: 'due' | 'overdue' | 'done' | null = null
      let activeStatusText = ''
      let activeStatusColor = ''
      let followupState: 'pending' | 'followup_1' | 'followup_2' | 'responded' = 'pending'

      for (const milestone of reminderMilestones) {
        const targetDate = new Date(purchaseDate)
        targetDate.setMonth(targetDate.getMonth() + milestone)
        
        const windowStart = new Date(targetDate)
        windowStart.setDate(windowStart.getDate() - 14)

        if (now >= windowStart) {
          const milestoneLogs = purchase.wa_logs?.filter((log: any) => log.durasi_saat_kirim === milestone) || []
          const hasResponded = milestoneLogs.some((log: any) => log.pesan_dikirim?.startsWith('[ADA RESPON]'))
          const diffTime = now.getTime() - targetDate.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          activeMilestone = milestone
          if (hasResponded) {
            followupState = 'responded'
            activeStatus = 'done'
            activeStatusText = `Selesai (Ada Respon) - ${milestone} Bln`
            activeStatusColor = 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50'
          } else if (milestoneLogs.length >= 2) {
            followupState = 'followup_2'
            activeStatus = 'done'
            activeStatusText = `Follow-Up 2 Sent - ${milestone} Bln`
            activeStatusColor = 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold'
          } else if (milestoneLogs.length === 1) {
            followupState = 'followup_1'
            activeStatus = 'done'
            activeStatusText = `Follow-Up 1 Sent - ${milestone} Bln`
            activeStatusColor = 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50'
          } else {
            followupState = 'pending'
            if (diffDays > 14) {
              activeStatus = 'overdue'
              activeStatusText = `Terlewat ${milestone} Bln (${diffDays} hari)`
              activeStatusColor = 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
            } else {
              activeStatus = 'due'
              const daysText = diffDays < 0 ? `dalam ${Math.abs(diffDays)} hari` : `${diffDays} hari lalu`
              activeStatusText = `Remind ${milestone} Bln (${daysText})`
              activeStatusColor = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50'
            }
          }
        }
      }

      if (activeMilestone !== null && activeStatus !== null) {
        reminderItems.push({
          purchaseId: purchase.id,
          customerId: customerProfile.id,
          customerName: customerProfile.nama,
          nomorTelp: customerProfile.nomor_telp,
          catatanCustomer: customerProfile.catatan_umum,
          isAgen: customerProfile.is_agen,
          vehicleId: vehicle.id,
          platNomor: vehicle.plat_nomor,
          jenisMobil: vehicle.jenis_mobil,
          merekAki: purchase.merek_aki,
          tipeAki: purchase.tipe_aki,
          hargaBeli: purchase.harga_beli,
          tanggalPembelian: purchase.tanggal_pembelian,
          tukarTambah: purchase.tukar_tambah,
          cabangNama: purchase.branch?.nama_cabang || 'Pusat',
          ageDays,
          ageMonths,
          milestone: activeMilestone,
          status: activeStatus,
          statusText: activeStatusText,
          statusColor: activeStatusColor,
          followupState,
        })
      }
    })

    const statsObj = {
      totalCustomers: uniqueCustomers.size,
      totalVehicles: uniqueVehicles.size,
      remindersDue: reminderItems.filter(item => item.status === 'due' && item.followupState === 'pending').length,
      remindersOverdue: reminderItems.filter(item => item.status === 'overdue' && item.followupState === 'pending').length,
      remindersWaiting: reminderItems.filter(item => ['followup_1', 'followup_2'].includes(item.followupState)).length,
      remindersDone: reminderItems.filter(item => item.followupState === 'responded').length,
      totalTracked: reminderItems.length,
    }

    setStats(statsObj)
    setReminders(reminderItems)
  }, [purchases])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const handleMarkResponded = async (item: ReminderItem) => {
    if (!confirm(`Tandai follow-up untuk ${item.customerName} pada milestone ${item.milestone} bulan sebagai "Ada Respon" (Selesai)?`)) {
      return
    }
    
    try {
      const supabase = createClient()
      const { error } = await supabase.from('wa_logs').insert({
        customer_id: null,
        customer_profile_id: item.customerId,
        nama_customer: item.customerName,
        nomor_telp: item.nomorTelp,
        jenis_mobil: item.jenisMobil,
        tanggal_pembelian: item.tanggalPembelian,
        durasi_saat_kirim: item.milestone,
        pesan_dikirim: `[ADA RESPON] Customer merespon follow-up milestone ${item.milestone} bulan`,
        dikirim_oleh: currentUserId,
        vehicle_purchase_id: item.purchaseId,
        waktu_kirim: new Date().toISOString(),
      })
      
      if (error) throw error
      fetchDashboardData()
    } catch (err) {
      console.error('Failed to mark as responded:', err)
      alert('Gagal menandai respon. Silakan coba lagi.')
    }
  }

  const filteredReminders = reminders.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorTelp.includes(searchTerm) ||
      (item.platNomor && item.platNomor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.jenisMobil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipeAki.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesMilestone = milestoneFilter === 'all' || item.milestone === Number(milestoneFilter)
    
    let matchesStatus = true
    if (statusFilter === 'pending') {
      matchesStatus = item.followupState === 'pending'
    } else if (statusFilter === 'waiting') {
      matchesStatus = ['followup_1', 'followup_2'].includes(item.followupState)
    } else if (statusFilter === 'done') {
      matchesStatus = item.followupState === 'responded'
    }
      
    const matchesSchedule = scheduleFilter === 'all' || item.status === scheduleFilter

    return matchesSearch && matchesMilestone && matchesStatus && matchesSchedule
  })

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const statusPriority = { overdue: 1, due: 2, done: 3 }
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status]
    }
    return b.ageDays - a.ageDays
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Follow-Up</h1>
          <p className="text-gray-500 text-sm mt-1">Memuat data follow-up...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Follow-Up</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pusat Kontrol CS untuk remind jadwal pengecekan aki customer (12, 18, 24 bulan)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Jadwal Remind</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.remindersDue}</p>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-lg">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Terlewat (Overdue)</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.remindersOverdue}</p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Menunggu Respon</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.remindersWaiting}</p>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Selesai (Ada Respon)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.remindersDone}</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Customer</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List Workspace */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari nama, plat, nomor telp, aki..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Milestone Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Milestone:</span>
              <Select
                value={milestoneFilter}
                onChange={(e) => setMilestoneFilter(e.target.value as any)}
                className="w-32 py-1 text-xs"
              >
                <option value="all">Semua</option>
                <option value="12">12 Bulan</option>
                <option value="18">18 Bulan</option>
                <option value="24">24 Bulan</option>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status:</span>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-38 py-1 text-xs"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Belum Remind</option>
                <option value="waiting">Menunggu Respon</option>
                <option value="done">Selesai (Ada Respon)</option>
              </Select>
            </div>

            {/* Schedule Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Jadwal:</span>
              <Select
                value={scheduleFilter}
                onChange={(e) => setScheduleFilter(e.target.value as any)}
                className="w-36 py-1 text-xs"
              >
                <option value="all">Semua Jadwal</option>
                <option value="due">Jadwal Remind</option>
                <option value="overdue">Terlewat</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Kendaraan</th>
                <th className="px-5 py-3">Aki Terpasang</th>
                <th className="px-5 py-3">Hari Sejak Beli</th>
                <th className="px-5 py-3">Status Follow-up</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sortedReminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    Tidak ada jadwal follow-up yang sesuai filter
                  </td>
                </tr>
              ) : (
                sortedReminders.map((item) => (
                  <tr key={item.purchaseId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                          {item.customerName}
                          {item.isAgen && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1">
                              Agen
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">{item.nomorTelp}</span>
                        {item.catatanCustomer && (
                          <span className="text-[11px] text-gray-400 italic line-clamp-1 mt-0.5 max-w-[200px]" title={item.catatanCustomer}>
                            Note: {item.catatanCustomer}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{item.jenisMobil}</span>
                        {item.platNomor ? (
                          <span className="text-xs font-mono text-gray-500 font-semibold bg-gray-100 rounded px-1.5 py-0.5 inline-block mt-0.5 self-start">
                            {item.platNomor}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Plat</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{item.merekAki} {item.tipeAki}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500">{formatCurrency(item.hargaBeli)}</span>
                          <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5">
                            {item.tukarTambah ? 'TT' : 'Non-TT'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{item.ageDays} hari</span>
                        <span className="text-xs text-gray-400">
                          {item.ageMonths} bln (Beli: {new Date(item.tanggalPembelian).toLocaleDateString('id-ID')})
                        </span>
                        <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 rounded px-1 py-0.5 self-start mt-0.5">
                          📍 {item.cabangNama}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={`${item.statusColor} border`}>
                        {item.statusText}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {item.followupState === 'pending' && (
                          <Button
                            size="sm"
                            className="flex items-center gap-1.5 ml-auto text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => setActiveWaModal({
                              purchaseId: item.purchaseId,
                              customer: {
                                id: item.customerId,
                                nama: item.customerName,
                                nomor_telp: item.nomorTelp,
                                jenis_mobil: item.jenisMobil,
                                tanggal_pembelian: item.tanggalPembelian,
                              },
                              milestone: item.milestone,
                              tahap: 1,
                            })}
                          >
                            <MessageCircle size={14} />
                            Kirim WA 1
                          </Button>
                        )}

                        {item.followupState === 'followup_1' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-green-700 border-green-300 hover:bg-green-50 h-8 font-medium"
                              onClick={() => handleMarkResponded(item)}
                            >
                              Ada Respon
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs bg-amber-600 hover:bg-amber-700 text-white h-8 flex items-center gap-1"
                              onClick={() => setActiveWaModal({
                                purchaseId: item.purchaseId,
                                customer: {
                                  id: item.customerId,
                                  nama: item.customerName,
                                  nomor_telp: item.nomorTelp,
                                  jenis_mobil: item.jenisMobil,
                                  tanggal_pembelian: item.tanggalPembelian,
                                },
                                milestone: item.milestone,
                                tahap: 2,
                              })}
                            >
                              <MessageCircle size={14} />
                              Kirim WA 2
                            </Button>
                          </>
                        )}

                        {item.followupState === 'followup_2' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-green-700 border-green-300 hover:bg-green-50 h-8 font-medium"
                              onClick={() => handleMarkResponded(item)}
                            >
                              Ada Respon
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 flex items-center gap-1 border-gray-300"
                              onClick={() => setActiveWaModal({
                                purchaseId: item.purchaseId,
                                customer: {
                                  id: item.customerId,
                                  nama: item.customerName,
                                  nomor_telp: item.nomorTelp,
                                  jenis_mobil: item.jenisMobil,
                                  tanggal_pembelian: item.tanggalPembelian,
                                },
                                milestone: item.milestone,
                                tahap: 2,
                              })}
                            >
                              <MessageCircle size={14} />
                              WA 2 Lagi
                            </Button>
                          </>
                        )}

                        {item.followupState === 'responded' && (
                          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                            ✓ Selesai
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeWaModal && (
        <WAModal
          customer={activeWaModal.customer}
          vehiclePurchaseId={activeWaModal.purchaseId}
          milestone={activeWaModal.milestone}
          tahap={activeWaModal.tahap}
          onClose={() => {
            setActiveWaModal(null)
            fetchDashboardData()
          }}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
