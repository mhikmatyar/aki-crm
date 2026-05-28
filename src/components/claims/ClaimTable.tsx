'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Claim, KONDISI_KLAIM_LABELS } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ClaimTableProps {
  claims: Claim[]
  isSuperAdmin?: boolean
}

export default function ClaimTable({ claims, isSuperAdmin }: ClaimTableProps) {
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
              {isSuperAdmin && (
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cabang</th>
              )}
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Posisi Aki</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Kondisi</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Tgl Klaim</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims.map((claim, idx) => (
              <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
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
                <td className="px-4 py-3 text-gray-700">
                  {claim.customers?.jenis_mobil || '-'}
                </td>
                {isSuperAdmin && (
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {(claim.customers as any)?.branches?.nama_cabang || '-'}
                  </td>
                )}
                <td className="px-4 py-3 text-gray-700">{claim.posisi_aki}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      claim.kondisi_klaim === 'A'
                        ? 'info'
                        : claim.kondisi_klaim === 'B'
                        ? 'warning'
                        : claim.kondisi_klaim === 'C'
                        ? 'success'
                        : 'danger'
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
                  <div className="flex items-center justify-end">
                    <Link
                      href={`/claims/${claim.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Detail Klaim"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
