'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldAlert, Phone, User, Briefcase } from 'lucide-react'
import { VehicleList } from '@/components/vehicle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CustomerWithVehicles } from '@/lib/types'
import { getWarrantyStatus } from '@/lib/utils'

interface CustomerDetailClientProps {
  customerId: string
  initialData?: CustomerWithVehicles | null
  isSuperAdmin: boolean
  currentUserId: string
}

export function CustomerDetailClient({ 
  customerId, 
  initialData,
  isSuperAdmin,
  currentUserId 
}: CustomerDetailClientProps) {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerWithVehicles | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomer = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const res = await fetch(`/api/customer-profiles/${customerId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch customer data')
      }
      
      const data = await res.json()
      setCustomer(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load customer')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!initialData) {
      fetchCustomer()
    }
  }, [customerId])

  const handleDelete = async () => {
    if (!confirm('Hapus customer ini? Semua kendaraan dan riwayat pembelian akan ikut terhapus.')) {
      return
    }

    try {
      const res = await fetch(`/api/customer-profiles/${customerId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete customer')
      }

      router.push('/customers')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data customer...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Customer tidak ditemukan'}</p>
          <Link href="/customers" className="text-blue-600 hover:underline mt-4 inline-block">
            Kembali ke Database Customer
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/customers" 
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft size={16} />
          Kembali ke Database Customer
        </Link>
        
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.nama}</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-gray-600 flex items-center gap-1">
                <Phone size={14} />
                {customer.nomor_telp}
              </p>
              {customer.is_agen && (
                <Badge variant="outline" className="gap-1">
                  <Briefcase size={12} />
                  Agen
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {isSuperAdmin && (
              <Button variant="destructive" onClick={handleDelete} size="sm">
                Hapus Customer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={18} />
            Informasi Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="font-medium">{customer.nama}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nomor Telepon</p>
              <p className="font-medium">{customer.nomor_telp}</p>
            </div>
          </div>
          
          {customer.is_agen && customer.detail_agen && (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">Detail Agen</p>
              <p className="text-sm mt-1">{customer.detail_agen}</p>
            </div>
          )}
          
          {customer.catatan_umum && (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">Catatan Umum</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{customer.catatan_umum}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ringkasan Kendaraan & Aki */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase size={18} />
            Ringkasan Kendaraan & Aki
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!customer.vehicles || customer.vehicles.length === 0) ? (
            <p className="text-sm text-gray-500">Belum ada data kendaraan terdaftar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.vehicles.map((vehicle) => {
                const latestPurchase = vehicle.purchases && vehicle.purchases.length > 0
                  ? [...vehicle.purchases].sort((a, b) => new Date(b.tanggal_pembelian).getTime() - new Date(a.tanggal_pembelian).getTime())[0]
                  : null;
                const warrantyStatus = latestPurchase
                  ? getWarrantyStatus(latestPurchase.tanggal_pembelian, latestPurchase.durasi_garansi_bulan)
                  : null
                  
                return (
                  <div key={vehicle.id} className="border border-gray-150 rounded-xl p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{vehicle.jenis_mobil}</p>
                        {vehicle.plat_nomor && (
                          <p className="text-xs font-mono font-medium text-gray-500 bg-gray-200/60 rounded px-1.5 py-0.5 inline-block mt-1">
                            {vehicle.plat_nomor}
                          </p>
                        )}
                      </div>
                      {latestPurchase && (
                        <Badge 
                          variant={warrantyStatus === 'valid' ? 'default' : 'destructive'} 
                          className={
                            warrantyStatus === 'valid'
                              ? 'bg-green-100 text-green-700 text-xs hover:bg-green-100'
                              : 'bg-red-100 text-red-700 text-xs hover:bg-red-100'
                          }
                        >
                          {warrantyStatus === 'valid' ? 'VALID' : 'EXPIRED'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      {latestPurchase ? (
                        <>
                          <p><span className="font-medium text-gray-800">Aki Terpasang:</span> {latestPurchase.merek_aki} {latestPurchase.tipe_aki}</p>
                          <p><span className="font-medium text-gray-800">Tanggal Beli:</span> {new Date(latestPurchase.tanggal_pembelian).toLocaleDateString('id-ID')} {latestPurchase.branches ? `(${latestPurchase.branches.nama_cabang})` : ''}</p>
                          <p><span className="font-medium text-gray-800">Tukar Tambah:</span> {latestPurchase.tukar_tambah ? 'Ya' : 'Tidak'}</p>
                        </>
                      ) : (
                        <p className="text-gray-400 italic">Belum ada pembelian aki untuk kendaraan ini</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles & Purchases */}
      <VehicleList
        customerId={customer.id}
        vehicles={customer.vehicles || []}
        onRefresh={fetchCustomer}
      />

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Kendaraan</p>
            <p className="text-2xl font-bold mt-1">{customer.vehicles?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Pembelian Aki</p>
            <p className="text-2xl font-bold mt-1">
              {customer.vehicles?.reduce((sum, v) => sum + (v.purchases?.length || 0), 0) || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Garansi Valid</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {customer.vehicles?.reduce((sum, v) => 
                sum + (v.purchases?.filter((p: any) =>
                  getWarrantyStatus(p.tanggal_pembelian, p.durasi_garansi_bulan) === 'valid'
                ).length || 0), 0
              ) || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
