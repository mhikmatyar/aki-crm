import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
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
    .select('*, branches(*)')
    .eq('id', user.id)
    .single()

  const userProfile = {
    id: user.id,
    email: user.email || '',
    role: (profile?.role as 'super_admin' | 'admin') || 'admin',
    cabang_id: profile?.cabang_id || null,
    nama: profile?.nama || '',
    aktif: profile?.aktif ?? true,
    branches: profile?.branches || undefined,
  }

  return (
    <LayoutClient userProfile={userProfile}>
      {children}
    </LayoutClient>
  )
}
