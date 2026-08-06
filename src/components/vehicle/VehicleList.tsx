'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PurchaseHistory } from '@/components/purchase'
import { VehicleForm } from './VehicleForm'
import type { Vehicle, VehicleFormData, VehicleWithPurchases } from '@/lib/types'

interface VehicleListProps {
  customerId: string
  vehicles: VehicleWithPurchases[]
  onRefresh: () => void
}

export function VehicleList({ customerId, vehicles, onRefresh }: VehicleListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleCreate = async (data: VehicleFormData) => {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create vehicle')
    }

    setShowForm(false)
    onRefresh()
  }

  const handleUpdate = async (data: VehicleFormData) => {
    if (!editingVehicle) return

    const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update vehicle')
    }

    setEditingVehicle(null)
    onRefresh()
  }

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Hapus kendaraan ini? Semua riwayat pembelian aki akan ikut terhapus.')) {
      return
    }

    setIsDeleting(vehicleId)

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete vehicle')
      }

      onRefresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Kendaraan</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Tambah Kendaraan
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Kendaraan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleForm
              customerId={customerId}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Belum ada kendaraan terdaftar. Klik "Tambah Kendaraan" untuk menambahkan.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="pt-6">
                {editingVehicle?.id === vehicle.id ? (
                  <VehicleForm
                    customerId={customerId}
                    vehicle={editingVehicle}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingVehicle(null)}
                  />
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-lg">{vehicle.jenis_mobil}</h4>
                        {vehicle.plat_nomor && (
                          <p className="text-sm text-gray-600">
                            Plat: <span className="font-mono font-semibold">{vehicle.plat_nomor}</span>
                          </p>
                        )}
                        {vehicle.merek_mobil && (
                          <p className="text-sm text-gray-600">Merek: {vehicle.merek_mobil}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingVehicle(vehicle)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={isDeleting === vehicle.id}
                        >
                          {isDeleting === vehicle.id ? 'Menghapus...' : 'Hapus'}
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <PurchaseHistory
                        vehicleId={vehicle.id}
                        purchases={vehicle.purchases || []}
                        onRefresh={onRefresh}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
