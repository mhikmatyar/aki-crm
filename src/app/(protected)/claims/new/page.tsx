import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ClaimForm from '@/components/claims/ClaimForm'

export default async function NewClaimPage({
  searchParams,
}: {
  searchParams: { customerId?: string }
}) {
  if (!searchParams.customerId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', searchParams.customerId)
    .single()

  if (!customer) notFound()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/customers/${customer.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={16} />
          Kembali ke Detail Customer
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Buat Klaim Baru</h1>
        <p className="text-gray-500 text-sm mt-1">Form klaim untuk {customer.nama}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ClaimForm customer={customer} userId={user.id} />
      </div>
    </div>
  )
}
