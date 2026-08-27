'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { UserProfile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LayoutClientProps {
  userProfile: UserProfile
  children: React.ReactNode
}

export default function LayoutClient({ userProfile, children }: LayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          role={userProfile.role} 
          userName={userProfile.nama} 
          userEmail={userProfile.email}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <Sidebar 
            role={userProfile.role} 
            userName={userProfile.nama} 
            userEmail={userProfile.email}
          />
        </div>
      )}

      {/* Main Content */}
      <div className={cn('min-h-screen flex flex-col transition-all duration-300', sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <Header user={userProfile} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
