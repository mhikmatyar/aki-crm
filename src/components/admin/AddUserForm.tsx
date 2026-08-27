'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function AddUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal membuat user.')
      } else {
        setSuccess(`User ${form.nama} berhasil dibuat.`)
        setForm({ nama: '', email: '', password: '', role: 'admin' })
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
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Min 8 karakter"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            className={`${fieldClass} pr-10`}
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
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
          <option value="admin">Admin — input & edit</option>
          <option value="super_admin">Super Admin — input, edit & hapus</option>
        </select>
      </div>

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
