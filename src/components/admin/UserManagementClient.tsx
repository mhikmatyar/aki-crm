'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

type User = { id: string; email: string; nama: string; role: 'admin' | 'super_admin'; aktif: boolean; created_at: string }

export default function UserManagementClient({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function editUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    setLoading(true); setMessage(null)
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/admin/users/${editing.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: form.get('nama'), email: form.get('email'), role: form.get('role'), aktif: form.get('aktif') === 'true', password: form.get('password') }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) { setMessage(data.error || 'Gagal mengubah user.'); return }
    setEditing(null); setMessage('Data user berhasil diubah.'); router.refresh()
  }

  async function deleteUser(user: User) {
    if (user.id === currentUserId || !window.confirm(`Hapus akun ${user.email}?`)) return
    setLoading(true); setMessage(null)
    const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) { setMessage(data.error || 'Gagal menghapus user.'); return }
    setMessage('Akun berhasil dihapus.'); router.refresh()
  }

  return <>
    {message && <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">{message}</div>}
    {editing && <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Edit User</h2>
      <form onSubmit={editUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="nama" defaultValue={editing.nama} required placeholder="Nama lengkap" className="px-3 py-2 border rounded-lg text-sm" />
        <input name="email" type="email" defaultValue={editing.email} required placeholder="Email" className="px-3 py-2 border rounded-lg text-sm" />
        <select name="role" defaultValue={editing.role} className="px-3 py-2 border rounded-lg text-sm"><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select>
        <select name="aktif" defaultValue={String(editing.aktif)} className="px-3 py-2 border rounded-lg text-sm"><option value="true">Aktif</option><option value="false">Nonaktif</option></select>
        <div className="relative"><input name="password" type={showPassword ? 'text' : 'password'} minLength={8} placeholder="Password baru (opsional)" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="w-full px-3 py-2 pr-10 border rounded-lg text-sm" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <div className="flex gap-2"><button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Simpan</button><button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">Batal</button></div>
      </form>
    </div>}
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b"><th className="text-left px-4 py-3">Nama</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Aksi</th></tr></thead>
      <tbody className="divide-y">{users.map(user => <tr key={user.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{user.nama}</td><td className="px-4 py-3 text-gray-600">{user.email}</td><td className="px-4 py-3">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</td><td className="px-4 py-3">{user.aktif ? 'Aktif' : 'Nonaktif'}</td><td className="px-4 py-3"><button onClick={() => setEditing(user)} className="text-blue-600 mr-3">Edit</button>{user.id !== currentUserId && <button disabled={loading} onClick={() => deleteUser(user)} className="text-red-600">Hapus</button>}</td></tr>)}</tbody></table>
    </div>
  </>
}
