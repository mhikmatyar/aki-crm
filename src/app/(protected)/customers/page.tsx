import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import CustomerTable from '@/components/customers/CustomerTable'
import { isReminderOverdue } from '@/lib/utils'

interface PageProps {
  searchParams: { duration?: string; search?: string; filter?: string }
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('tanggal_pembelian', { ascending: true })

  let filtered = customers || []

  if (searchParams.search) {
    const q = searchParams.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.nama.toLowerCase().includes(q) ||
        c.nomor_telp.includes(q) ||
        c.jenis_mobil.toLowerCase().includes(q)
    )
  }

  if (searchParams.duration && searchParams.duration !== 'all') {
    const months = parseInt(searchParams.duration)
    filtered = filtered.filter((c) => {
      const durasi = Math.floor(
        (new Date().getTime() - new Date(c.tanggal_pembelian).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      return durasi >= months
    })
  }

  if (searchParams.filter === 'overdue') {
    filtered = filtered.filter((c) => isReminderOverdue(c.tanggal_pembelian, c.reminder_bulan))
  }

  const durations = ['all', '3', '6', '12', '18', '24']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Customer</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} customer ditemukan</p>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Tambah Customer
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              name="search"
              defaultValue={searchParams.search}
              placeholder="Cari nama, nomor telp, kendaraan..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>

          <div className="flex gap-2 flex-wrap">
            {durations.map((d) => (
              <Link
                key={d}
                href={`/customers?duration=${d}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                  (searchParams.duration || 'all') === d
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {d === 'all' ? 'Semua' : `${d} bln`}
              </Link>
            ))}
            <Link
              href={`/customers?filter=overdue${searchParams.duration ? `&duration=${searchParams.duration}` : ''}`}
              className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                searchParams.filter === 'overdue'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'
              }`}
            >
              Overdue
            </Link>
          </div>
        </div>
      </div>

      <CustomerTable
        customers={filtered}
        currentUserId={user!.id}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  )
}
