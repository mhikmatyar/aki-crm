import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddUserForm from '@/components/admin/AddUserForm'
import UserManagementClient from '@/components/admin/UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, email, nama, role, aktif, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users?.length || 0} user terdaftar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Tambah User Baru</h2>
            <p className="text-xs text-gray-400 mb-4">
              Admin hanya bisa input &amp; edit data. Super Admin bisa input, edit, dan hapus data.
            </p>
            <AddUserForm />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <UserManagementClient users={users || []} currentUserId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
