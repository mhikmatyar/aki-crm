'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import WAModal from './WAModal'
import type { Customer } from '@/lib/types'

interface WAButtonClientProps {
  customer: Customer
  currentUserId: string
  currentCabang: string | null
}

export default function WAButtonClient({ customer, currentUserId, currentCabang }: WAButtonClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors"
      >
        <MessageCircle size={16} />
        Kirim WA
      </button>
      {open && (
        <WAModal
          customer={customer}
          onClose={() => setOpen(false)}
          currentUserId={currentUserId}
          currentCabang={currentCabang}
        />
      )}
    </>
  )
}
