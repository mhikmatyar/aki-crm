import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CustomerProfile, CustomerProfileFormData } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/customer-profiles - Get all customer profiles
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Optional query parameters
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    let query = supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Search by name or phone
    if (search) {
      query = query.or(`nama.ilike.%${search}%,nomor_telp.ilike.%${search}%`)
    }
    
    // Limit results
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching customer profiles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customer profiles' },
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

// POST /api/customer-profiles - Create new customer profile
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body: CustomerProfileFormData = await request.json()
    
    // Validation
    if (!body.nama || !body.nomor_telp) {
      return NextResponse.json(
        { error: 'Nama dan nomor telepon harus diisi' },
        { status: 400 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Prepare data
    const profileData = {
      nama: body.nama,
      nomor_telp: body.nomor_telp,
      catatan_umum: body.catatan_umum || null,
      is_agen: body.is_agen || false,
      detail_agen: body.detail_agen || null,
      created_by: user?.id || null,
    }
    
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating customer profile:', error)
      return NextResponse.json(
        { error: 'Failed to create customer profile' },
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
