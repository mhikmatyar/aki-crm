'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseConfig } from '@/lib/supabase/config'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { isPlaceholder } = getSupabaseConfig()

    if (isPlaceholder) {
      setError('Login tidak bisa dipakai karena konfigurasi Supabase belum diisi. Silakan isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local lalu restart aplikasi.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const errorMessage = error.message?.toLowerCase() ?? ''
      const isUnavailable =
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('socket') ||
        errorMessage.includes('failed to fetch')

      setError(
        isUnavailable
          ? 'Login gagal karena Supabase tidak bisa diakses. Jika project Anda sedang paused, aktifkan kembali di dashboard Supabase lalu coba lagi.'
          : 'Email atau password salah. Silakan coba lagi.'
      )
      setLoading(false)
    } else {
      // Use a full navigation so the middleware receives the freshly written
      // Supabase auth cookies before rendering the protected dashboard.
      window.location.assign('/dashboard')
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Masukkan email terlebih dahulu untuk menerima link reset password.')
      return
    }

    setLoading(true)
    setError(null)
    setResetSent(false)

    const { isPlaceholder } = getSupabaseConfig()
    if (isPlaceholder) {
      setError('Konfigurasi Supabase belum diisi.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logo-login.png" 
                alt="Pusat Aki" 
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PUSAT AKI CRM</h1>
            <p className="text-gray-500 mt-1 text-sm">Masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@tokaki.com"
                autoComplete="username"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className="relative float-right -mt-9 mr-3 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-sm text-red-600 hover:text-red-700 disabled:text-red-300"
            >
              Lupa password?
            </button>

            {resetSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                Link reset password sudah dikirim. Silakan cek email Anda.
              </div>
            )}
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Toko Aki CRM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
