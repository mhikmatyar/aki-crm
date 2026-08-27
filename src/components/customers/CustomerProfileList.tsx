'use client'

import Link from 'next/link'
import { Eye, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { customerHref } from '@/lib/customer-code'
import { getWarrantyStatus } from '@/lib/utils'

interface Purchase {
  id: string
  merek_aki: string
  tipe_aki: string
  harga_beli: number
  tanggal_pembelian: string
  durasi_garansi_bulan: number
  status_garansi: string
  tukar_tambah: boolean
  lokasi_cabang?: string | null
}

interface CustomerProfile {
  id: string
  kode_customer?: string | null
  nama: string
  nomor_telp: string
  is_agen: boolean
  catatan_umum?: string
  created_at: string
  vehicles?: Array<{
    id: string
    plat_nomor?: string
    jenis_mobil: string
    vehicle_purchases?: Purchase[]
  }>
}

interface CustomerProfileListProps {
  customers: CustomerProfile[]
}

function getAgeMonths(date: string) {
  const now = new Date()
  const purchaseDate = new Date(date)

  return (
    (now.getFullYear() - purchaseDate.getFullYear()) * 12 +
    (now.getMonth() - purchaseDate.getMonth())
  )
}

function getAgeDays(date: string) {
  const now = new Date()
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const d2 = new Date(date)
  const pDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
  const diffTime = d1.getTime() - pDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 ? diffDays : 0
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function getLatestPurchase(customer: CustomerProfile) {
  const purchases = customer.vehicles?.flatMap((vehicle) =>
    (vehicle.vehicle_purchases || []).map((purchase) => ({
      ...purchase,
      vehicle,
    }))
  ) || []

  return purchases.sort(
    (a, b) =>
      new Date(b.tanggal_pembelian).getTime() -
      new Date(a.tanggal_pembelian).getTime()
  )[0]
}

export default function CustomerProfileList({ customers }: CustomerProfileListProps) {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">Belum ada customer</p>
        <p className="text-sm text-gray-400">
          Klik tombol "Tambah Customer" untuk menambahkan customer pertama
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Kontak</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Kendaraan</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Pembelian Terbaru</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Usia</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Garansi</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => {
              const href = customerHref(customer)
              const vehicleCount = customer.vehicles?.length || 0
              const totalPurchases = customer.vehicles?.reduce(
                (sum, vehicle) => sum + (vehicle.vehicle_purchases?.length || 0),
                0
              ) || 0
              const latestPurchase = getLatestPurchase(customer)
              const warrantyStatus = latestPurchase
                ? getWarrantyStatus(
                    latestPurchase.tanggal_pembelian,
                    latestPurchase.durasi_garansi_bulan
                  )
                : null

              return (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={href}
                      className="font-medium text-gray-900 hover:text-red-600 flex items-center gap-2"
                    >
                      {customer.nama}
                      {customer.kode_customer && (
                        <Badge variant="outline" className="text-xs">
                          {customer.kode_customer}
                        </Badge>
                      )}
                      {customer.is_agen && (
                        <Badge variant="secondary" className="text-xs">
                          Agen
                        </Badge>
                      )}
                    </Link>
                    {customer.catatan_umum && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {customer.catatan_umum}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{customer.nomor_telp}</p>
                  </td>
                  <td className="px-4 py-3">
                    {vehicleCount > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-700 font-medium">{vehicleCount} kendaraan</span>
                        {customer.vehicles?.[0] && (
                          <span className="text-xs text-gray-400">
                            {customer.vehicles[0].jenis_mobil}
                            {customer.vehicles[0].plat_nomor && ` - ${customer.vehicles[0].plat_nomor}`}
                            {vehicleCount > 1 && ` +${vehicleCount - 1} lainnya`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Belum ada</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {latestPurchase ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-700 font-medium">
                          {latestPurchase.merek_aki} {latestPurchase.tipe_aki}
                        </span>
                        <span className="text-xs text-gray-400">
                          {latestPurchase.vehicle?.jenis_mobil} - {formatCurrency(latestPurchase.harga_beli)}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                            {latestPurchase.tukar_tambah ? 'Tukar Tambah' : 'Non-TT'}
                          </Badge>
                          {latestPurchase.lokasi_cabang && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                              📍 {latestPurchase.lokasi_cabang}
                            </span>
                          )}
                        </div>
                        {totalPurchases > 1 && (
                          <span className="text-xs text-gray-400 mt-0.5">
                            Total {totalPurchases} pembelian
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Belum ada</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {latestPurchase ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-700">
                          {getAgeDays(latestPurchase.tanggal_pembelian)} hari
                        </span>
                        <span className="text-xs text-gray-400">
                          {getAgeMonths(latestPurchase.tanggal_pembelian)} bln ({new Date(latestPurchase.tanggal_pembelian).toLocaleDateString('id-ID')})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {latestPurchase ? (
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={warrantyStatus === 'valid' ? 'default' : 'destructive'}
                          className={
                            warrantyStatus === 'valid'
                              ? 'bg-green-100 text-green-700 text-xs'
                              : 'bg-red-100 text-red-700 text-xs'
                          }
                        >
                          {warrantyStatus === 'valid' ? 'VALID' : 'EXPIRED'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {latestPurchase.durasi_garansi_bulan} bulan
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={href}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
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
