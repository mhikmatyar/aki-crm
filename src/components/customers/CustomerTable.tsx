'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, ShieldAlert, Eye, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, getReminderStatus } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/lib/types'
import WAModal from './WAModal'

interface CustomerTableProps {
  customers: Customer[]
  currentUserId: string
  isSuperAdmin: boolean
}

type SortKey = 'nama' | 'tanggal_pembelian' | 'reminder_bulan'
type SortDir = 'asc' | 'desc'

export default function CustomerTable({ customers, currentUserId, isSuperAdmin }: CustomerTableProps) {
  const router = useRouter()
  const [waCustomer, setWaCustomer] = useState<Customer | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('tanggal_pembelian')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.from('customers').delete().eq('id', id)
    setDeletingId(null)
    setDeleteLoading(false)
    router.refresh()
  }

  const sorted = [...customers].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'nama') cmp = a.nama.localeCompare(b.nama)
    else if (sortKey === 'tanggal_pembelian') cmp = a.tanggal_pembelian.localeCompare(b.tanggal_pembelian)
    else if (sortKey === 'reminder_bulan') cmp = a.reminder_bulan - b.reminder_bulan
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
  }

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Tidak ada data customer ditemukan.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  <button className="flex items-center gap-1" onClick={() => handleSort('nama')}>
                    Nama Customer <SortIcon col="nama" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kendaraan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Item Aki</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Harga Beli</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  <button className="flex items-center gap-1" onClick={() => handleSort('tanggal_pembelian')}>
                    Tgl Pembelian <SortIcon col="tanggal_pembelian" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Klaim</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((customer) => {
                const reminder = getReminderStatus(customer.tanggal_pembelian, customer.reminder_bulan)
                const isDeleting = deletingId === customer.id

                return (
                  <tr key={customer.id} className={`transition-colors ${isDeleting ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {customer.nama}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{customer.nomor_telp}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{customer.jenis_mobil}</td>
                    <td className="px-4 py-3 text-gray-700">{customer.item_dibeli}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(customer.harga_beli)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(customer.tanggal_pembelian)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        reminder.color === 'red' ? 'bg-red-100 text-red-700' :
                        reminder.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {reminder.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {customer.pernah_claim ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Pernah Klaim
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isDeleting ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-red-600 font-medium">Hapus data ini?</span>
                          <button
                            onClick={() => handleDelete(customer.id)}
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
                            href={`/customers/${customer.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => setWaCustomer(customer)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Kirim WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <Link
                            href={`/claims/new?customerId=${customer.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            title="Buat Klaim"
                          >
                            <ShieldAlert size={16} />
                          </Link>
                          {isSuperAdmin && (
                            <button
                              onClick={() => setDeletingId(customer.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Customer"
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

      {waCustomer && (
        <WAModal
          customer={waCustomer}
          onClose={() => setWaCustomer(null)}
          currentUserId={currentUserId}
        />
      )}
    </>
  )
}
