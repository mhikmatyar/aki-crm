import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewCustomerPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={16} />
          Kembali ke Database Customer
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Customer Baru</h1>
        <p className="text-gray-500 text-sm mt-1">
          Buat customer, kendaraan pertama, dan pembelian aki pertama dalam satu alur.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CustomerForm userId={user.id} />
      </div>
    </div>
  )
}
