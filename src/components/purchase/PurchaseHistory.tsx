'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PurchaseForm } from './PurchaseForm'
import type { VehiclePurchase, VehiclePurchaseFormData } from '@/lib/types'
import { getWarrantyStatus } from '@/lib/utils'

interface PurchaseHistoryProps {
  vehicleId: string
  purchases: VehiclePurchase[]
  onRefresh: () => void
}

export function PurchaseHistory({ vehicleId, purchases, onRefresh }: PurchaseHistoryProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<VehiclePurchase | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleCreate = async (data: VehiclePurchaseFormData) => {
    const res = await fetch('/api/vehicle-purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create purchase')
    }

    setShowForm(false)
    onRefresh()
  }

  const handleUpdate = async (data: VehiclePurchaseFormData) => {
    if (!editingPurchase) return

    const res = await fetch(`/api/vehicle-purchases/${editingPurchase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update purchase')
    }

    setEditingPurchase(null)
    onRefresh()
  }

  const handleDelete = async (purchaseId: string) => {
    if (!confirm('Hapus data pembelian ini?')) {
      return
    }

    setIsDeleting(purchaseId)

    try {
      const res = await fetch(`/api/vehicle-purchases/${purchaseId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete purchase')
      }

      onRefresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsDeleting(null)
    }
  }

  const calculateAge = (date: string) => {
    const now = new Date()
    const purchaseDate = new Date(date)
    const months = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                   (now.getMonth() - purchaseDate.getMonth())
    return months
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Riwayat Pembelian Aki</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Tambah Pembelian
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Pembelian Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseForm
              vehicleId={vehicleId}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Belum ada riwayat pembelian aki. Klik "Tambah Pembelian" untuk menambahkan.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => {
            const age = calculateAge(purchase.tanggal_pembelian)
            const purchaseDate = new Date(purchase.tanggal_pembelian)
            const today = new Date()
            const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const d2 = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate())
            const ageDays = Math.max(0, Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)))
            const warrantyStatus = getWarrantyStatus(
              purchase.tanggal_pembelian,
              purchase.durasi_garansi_bulan
            )
            
            return (
              <Card key={purchase.id}>
                <CardContent className="pt-6">
                  {editingPurchase?.id === purchase.id ? (
                    <PurchaseForm
                      vehicleId={vehicleId}
                      purchase={editingPurchase}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingPurchase(null)}
                    />
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-lg">
                              {purchase.merek_aki} {purchase.tipe_aki}
                            </h4>
                            <Badge variant={warrantyStatus === 'valid' ? 'default' : 'destructive'}>
                              {warrantyStatus === 'valid' ? 'Garansi Valid' : 'Garansi Expired'}
                            </Badge>
                            <Badge variant={purchase.tukar_tambah ? 'secondary' : 'outline'}>
                              {purchase.tukar_tambah ? 'Tukar Tambah: Ya' : 'Tukar Tambah: Tidak'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Tanggal: {new Date(purchase.tanggal_pembelian).toLocaleDateString('id-ID')} 
                            <span className="mx-2">•</span>
                            Usia: {ageDays} hari ({age} bulan)
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            Rp {purchase.harga_beli.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/claims/new?purchaseId=${purchase.id}`}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            Buat Klaim
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPurchase(purchase)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(purchase.id)}
                            disabled={isDeleting === purchase.id}
                          >
                            {isDeleting === purchase.id ? 'Menghapus...' : 'Hapus'}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t text-sm">
                        <div>
                          <p className="text-gray-600">Durasi Garansi</p>
                          <p className="font-medium">{purchase.durasi_garansi_bulan} bulan</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reminder Follow-up</p>
                          <p className="font-medium">{purchase.reminder_bulan} bulan</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lokasi Pembelian</p>
                          <p className="font-medium">{purchase.lokasi_cabang || '-'}</p>
                        </div>
                      </div>

                      {purchase.catatan_transaksi && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">Catatan:</p>
                          <p className="text-sm mt-1">{purchase.catatan_transaksi}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
