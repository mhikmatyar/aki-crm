import { createClient } from '@/lib/supabase/server'
import { Users, ShieldAlert, Bell, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, cabang_id')
    .eq('id', user!.id)
    .single()

  const today = new Date()

  const [
    { count: totalCustomers },
    { count: activeClaims },
    { data: customers },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
    supabase.from('customers').select('tanggal_pembelian, reminder_bulan, nama, jenis_mobil, id'),
  ])

  const reminderDue = (customers || []).filter((c) => {
    const purchaseDate = new Date(c.tanggal_pembelian)
    const reminderDate = new Date(purchaseDate)
    reminderDate.setMonth(reminderDate.getMonth() + c.reminder_bulan)
    return today > reminderDate
  })

  const stats = [
    {
      label: 'Total Customer',
      value: totalCustomers ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      href: '/customers',
    },
    {
      label: 'Reminder Jatuh Tempo',
      value: reminderDue.length,
      icon: Bell,
      color: 'bg-amber-500',
      href: '/customers?filter=overdue',
    },
    {
      label: 'Klaim Aktif',
      value: activeClaims ?? 0,
      icon: ShieldAlert,
      color: 'bg-red-500',
      href: '/claims?status=aktif',
    },
    {
      label: 'Bulan Ini',
      value: (customers || []).filter((c) => {
        const d = new Date(c.tanggal_pembelian)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/customers',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan data {profile?.role === 'super_admin' ? 'semua cabang' : 'cabang Anda'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {reminderDue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Customer yang Perlu Difollow Up</h2>
            <Link href="/customers?filter=overdue" className="text-sm text-blue-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {reminderDue.slice(0, 5).map((c) => {
              const purchaseDate = new Date(c.tanggal_pembelian)
              const reminderDate = new Date(purchaseDate)
              reminderDate.setMonth(reminderDate.getMonth() + c.reminder_bulan)
              const daysOverdue = Math.floor((today.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.nama}</p>
                    <p className="text-xs text-gray-500">{c.jenis_mobil} · Beli {formatDate(c.tanggal_pembelian)}</p>
                  </div>
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    +{daysOverdue} hari
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
