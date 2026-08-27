import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { VehiclePurchaseFormData } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/vehicle-purchases - Get all purchases with filters
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const vehicleId = searchParams.get('vehicle_id')
    const customerId = searchParams.get('customer_id')
    const ageFilter = searchParams.get('age_filter')
    
    let query = supabase
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
      .order('tanggal_pembelian', { ascending: false })
    
    // Filter by vehicle
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }
    
    // Filter by customer (join through vehicles)
    if (customerId) {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('customer_id', customerId)
      
      const vehicleIds = vehicles?.map((v: any) => v.id) || []
      if (vehicleIds.length > 0) {
        query = query.in('vehicle_id', vehicleIds)
      } else {
        return NextResponse.json([])
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchases' },
        { status: 500 }
      )
    }
    
    const purchaseIds = (data || []).map((purchase: any) => purchase.id)
    let logsByPurchase: Record<string, any[]> = {}

    if (purchaseIds.length > 0) {
      const { data: logs, error: logsError } = await supabase
        .from('wa_logs')
        .select('id, vehicle_purchase_id, customer_id, durasi_saat_kirim, pesan_dikirim, waktu_kirim')
        .in('vehicle_purchase_id', purchaseIds)
        .order('waktu_kirim', { ascending: false })

      if (!logsError) {
        logsByPurchase = (logs || []).reduce((acc: Record<string, any[]>, log: any) => {
          if (!log.vehicle_purchase_id) return acc
          acc[log.vehicle_purchase_id] = acc[log.vehicle_purchase_id] || []
          acc[log.vehicle_purchase_id].push(log)
          return acc
        }, {})
      } else {
        console.warn('WA logs relation not ready, continuing without logs:', logsError.message)
      }
    }

    // Apply age filter if provided
    let filteredData = data || []
    if (ageFilter && ageFilter !== 'all') {
      const now = new Date()
      filteredData = filteredData.filter((purchase: any) => {
        const purchaseDate = new Date(purchase.tanggal_pembelian)
        const monthsDiff = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                          (now.getMonth() - purchaseDate.getMonth())
        
        switch (ageFilter) {
          case '<3': return monthsDiff < 3
          case '3-6': return monthsDiff >= 3 && monthsDiff < 6
          case '6-12': return monthsDiff >= 6 && monthsDiff < 12
          case '12-18': return monthsDiff >= 12 && monthsDiff < 18
          case '>18': return monthsDiff >= 18
          default: return true
        }
      })
    }
    
    const dataWithLogs = filteredData.map((purchase: any) => ({
      ...purchase,
      wa_logs: logsByPurchase[purchase.id] || [],
    }))

    return NextResponse.json(dataWithLogs)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/vehicle-purchases - Create new purchase
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body: VehiclePurchaseFormData = await request.json()
    
    // Validation
    if (!body.vehicle_id || !body.tipe_aki || !body.merek_aki || !body.tanggal_pembelian) {
      return NextResponse.json(
        { error: 'Vehicle ID, tipe aki, merek aki, dan tanggal pembelian harus diisi' },
        { status: 400 }
      )
    }
    
    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', body.vehicle_id)
      .single()
    
    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    const purchaseData = {
      vehicle_id: body.vehicle_id,
      tipe_aki: body.tipe_aki,
      merek_aki: body.merek_aki,
      harga_beli: body.harga_beli || 0,
      tanggal_pembelian: body.tanggal_pembelian,
      lokasi_cabang: body.lokasi_cabang || null,
      durasi_garansi_bulan: body.durasi_garansi_bulan || 12,
      tukar_tambah: body.tukar_tambah || false,
      catatan_transaksi: body.catatan_transaksi || null,
      reminder_bulan: body.reminder_bulan || 12,
      created_by: user?.id || null,
    }
    
    const { data, error } = await supabase
      .from('vehicle_purchases')
      .insert(purchaseData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating purchase:', error)
      return NextResponse.json(
        { error: 'Failed to create purchase' },
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
