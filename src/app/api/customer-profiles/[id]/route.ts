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
        .select('*')
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileUser } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['super_admin', 'owner'].includes(profileUser?.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Hanya Super Admin dan Owner yang dapat menghapus customer.' },
        { status: 403 }
      )
    }

    const idOrCode = params.id
    
    // 1. Get profile ID
    const { data: profile } = await applyCustomerLookup(
      supabase.from('customer_profiles').select('id'),
      idOrCode
    ).maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // 2. Clean up related claims & wa_logs first so FK constraints are not violated
    await supabase.from('claims').delete().eq('customer_profile_id', profile.id)
    await supabase.from('wa_logs').delete().eq('customer_profile_id', profile.id)

    // Also clean up claims/wa_logs connected to purchases under this customer's vehicles
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('customer_id', profile.id)

    if (vehicles && vehicles.length > 0) {
      const vehicleIds = vehicles.map((v) => v.id)
      const { data: purchases } = await supabase
        .from('vehicle_purchases')
        .select('id')
        .in('vehicle_id', vehicleIds)

      if (purchases && purchases.length > 0) {
        const purchaseIds = purchases.map((p) => p.id)
        await supabase.from('claims').delete().in('vehicle_purchase_id', purchaseIds)
        await supabase.from('wa_logs').delete().in('vehicle_purchase_id', purchaseIds)
      }
    }

    // 3. Delete the customer profile
    const { error } = await supabase
      .from('customer_profiles')
      .delete()
      .eq('id', profile.id)
    
    if (error) {
      console.error('Error deleting customer profile:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete customer profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Customer profile deleted successfully' })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
