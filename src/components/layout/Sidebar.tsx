'use client'

import { useState } from 'react'
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
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  userEmail?: string
  userName?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ role, userEmail, userName, isCollapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = controlledCollapsed ?? internalCollapsed

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 bg-[#1a1f2e] flex flex-col transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo Section */}
      <div className={cn(
        'flex flex-col items-center py-4 transition-all duration-300',
        isCollapsed ? 'px-2' : 'px-4'
      )}>
        <div className={cn(
          'bg-white flex items-center justify-center transition-all duration-300',
          isCollapsed ? 'w-12 h-12 p-2 rounded-xl mb-3' : 'w-full p-3 rounded-2xl mb-2'
        )}>
          <img 
            src={isCollapsed ? "/logo-login.png" : "/logo-app.png"}
            alt="Pusat Aki" 
            className={cn('h-auto object-contain', isCollapsed ? 'w-8' : 'w-full max-h-16')}
          />
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => onToggle ? onToggle() : setInternalCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Buka menu' : 'Sembunyikan menu'}
        className="absolute -right-4 top-7 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className={cn('flex-1 py-2 space-y-1 overflow-y-auto', isCollapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all',
                isCollapsed ? 'justify-center px-0' : 'px-4',
                isActive
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              )}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="shrink-0" size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {role === 'super_admin' && (
          <>
            {!isCollapsed && (
              <div className="pt-6 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
              </div>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all',
                    isCollapsed ? 'justify-center px-0' : 'px-4',
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  )}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="shrink-0" size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className={cn('py-4 border-t border-gray-700/50', isCollapsed ? 'px-2' : 'px-3')}>
        {!isCollapsed && userName && (
          <div className="px-4 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-gray-400 text-xs truncate">{role === 'super_admin' ? 'Admin' : 'User'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn('flex items-center gap-3 w-full py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all', isCollapsed ? 'justify-center px-0' : 'px-4')}
          title={isCollapsed ? 'Keluar' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  )
}
