'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Claim, KONDISI_KLAIM_LABELS } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ClaimTableProps {
  claims: Claim[]
  isSuperAdmin?: boolean
}

export default function ClaimTable({ claims, isSuperAdmin }: ClaimTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.from('claims').delete().eq('id', id)
    setDeletingId(null)
    setDeleteLoading(false)
    router.refresh()
  }

  if (claims.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Tidak ada data klaim ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Kendaraan</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Posisi Aki</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Kondisi</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Tgl Klaim</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims.map((claim, idx) => {
              const isDeleting = deletingId === claim.id
              return (
                <tr key={claim.id} className={`transition-colors ${isDeleting ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${claim.customer_id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {claim.customers?.nama || '-'}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{claim.customers?.nomor_telp || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{claim.customers?.jenis_mobil || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{claim.posisi_aki}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        claim.kondisi_klaim === 'A' ? 'info' :
                        claim.kondisi_klaim === 'B' ? 'warning' :
                        claim.kondisi_klaim === 'C' ? 'success' : 'danger'
                      }
                    >
                      {KONDISI_KLAIM_LABELS[claim.kondisi_klaim]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(claim.tanggal_klaim)}</td>
                  <td className="px-4 py-3">
                    {claim.status === 'done' ? (
                      <Badge variant="success">Selesai</Badge>
                    ) : (
                      <Badge variant="warning">Aktif</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isDeleting ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-600 font-medium">Hapus?</span>
                        <button
                          onClick={() => handleDelete(claim.id)}
                          disabled={deleteLoading}
                          className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleteLoading ? '...' : 'Ya'}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/claims/${claim.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Detail Klaim"
                        >
                          <Eye size={16} />
                        </Link>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setDeletingId(claim.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Klaim"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
