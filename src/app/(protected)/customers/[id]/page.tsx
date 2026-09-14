import { createClient } from '@/lib/supabase/server'
import { CustomerDetailClient } from '@/components/customers/CustomerDetailClient'
import { redirect } from 'next/navigation'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = ['super_admin', 'owner'].includes(profile?.role)

  return (
    <CustomerDetailClient
      customerId={params.id}
      isSuperAdmin={isSuperAdmin}
      currentUserId={user.id}
    />
  )
}
