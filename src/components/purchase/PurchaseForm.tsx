'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { VehiclePurchase, VehiclePurchaseFormData } from '@/lib/types'

interface PurchaseFormProps {
  vehicleId: string
  purchase?: VehiclePurchase | null
  onSubmit: (data: VehiclePurchaseFormData) => Promise<void>
  onCancel: () => void
}

export function PurchaseForm({ vehicleId, purchase, onSubmit, onCancel }: PurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<VehiclePurchaseFormData>({
    vehicle_id: vehicleId,
    tipe_aki: purchase?.tipe_aki || '',
    merek_aki: purchase?.merek_aki || '',
    harga_beli: purchase?.harga_beli || 0,
    tanggal_pembelian: purchase?.tanggal_pembelian || new Date().toISOString().split('T')[0],
    lokasi_cabang: purchase?.lokasi_cabang || undefined,
    durasi_garansi_bulan: purchase?.durasi_garansi_bulan || 12,
    tukar_tambah: purchase?.tukar_tambah || false,
    catatan_transaksi: purchase?.catatan_transaksi || '',
    reminder_bulan: purchase?.reminder_bulan || 12,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.tipe_aki.trim()) {
      setError('Tipe aki harus diisi')
      return
    }
    if (!formData.merek_aki.trim()) {
      setError('Merek aki harus diisi')
      return
    }
    if (!formData.tanggal_pembelian) {
      setError('Tanggal pembelian harus diisi')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pembelian')
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="merek_aki">
            Merek Aki <span className="text-red-500">*</span>
          </Label>
          <Input
            id="merek_aki"
            placeholder="Contoh: GS Astra, Varta, Amaron"
            value={formData.merek_aki}
            onChange={(e) => setFormData({ ...formData, merek_aki: e.target.value })}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipe_aki">
            Tipe Aki <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tipe_aki"
            placeholder="Contoh: NS60LS, MF55B24L"
            value={formData.tipe_aki}
            onChange={(e) => setFormData({ ...formData, tipe_aki: e.target.value })}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="harga_beli">Harga Beli (Rp)</Label>
          <Input
            id="harga_beli"
            type="number"
            min="0"
            placeholder="850000"
            value={formData.harga_beli || ''}
            onChange={(e) => setFormData({ ...formData, harga_beli: parseInt(e.target.value) || 0 })}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggal_pembelian">
            Tanggal Pembelian <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tanggal_pembelian"
            type="date"
            value={formData.tanggal_pembelian}
            onChange={(e) => setFormData({ ...formData, tanggal_pembelian: e.target.value })}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lokasi_cabang">Lokasi Cabang</Label>
          <Input
            id="lokasi_cabang"
            type="text"
            placeholder="Contoh: Cabang Bogor - Bogor"
            value={formData.lokasi_cabang || ''}
            onChange={(event) => setFormData({ ...formData, lokasi_cabang: event.target.value || undefined })}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durasi_garansi_bulan">Durasi Garansi (bulan)</Label>
          <Input
            id="durasi_garansi_bulan"
            type="number"
            min="1"
            max="60"
            value={formData.durasi_garansi_bulan || 12}
            onChange={(e) => setFormData({ ...formData, durasi_garansi_bulan: parseInt(e.target.value) || 12 })}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_bulan">Reminder Follow-up (bulan)</Label>
        <Input
          id="reminder_bulan"
          type="number"
          min="1"
          max="60"
          value={formData.reminder_bulan || 12}
          onChange={(e) => setFormData({ ...formData, reminder_bulan: parseInt(e.target.value) || 12 })}
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">Kapan customer perlu difollow-up untuk pengecekan</p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="tukar_tambah"
          checked={formData.tukar_tambah}
          onCheckedChange={(checked) => setFormData({ ...formData, tukar_tambah: checked as boolean })}
          disabled={isSubmitting}
        />
        <Label htmlFor="tukar_tambah" className="cursor-pointer">
          Tukar Tambah
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catatan_transaksi">Catatan Transaksi</Label>
        <Textarea
          id="catatan_transaksi"
          placeholder="Catatan khusus untuk transaksi ini..."
          value={formData.catatan_transaksi || ''}
          onChange={(e) => setFormData({ ...formData, catatan_transaksi: e.target.value })}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Menyimpan...' : purchase ? 'Update Pembelian' : 'Tambah Pembelian'}
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
