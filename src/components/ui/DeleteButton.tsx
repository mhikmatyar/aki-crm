'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteButtonProps {
  table: 'customers' | 'claims'
  id: string
  redirectTo: string
  label?: string
}

export default function DeleteButton({ table, id, redirectTo, label }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from(table).delete().eq('id', id)
    router.push(redirectTo)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600 font-medium">Yakin hapus?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Menghapus...' : 'Ya, Hapus'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
    >
      <Trash2 size={16} />
      {label || 'Hapus'}
    </button>
  )
}
