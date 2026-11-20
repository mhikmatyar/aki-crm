'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Vehicle, VehicleFormData } from '@/lib/types'
import { VEHICLE_BRAND_GROUPS } from '@/lib/types'

interface VehicleFormProps {
  customerId: string
  vehicle?: Vehicle | null
  onSubmit: (data: VehicleFormData) => Promise<void>
  onCancel: () => void
}

// Lookup merek standar (huruf besar → nilai opsi persis di dropdown)
const PREDEFINED_BRAND_BY_UPPER = new Map(
  VEHICLE_BRAND_GROUPS.flatMap((g) => g.brands.map((b) => [b.toUpperCase(), b] as const))
)

export function VehicleForm({ customerId, vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine initial brand selection
  const initialBrand = vehicle?.merek_mobil || ''
  const canonicalBrand = PREDEFINED_BRAND_BY_UPPER.get(initialBrand.trim().toUpperCase())
  const isPredefined = initialBrand ? Boolean(canonicalBrand) : true

  const [selectedBrand, setSelectedBrand] = useState<string>(
    initialBrand ? (canonicalBrand ?? '__CUSTOM__') : ''
  )
  const [customBrand, setCustomBrand] = useState<string>(
    initialBrand && !isPredefined ? initialBrand : ''
  )
  
  const [formData, setFormData] = useState<VehicleFormData>({
    customer_id: customerId,
    plat_nomor: vehicle?.plat_nomor || '',
    jenis_mobil: vehicle?.jenis_mobil || '',
    merek_mobil: initialBrand,
  })

  const handleBrandChange = (val: string) => {
    setSelectedBrand(val)
    if (val !== '__CUSTOM__') {
      setFormData((prev) => ({ ...prev, merek_mobil: val }))
    } else {
      setFormData((prev) => ({ ...prev, merek_mobil: customBrand.trim() }))
    }
  }

  const handleCustomBrandChange = (val: string) => {
    setCustomBrand(val)
    setFormData((prev) => ({ ...prev, merek_mobil: val.trim() }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.jenis_mobil.trim()) {
      setError('Jenis mobil harus diisi')
      return
    }

    const finalMerek = (selectedBrand === '__CUSTOM__' ? customBrand : selectedBrand).trim()
    if (!finalMerek) {
      setError('Merek mobil harus dipilih atau diisi')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        ...formData,
        merek_mobil: finalMerek,
      })
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
          Merek Kendaraan / Mobil <span className="text-red-500">*</span>
        </Label>
        <select
          id="merek_mobil"
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          disabled={isSubmitting}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">-- Pilih Merek --</option>
          {VEHICLE_BRAND_GROUPS.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="__CUSTOM__">➕ Input Merek Sendiri (Manual)...</option>
        </select>

        {selectedBrand === '__CUSTOM__' && (
          <div className="mt-2.5">
            <Input
              id="custom_merek_mobil"
              placeholder="Ketik nama merek kendaraan di sini..."
              value={customBrand}
              onChange={(e) => handleCustomBrandChange(e.target.value)}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>
        )}
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
