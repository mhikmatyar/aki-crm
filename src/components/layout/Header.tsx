'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Menu } from 'lucide-react'
import { UserProfile } from '@/lib/types'

interface HeaderProps {
  user: UserProfile
  onMenuClick?: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-3">
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900 leading-none">{user.nama || 'Admin'}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-semibold text-xs uppercase">
            {user.nama?.charAt(0) || user.email?.charAt(0) || 'A'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
