'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DoneClaimButtonProps {
  claimId: string
  customerId: string
  userId: string
}

export default function DoneClaimButton({ claimId, customerId, userId }: DoneClaimButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleDone() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      await supabase
        .from('claims')
        .update({
          status: 'done',
          done_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', claimId)

      // The trigger will automatically update pernah_claim on customer
      // But we update it manually here as a fallback
      await supabase
        .from('customers')
        .update({ pernah_claim: true })
        .eq('id', customerId)

      router.refresh()
    } catch (error) {
      console.error('Failed to complete claim:', error)
    } finally {
      setLoading(false)
      setConfirmed(false)
    }
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Yakin selesaikan klaim?</span>
        <button
          onClick={handleDone}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Memproses...' : 'Ya, Selesaikan'}
        </button>
        <button
          onClick={() => setConfirmed(false)}
          className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleDone}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
    >
      <CheckCircle size={16} />
      Done Claim
    </button>
  )
}
