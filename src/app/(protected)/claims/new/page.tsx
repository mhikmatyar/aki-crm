import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ClaimForm from '@/components/claims/ClaimForm'
import { applyCustomerLookup } from '@/lib/customer-code'

export const dynamic = 'force-dynamic'

export default async function NewClaimPage({
  searchParams,
}: {
  searchParams: { customerId?: string; purchaseId?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('customer_profiles')
    .select(`
      *,
      vehicles (
        *,
        vehicle_purchases (
          *,
          branches:lokasi_cabang (
            id,
            nama_cabang,
            kota
          )
        )
      )
    `)
    .order('nama', { ascending: true })

  if (searchParams.customerId) {
    query = applyCustomerLookup(query, searchParams.customerId)
  }

  const { data: customers } = await query

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href={searchParams.customerId ? `/customers/${searchParams.customerId}` : '/claims'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={16} />
          {searchParams.customerId ? 'Kembali ke Detail Customer' : 'Kembali ke Database Klaim'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Buat Klaim Baru</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pilih pembelian aki yang ingin diklaim, lalu isi kondisi klaimnya.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ClaimForm
          customers={customers || []}
          userId={user.id}
          initialPurchaseId={searchParams.purchaseId}
        />
      </div>
    </div>
  )
}
