import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LayoutClient from '@/components/layout/LayoutClient'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, email, nama, role, aktif')
    .eq('id', user.id)
    .single()

  const userProfile = {
    id: user.id,
    email: user.email || '',
    role: (profile?.role as 'super_admin' | 'admin') || 'admin',
    nama: profile?.nama || '',
    aktif: profile?.aktif ?? true,
  }

  return (
    <LayoutClient userProfile={userProfile}>
      {children}
    </LayoutClient>
  )
}
