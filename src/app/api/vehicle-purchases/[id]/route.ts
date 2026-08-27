import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { VehiclePurchaseFormData } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/vehicle-purchases/[id] - Get purchase detail
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    
    const { data, error } = await supabase
      .from('vehicle_purchases')
      .select(`
        *,
        vehicle:vehicles!vehicle_purchases_vehicle_id_fkey (
          id,
          plat_nomor,
          jenis_mobil,
          merek_mobil,
          customer_profile:customer_profiles!vehicles_customer_id_fkey (
            id,
            nama,
            nomor_telp,
            catatan_umum,
            is_agen
          )
      )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Purchase not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching purchase:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchase' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/vehicle-purchases/[id] - Update purchase
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    const body: Partial<VehiclePurchaseFormData> = await request.json()
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.tipe_aki !== undefined) updateData.tipe_aki = body.tipe_aki
    if (body.merek_aki !== undefined) updateData.merek_aki = body.merek_aki
    if (body.harga_beli !== undefined) updateData.harga_beli = body.harga_beli
    if (body.tanggal_pembelian !== undefined) updateData.tanggal_pembelian = body.tanggal_pembelian
    if (body.lokasi_cabang !== undefined) updateData.lokasi_cabang = body.lokasi_cabang
    if (body.durasi_garansi_bulan !== undefined) updateData.durasi_garansi_bulan = body.durasi_garansi_bulan
    if (body.tukar_tambah !== undefined) updateData.tukar_tambah = body.tukar_tambah
    if (body.catatan_transaksi !== undefined) updateData.catatan_transaksi = body.catatan_transaksi
    if (body.reminder_bulan !== undefined) updateData.reminder_bulan = body.reminder_bulan
    
    const { data, error } = await supabase
      .from('vehicle_purchases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Purchase not found' },
          { status: 404 }
        )
      }
      console.error('Error updating purchase:', error)
      return NextResponse.json(
        { error: 'Failed to update purchase' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicle-purchases/[id] - Delete purchase
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    
    const { error } = await supabase
      .from('vehicle_purchases')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting purchase:', error)
      return NextResponse.json(
        { error: 'Failed to delete purchase' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Purchase deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
