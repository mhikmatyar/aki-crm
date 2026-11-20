import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import CustomerProfileList from '@/components/customers/CustomerProfileList'
import ExportExcelButton from '@/components/customers/ExportExcelButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { search?: string; age?: string; sort?: string; page?: string }
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = user
    ? await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    : { data: null }
  const canExport = ['super_admin', 'owner'].includes(currentProfile?.role)

  const parsedPage = parseInt(searchParams.page || '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const pageSize = 20

  const searchTerm = (searchParams.search || '').trim()
  const ageFilter = searchParams.age || 'all'
  const sort = searchParams.sort || 'newest'

  // Search, filter usia, sort, dan pagination dikerjakan di database
  // (lihat migration 009 → search_customer_page). Halaman ini hanya
  // menerima 20 ID untuk halaman aktif + total hasil.
  let customers: any[] = []
  let totalCount = 0

  const { data: pageResult, error: searchError } = await supabase.rpc('search_customer_page', {
    p_search: searchTerm || null,
    p_age: ageFilter,
    p_sort: sort,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  })

  if (searchError) {
    console.error('Error searching customers:', searchError)
  }

  const pageIds: string[] = (pageResult as { ids?: string[] } | null)?.ids || []
  totalCount = Number((pageResult as { total?: number } | null)?.total || 0)

  if (pageIds.length > 0) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select(`
        *,
        vehicles (
          *,
          vehicle_purchases (*)
        )
      `)
      .in('id', pageIds)

    if (error) {
      console.error('Error fetching paginated customers:', error)
    }

    // .in() tidak menjamin urutan, kembalikan ke urutan hasil RPC
    const byId = new Map((data || []).map((c: any) => [c.id, c]))
    customers = pageIds.map((id) => byId.get(id)).filter(Boolean)
  }

  const ageFilters = [
    { value: 'all', label: 'Semua' },
    { value: '<3', label: '<3 bln' },
    { value: '3-6', label: '3-6 bln' },
    { value: '6-12', label: '6-12 bln' },
    { value: '12-18', label: '12-18 bln' },
    { value: '>18', label: '>18 bln' },
  ]

  const searchQuery = searchParams.search
    ? `&search=${encodeURIComponent(searchParams.search)}`
    : ''
  const sortQuery = searchParams.sort
    ? `&sort=${encodeURIComponent(searchParams.sort)}`
    : ''

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Customer</h1>
          <p className="text-gray-500 text-sm mt-1">{totalCount} customer ditemukan</p>
        </div>
        <div className="flex items-center gap-2.5">
          {canExport && <ExportExcelButton />}
          <Link
            href="/customers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
          >
            <Plus size={16} />
            Tambah Customer
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="space-y-3">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                name="search"
                defaultValue={searchParams.search}
                placeholder="Cari nama, nomor, plat, mobil, atau aki..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchParams.age && searchParams.age !== 'all' && (
                <input type="hidden" name="age" value={searchParams.age} />
              )}
            </div>

            <select
              name="sort"
              defaultValue={searchParams.sort || 'newest'}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Pembelian terbaru</option>
              <option value="oldest">Pembelian terlama</option>
              <option value="name">Nama A-Z</option>
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Cari
              </button>
              {(searchParams.search || searchParams.age) && (
                <Link
                  href="/customers"
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {ageFilters.map((filter) => (
              <Link
                key={filter.value}
                href={`/customers?age=${encodeURIComponent(filter.value)}${searchQuery}${sortQuery}`}
                className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                  (searchParams.age || 'all') === filter.value
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {searchError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          Gagal memuat data customer. Pastikan migration 009 sudah dijalankan di Supabase.
        </div>
      )}

      <CustomerProfileList
        customers={customers}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentUserId={user?.id || ''}
      />
    </div>
  )
}
