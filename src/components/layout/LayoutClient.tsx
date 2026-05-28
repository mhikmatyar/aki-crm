'use client'

import { useState } from 'react'
import { Menu, X, LogOut, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { UserProfile } from '@/lib/types'
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  MessageSquare,
  UserCog,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Database Customer', icon: Users },
  { href: '/claims', label: 'Database Klaim', icon: ShieldAlert },
  { href: '/wa-logs', label: 'Log WhatsApp', icon: MessageSquare },
]

const adminNavItems = [
  { href: '/admin/users', label: 'Manajemen User', icon: UserCog },
]

interface LayoutClientProps {
  userProfile: UserProfile
  children: React.ReactNode
}

export default function LayoutClient({ userProfile, children }: LayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive(href)
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      {label}
    </Link>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-500 rounded-lg shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">AKI CRM</p>
          <p className="text-gray-400 text-xs mt-0.5">Toko Aki Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {userProfile.role === 'super_admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
            {adminNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <div className="px-3 pb-3">
          <p className="text-sm font-medium text-white truncate">{userProfile.nama || 'Admin'}</p>
          <p className="text-xs text-gray-400 truncate">
            {userProfile.role === 'super_admin' ? 'Super Admin' : `Admin · ${userProfile.branches?.nama_cabang || 'Cabang'}`}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {userProfile.nama || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {userProfile.role === 'super_admin'
                    ? 'Super Admin'
                    : `Admin · ${userProfile.branches?.nama_cabang || 'Cabang'}`}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs uppercase">
                  {userProfile.nama?.charAt(0) || userProfile.email?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
