import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddUserForm from '@/components/admin/AddUserForm'
import { formatDate } from '@/lib/utils'

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

  const [{ data: users }, { data: branches }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*, branches(nama_cabang, kota)')
      .order('created_at', { ascending: false }),
    supabase
      .from('branches')
      .select('*')
      .eq('aktif', true)
      .order('nama_cabang'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users?.length || 0} user terdaftar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add user form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Tambah User Baru</h2>
            <AddUserForm branches={branches || []} />
          </div>
        </div>

        {/* Users list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Cabang</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(users || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                      Belum ada user
                    </td>
                  </tr>
                ) : (
                  (users || []).map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.nama}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {(u as any).branches?.nama_cabang || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.aktif
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {u.aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
