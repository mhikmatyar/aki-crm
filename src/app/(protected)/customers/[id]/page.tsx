import { createClient } from '@/lib/supabase/server'
import { CustomerDetailClient } from '@/components/customers/CustomerDetailClient'
import { redirect } from 'next/navigation'
import { applyCustomerLookup } from '@/lib/customer-code'
import type { CustomerWithVehicles } from '@/lib/types'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Role dan data customer diambil bersamaan, dan data customer (profil +
  // kendaraan + pembelian) cukup satu query bertingkat. Sebelumnya halaman
  // render dulu, lalu browser memanggil API yang menjalankan 3 query berurutan.
  const [{ data: profile }, { data: customerRow, error: customerError }] = await Promise.all([
    supabase.from('user_profiles').select('role').eq('id', user.id).single(),
    applyCustomerLookup(
      supabase
        .from('customer_profiles')
        .select('*, vehicles(*, vehicle_purchases(*))'),
      params.id
    ).maybeSingle(),
  ])

  if (customerError) {
    console.error('Error fetching customer detail:', customerError)
  }

  const isSuperAdmin = ['super_admin', 'owner'].includes(profile?.role)

  // Samakan bentuk data dengan GET /api/customer-profiles/[id]:
  // kendaraan terbaru dulu, pembelian per kendaraan terbaru dulu, key `purchases`.
  let initialData: CustomerWithVehicles | null = null
  if (customerRow) {
    const { vehicles = [], ...customerFields } = customerRow as any
    initialData = {
      ...customerFields,
      vehicles: [...vehicles]
        .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
        .map(({ vehicle_purchases = [], ...vehicle }: any) => ({
          ...vehicle,
          purchases: [...vehicle_purchases].sort((a: any, b: any) =>
            String(b.tanggal_pembelian).localeCompare(String(a.tanggal_pembelian))
          ),
        })),
    } as CustomerWithVehicles
  }

  return (
    <CustomerDetailClient
      customerId={params.id}
      initialData={initialData}
      isSuperAdmin={isSuperAdmin}
      currentUserId={user.id}
    />
  )
}
