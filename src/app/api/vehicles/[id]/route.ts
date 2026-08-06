import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { VehicleFormData } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/vehicles/[id] - Get vehicle with purchases
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    
    // Get vehicle with customer profile
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select(`
        *,
        customer_profile:customer_profiles!vehicles_customer_id_fkey (
          id,
          nama,
          nomor_telp,
          catatan_umum,
          is_agen
        )
      `)
      .eq('id', id)
      .single()
    
    if (vehicleError) {
      if (vehicleError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching vehicle:', vehicleError)
      return NextResponse.json(
        { error: 'Failed to fetch vehicle' },
        { status: 500 }
      )
    }
    
    // Get purchases for this vehicle
    const { data: purchases, error: purchasesError } = await supabase
      .from('vehicle_purchases')
      .select(`
        *,
        branches:lokasi_cabang (
          id,
          nama_cabang,
          kota
        )
      `)
      .eq('vehicle_id', id)
      .order('tanggal_pembelian', { ascending: false })
    
    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError)
    }
    
    const result = {
      ...vehicle,
      purchases: purchases || []
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/vehicles/[id] - Update vehicle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    const body: Partial<VehicleFormData> = await request.json()
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.plat_nomor !== undefined) updateData.plat_nomor = body.plat_nomor
    if (body.jenis_mobil !== undefined) updateData.jenis_mobil = body.jenis_mobil
    if (body.merek_mobil !== undefined) updateData.merek_mobil = body.merek_mobil
    
    const { data, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        )
      }
      console.error('Error updating vehicle:', error)
      return NextResponse.json(
        { error: 'Failed to update vehicle' },
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

// DELETE /api/vehicles/[id] - Delete vehicle (cascade deletes purchases)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting vehicle:', error)
      return NextResponse.json(
        { error: 'Failed to delete vehicle' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
