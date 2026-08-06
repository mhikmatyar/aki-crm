import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CustomerProfileFormData } from '@/lib/types'
import { applyCustomerLookup } from '@/lib/customer-code'

export const dynamic = 'force-dynamic'

// GET /api/customer-profiles/[id] - Get customer profile with vehicles and purchases
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const idOrCode = params.id
    
    const { data: profile, error: profileError } = await applyCustomerLookup(
      supabase.from('customer_profiles').select('*'),
      idOrCode
    )
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer profile not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching customer profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch customer profile' },
        { status: 500 }
      )
    }
    
    // Get vehicles for this customer
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })
    
    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }
    
    // Get purchases for each vehicle
    const vehicleIds = vehicles?.map((v: any) => v.id) || []
    let purchases: any[] = []
    
    if (vehicleIds.length > 0) {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('vehicle_purchases')
        .select(`
          *,
          branches:lokasi_cabang (
            id,
            nama_cabang,
            kota
          )
        `)
        .in('vehicle_id', vehicleIds)
        .order('tanggal_pembelian', { ascending: false })
      
      if (purchasesError) {
        console.error('Error fetching purchases:', purchasesError)
      } else {
        purchases = purchasesData || []
      }
    }
    
    // Combine data into hierarchy
    const vehiclesWithPurchases = vehicles?.map((vehicle: any) => ({
      ...vehicle,
      purchases: purchases.filter((p: any) => p.vehicle_id === vehicle.id)
    }))
    
    const result = {
      ...profile,
      vehicles: vehiclesWithPurchases
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

// PATCH /api/customer-profiles/[id] - Update customer profile
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const idOrCode = params.id
    const body: Partial<CustomerProfileFormData> = await request.json()
    
    // Prepare update data (only include provided fields)
    const updateData: any = {}
    
    if (body.nama !== undefined) updateData.nama = body.nama
    if (body.nomor_telp !== undefined) updateData.nomor_telp = body.nomor_telp
    if (body.catatan_umum !== undefined) updateData.catatan_umum = body.catatan_umum
    if (body.is_agen !== undefined) updateData.is_agen = body.is_agen
    if (body.detail_agen !== undefined) updateData.detail_agen = body.detail_agen
    
    const { data, error } = await applyCustomerLookup(
      supabase.from('customer_profiles').update(updateData).select(),
      idOrCode
    )
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer profile not found' },
          { status: 404 }
        )
      }
      console.error('Error updating customer profile:', error)
      return NextResponse.json(
        { error: 'Failed to update customer profile' },
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

// DELETE /api/customer-profiles/[id] - Delete customer profile (cascade deletes vehicles & purchases)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const idOrCode = params.id
    
    const { error } = await applyCustomerLookup(
      supabase.from('customer_profiles').delete(),
      idOrCode
    )
    
    if (error) {
      console.error('Error deleting customer profile:', error)
      return NextResponse.json(
        { error: 'Failed to delete customer profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Customer profile deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
