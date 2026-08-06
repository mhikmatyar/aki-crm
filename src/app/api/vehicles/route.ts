import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { VehicleFormData } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/vehicles - Get all vehicles (with optional customer_id filter)
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const customerId = searchParams.get('customer_id')
    
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        customer_profile:customer_profiles!vehicles_customer_id_fkey (
          id,
          nama,
          nomor_telp
        )
      `)
      .order('created_at', { ascending: false })
    
    // Filter by customer if provided
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
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

// POST /api/vehicles - Create new vehicle
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body: VehicleFormData = await request.json()
    
    // Validation
    if (!body.customer_id || !body.jenis_mobil) {
      return NextResponse.json(
        { error: 'Customer ID dan jenis mobil harus diisi' },
        { status: 400 }
      )
    }
    
    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('id', body.customer_id)
      .single()
    
    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer profile tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const vehicleData = {
      customer_id: body.customer_id,
      plat_nomor: body.plat_nomor || null,
      jenis_mobil: body.jenis_mobil,
      merek_mobil: body.merek_mobil || null,
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating vehicle:', error)
      return NextResponse.json(
        { error: 'Failed to create vehicle' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
