import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import CustomerProfileList from '@/components/customers/CustomerProfileList'

interface PageProps {
  searchParams: { search?: string; age?: string; sort?: string }
}

function getPurchaseAgeMonths(date: string) {
  const now = new Date()
  const purchaseDate = new Date(date)

  return (
    (now.getFullYear() - purchaseDate.getFullYear()) * 12 +
    (now.getMonth() - purchaseDate.getMonth())
  )
}

function matchesAgeFilter(months: number, filter?: string) {
  switch (filter) {
    case '<3':
      return months < 3
    case '3-6':
      return months >= 3 && months < 6
    case '6-12':
      return months >= 6 && months < 12
    case '12-18':
      return months >= 12 && months < 18
    case '>18':
      return months >= 18
    default:
      return true
  }
}

function getLatestPurchaseDate(customer: any) {
  const dates = customer.vehicles?.flatMap((vehicle: any) =>
    (vehicle.vehicle_purchases || []).map((purchase: any) =>
      new Date(purchase.tanggal_pembelian).getTime()
    )
  ) || []

  return dates.length > 0 ? Math.max(...dates) : 0
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customer_profiles')
    .select(`
      *,
      vehicles (
        *,
        vehicle_purchases (*)
      )
    `)
    .order('created_at', { ascending: false })

  let filtered = customers || []

  if (searchParams.search) {
    const q = searchParams.search.toLowerCase()
    filtered = filtered.filter((customer: any) =>
      customer.nama.toLowerCase().includes(q) ||
      customer.nomor_telp.includes(q) ||
      customer.vehicles?.some((vehicle: any) =>
        vehicle.jenis_mobil?.toLowerCase().includes(q) ||
        vehicle.plat_nomor?.toLowerCase().includes(q) ||
        vehicle.vehicle_purchases?.some((purchase: any) =>
          purchase.merek_aki?.toLowerCase().includes(q) ||
          purchase.tipe_aki?.toLowerCase().includes(q)
        )
      )
    )
  }

  if (searchParams.age && searchParams.age !== 'all') {
    filtered = filtered.filter((customer: any) =>
      customer.vehicles?.some((vehicle: any) =>
        vehicle.vehicle_purchases?.some((purchase: any) =>
          matchesAgeFilter(getPurchaseAgeMonths(purchase.tanggal_pembelian), searchParams.age)
        )
      )
    )
  }

  filtered = [...filtered].sort((a: any, b: any) => {
    const latestA = getLatestPurchaseDate(a)
    const latestB = getLatestPurchaseDate(b)

    switch (searchParams.sort) {
      case 'newest':
        return latestB - latestA
      case 'name':
        return a.nama.localeCompare(b.nama)
      case 'oldest':
      default:
        return latestA - latestB
    }
  })

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
              defaultValue={searchParams.sort || 'oldest'}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="oldest">Pembelian terlama</option>
              <option value="newest">Pembelian terbaru</option>
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

      <CustomerProfileList customers={filtered} />
    </div>
  )
}
