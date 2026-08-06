'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Vehicle, VehicleFormData } from '@/lib/types'

interface VehicleFormProps {
  customerId: string
  vehicle?: Vehicle | null
  onSubmit: (data: VehicleFormData) => Promise<void>
  onCancel: () => void
}

export function VehicleForm({ customerId, vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<VehicleFormData>({
    customer_id: customerId,
    plat_nomor: vehicle?.plat_nomor || '',
    jenis_mobil: vehicle?.jenis_mobil || '',
    merek_mobil: vehicle?.merek_mobil || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.jenis_mobil.trim()) {
      setError('Jenis mobil harus diisi')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data kendaraan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="plat_nomor">
          Plat Nomor <span className="text-gray-400 text-sm">(opsional)</span>
        </Label>
        <Input
          id="plat_nomor"
          placeholder="Contoh: B 1234 ABC"
          value={formData.plat_nomor || ''}
          onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenis_mobil">
          Jenis Mobil <span className="text-red-500">*</span>
        </Label>
        <Input
          id="jenis_mobil"
          placeholder="Contoh: Toyota Avanza, Honda Civic"
          value={formData.jenis_mobil}
          onChange={(e) => setFormData({ ...formData, jenis_mobil: e.target.value })}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="merek_mobil">
          Merek Mobil <span className="text-gray-400 text-sm">(opsional)</span>
        </Label>
        <Input
          id="merek_mobil"
          placeholder="Contoh: Toyota, Honda, Suzuki"
          value={formData.merek_mobil || ''}
          onChange={(e) => setFormData({ ...formData, merek_mobil: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Menyimpan...' : vehicle ? 'Update Kendaraan' : 'Tambah Kendaraan'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
      </div>
    </form>
  )
}
