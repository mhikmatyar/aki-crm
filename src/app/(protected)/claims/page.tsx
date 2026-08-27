import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ClaimTable from '@/components/claims/ClaimTable'

interface PageProps {
  searchParams: { status?: string }
}

export const dynamic = 'force-dynamic'

export default async function ClaimsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  let query = supabase
    .from('claims')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: claims } = await query

  // Manual resolution of related data to bypass PostgREST relationship cache lag
  let purchasesMap: Record<string, any> = {}
  let profilesMap: Record<string, any> = {}
  let oldCustomersMap: Record<string, any> = {}

  const purchaseIds = (claims || [])
    .map((c: any) => c.vehicle_purchase_id)
    .filter(Boolean)
  const profileIds = (claims || [])
    .map((c: any) => c.customer_profile_id)
    .filter(Boolean)
  const oldCustomerIds = (claims || [])
    .map((c: any) => c.customer_id)
    .filter(Boolean)

  if (purchaseIds.length > 0) {
    const { data: purchases } = await supabase
      .from('vehicle_purchases')
      .select('*, vehicles(*)')
      .in('id', purchaseIds)
    
    purchases?.forEach((p: any) => {
      purchasesMap[p.id] = p
    })
  }

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from('customer_profiles')
      .select('*')
      .in('id', profileIds)

    profiles?.forEach((profile: any) => {
      profilesMap[profile.id] = profile
    })
  }

  if (oldCustomerIds.length > 0) {
    const { data: oldCustomers } = await supabase
      .from('customers')
      .select('*')
      .in('id', oldCustomerIds)

    oldCustomers?.forEach((customer: any) => {
      oldCustomersMap[customer.id] = customer
    })
  }

  const combinedClaims = (claims || []).map((claim: any) => ({
    ...claim,
    customer_profiles: claim.customer_profile_id ? profilesMap[claim.customer_profile_id] : null,
    customers: claim.customer_id ? oldCustomersMap[claim.customer_id] : null,
    vehicle_purchases: claim.vehicle_purchase_id ? purchasesMap[claim.vehicle_purchase_id] : null
  }))

  const statuses = [
    { value: 'all', label: 'Semua' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'done', label: 'Selesai' },
  ]

  const activeCount = combinedClaims.filter((c) => c.status === 'aktif').length
  const doneCount = combinedClaims.filter((c) => c.status === 'done').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Klaim</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} aktif · {doneCount} selesai
          </p>
        </div>
        <Link
          href="/claims/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Buat Klaim
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={`/claims?status=${s.value}`}
              className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                (searchParams.status || 'all') === s.value
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <ClaimTable claims={combinedClaims} isSuperAdmin={isSuperAdmin} />
    </div>
  )
}
