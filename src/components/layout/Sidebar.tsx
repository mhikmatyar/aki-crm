'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  MessageSquare,
  UserCog,
  Zap,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Database Customer', icon: Users },
  { href: '/claims', label: 'Database Klaim', icon: ShieldAlert },
  { href: '/wa-logs', label: 'Log WhatsApp', icon: MessageSquare },
]

const adminItems = [
  { href: '/admin/users', label: 'Manajemen User', icon: UserCog },
]

interface SidebarProps {
  role?: string
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col">
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
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {item.label}
            </Link>
          )
        })}

        {role === 'super_admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
