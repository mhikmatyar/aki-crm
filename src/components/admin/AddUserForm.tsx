'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Branch } from '@/lib/types'

interface AddUserFormProps {
  branches: Branch[]
}

export default function AddUserForm({ branches }: AddUserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin',
    cabang_id: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (form.role === 'admin' && !form.cabang_id) {
      setError('Admin harus memiliki cabang.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          password: form.password,
          role: form.role,
          cabang_id: form.role === 'super_admin' ? null : form.cabang_id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal membuat user.')
      } else {
        setSuccess(`User ${form.nama} berhasil dibuat.`)
        setForm({ nama: '', email: '', password: '', role: 'admin', cabang_id: '' })
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2.5">
          {success}
        </div>
      )}

      <div>
        <label className={labelClass}>
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nama"
          value={form.nama}
          onChange={handleChange}
          required
          placeholder="Nama admin"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="admin@tokaki.com"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          placeholder="Min 8 karakter"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Role <span className="text-red-500">*</span>
        </label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
          className={fieldClass}
        >
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {form.role === 'admin' && (
        <div>
          <label className={labelClass}>
            Cabang <span className="text-red-500">*</span>
          </label>
          <select
            name="cabang_id"
            value={form.cabang_id}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            <option value="">Pilih cabang...</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama_cabang} — {b.kota}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
      >
        {loading ? 'Membuat user...' : 'Buat User'}
      </button>
    </form>
  )
}
