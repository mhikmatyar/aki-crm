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
    
    let vehicleIds: string[] = []
    if (customerId) {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('customer_id', customerId)
      
      vehicleIds = vehicles?.map((v: any) => v.id) || []
      if (vehicleIds.length === 0) {
        return NextResponse.json([])
      }
    }

    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : null

    let allPurchases: any[] = []

    if (limit) {
      let pageQuery = supabase
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
        .limit(limit)

      if (vehicleId) {
        pageQuery = pageQuery.eq('vehicle_id', vehicleId)
      }

      if (customerId && vehicleIds.length > 0) {
        pageQuery = pageQuery.in('vehicle_id', vehicleIds)
      }

      const { data: pageData, error: pageError } = await pageQuery
      if (pageError) {
        console.error('Error fetching purchases:', pageError)
        return NextResponse.json(
          { error: 'Failed to fetch purchases' },
          { status: 500 }
        )
      }
      allPurchases = pageData || []
    } else {
      let from = 0
      const step = 1000

      while (true) {
        let pageQuery = supabase
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
          .range(from, from + step - 1)

        if (vehicleId) {
          pageQuery = pageQuery.eq('vehicle_id', vehicleId)
        }

        if (customerId && vehicleIds.length > 0) {
          pageQuery = pageQuery.in('vehicle_id', vehicleIds)
        }

        const { data: pageData, error: pageError } = await pageQuery

        if (pageError) {
          console.error('Error fetching purchases:', pageError)
          return NextResponse.json(
            { error: 'Failed to fetch purchases' },
            { status: 500 }
          )
        }

        if (pageData && pageData.length > 0) {
          allPurchases.push(...pageData)
        }

        if (!pageData || pageData.length < step || vehicleId || (customerId && vehicleIds.length < step)) {
          break
        }

        from += step
      }
    }

    const data = allPurchases
    let logsByPurchase: Record<string, any[]> = {}

    if (data.length > 0) {
      const purchaseIds: string[] = data.map((purchase: any) => purchase.id)
      const purchaseIdSet = new Set(purchaseIds)
      const LOG_COLUMNS = 'id, vehicle_purchase_id, customer_id, durasi_saat_kirim, pesan_dikirim, waktu_kirim'
      const LOG_PAGE = 1000

      // Supabase membatasi 1000 baris per request, jadi setiap query log dipaginasi
      // sampai habis supaya log lama tidak hilang diam-diam.
      const fetchAllPages = async (buildQuery: () => any) => {
        const rows: any[] = []
        for (let offset = 0; ; offset += LOG_PAGE) {
          const { data: page, error } = await buildQuery()
            .order('waktu_kirim', { ascending: false })
            .order('id', { ascending: true })
            .range(offset, offset + LOG_PAGE - 1)
          if (error) throw error
          if (page) rows.push(...page)
          if (!page || page.length < LOG_PAGE) break
        }
        return rows
      }

      try {
        let logs: any[] = []
        if (purchaseIds.length <= 1000) {
          // Sedikit purchase: ambil log hanya untuk purchase ini, per potongan ID agar URL tidak kepanjangan
          const chunkSize = 200
          for (let i = 0; i < purchaseIds.length; i += chunkSize) {
            const chunk = purchaseIds.slice(i, i + chunkSize)
            logs.push(
              ...(await fetchAllPages(() =>
                supabase.from('wa_logs').select(LOG_COLUMNS).in('vehicle_purchase_id', chunk)
              ))
            )
          }
        } else {
          // Banyak purchase (mis. dashboard): lebih murah ambil semua log yang punya purchase, lalu saring
          logs = await fetchAllPages(() =>
            supabase.from('wa_logs').select(LOG_COLUMNS).not('vehicle_purchase_id', 'is', null)
          )
        }

        logs.forEach((log: any) => {
          if (!log.vehicle_purchase_id || !purchaseIdSet.has(log.vehicle_purchase_id)) return
          logsByPurchase[log.vehicle_purchase_id] = logsByPurchase[log.vehicle_purchase_id] || []
          logsByPurchase[log.vehicle_purchase_id].push(log)
        })
        // Urutan antar-chunk bisa tercampur; pastikan terbaru dulu per purchase
        Object.values(logsByPurchase).forEach((list) =>
          list.sort((a, b) => new Date(b.waktu_kirim).getTime() - new Date(a.waktu_kirim).getTime())
        )
      } catch (logsError: any) {
        console.warn('WA logs query error, continuing without logs:', logsError?.message)
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
