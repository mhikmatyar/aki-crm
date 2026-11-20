import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getWarrantyStatus } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // 0. Hanya owner / super_admin yang boleh export seluruh data customer (PDP)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!['super_admin', 'owner'].includes(profile?.role)) {
      return NextResponse.json(
        { error: 'Hanya Owner atau Super Admin yang dapat mengekspor data customer.' },
        { status: 403 }
      )
    }

    // 1. Fetch all customer profiles with nested vehicles and purchases
    let allCustomers: any[] = []
    let from = 0
    const step = 1000

    while (true) {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select(`
          *,
          vehicles (
            *,
            vehicle_purchases (*)
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, from + step - 1)

      if (error) {
        console.error('Export fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (data && data.length > 0) {
        allCustomers.push(...data)
      }

      if (!data || data.length < step) {
        break
      }

      from += step
    }

    // 2. Flatten data into spreadsheet rows (1 row per purchase, or 1 row per customer if no purchase)
    interface ExportRow {
      kodeCustomer: string
      nama: string
      nomorTelp: string
      tipeCustomer: string
      catatanCustomer: string
      merekMobil: string
      jenisMobil: string
      platNomor: string
      merekAki: string
      tipeAki: string
      hargaBeli: number | null
      tanggalPembelian: string
      durasiGaransi: number | null
      statusGaransi: string
      tukarTambah: string
      cabang: string
      tanggalDibuat: string
    }

    const rows: ExportRow[] = []

    allCustomers.forEach((cust) => {
      const vehicles = cust.vehicles || []
      let hasPurchases = false

      vehicles.forEach((vehicle: any) => {
        const purchases = vehicle.vehicle_purchases || []
        purchases.forEach((pur: any) => {
          hasPurchases = true
          const warranty = getWarrantyStatus(pur.tanggal_pembelian, pur.durasi_garansi_bulan)

          rows.push({
            kodeCustomer: cust.kode_customer || '-',
            nama: cust.nama,
            nomorTelp: cust.nomor_telp,
            tipeCustomer: cust.is_agen ? 'Agen' : 'Regular',
            catatanCustomer: cust.catatan_umum || cust.detail_agen || '-',
            merekMobil: vehicle.merek_mobil || '-',
            jenisMobil: vehicle.jenis_mobil || '-',
            platNomor: vehicle.plat_nomor || '-',
            merekAki: pur.merek_aki || '-',
            tipeAki: pur.tipe_aki || '-',
            hargaBeli: typeof pur.harga_beli === 'number' ? pur.harga_beli : null,
            tanggalPembelian: pur.tanggal_pembelian || '-',
            durasiGaransi: pur.durasi_garansi_bulan || null,
            statusGaransi: warranty === 'valid' ? 'VALID' : 'EXPIRED',
            tukarTambah: pur.tukar_tambah ? 'Ya' : 'Tidak',
            cabang: pur.lokasi_cabang || 'Cabang Pusat',
            tanggalDibuat: cust.created_at ? cust.created_at.split('T')[0] : '-',
          })
        })

        // If vehicle has no purchases
        if (purchases.length === 0) {
          hasPurchases = true
          rows.push({
            kodeCustomer: cust.kode_customer || '-',
            nama: cust.nama,
            nomorTelp: cust.nomor_telp,
            tipeCustomer: cust.is_agen ? 'Agen' : 'Regular',
            catatanCustomer: cust.catatan_umum || cust.detail_agen || '-',
            merekMobil: vehicle.merek_mobil || '-',
            jenisMobil: vehicle.jenis_mobil || '-',
            platNomor: vehicle.plat_nomor || '-',
            merekAki: '-',
            tipeAki: '-',
            hargaBeli: null,
            tanggalPembelian: '-',
            durasiGaransi: null,
            statusGaransi: '-',
            tukarTambah: '-',
            cabang: '-',
            tanggalDibuat: cust.created_at ? cust.created_at.split('T')[0] : '-',
          })
        }
      })

      // If customer has no vehicles at all
      if (!hasPurchases && vehicles.length === 0) {
        rows.push({
          kodeCustomer: cust.kode_customer || '-',
          nama: cust.nama,
          nomorTelp: cust.nomor_telp,
          tipeCustomer: cust.is_agen ? 'Agen' : 'Regular',
          catatanCustomer: cust.catatan_umum || cust.detail_agen || '-',
          merekMobil: '-',
          jenisMobil: '-',
          platNomor: '-',
          merekAki: '-',
          tipeAki: '-',
          hargaBeli: null,
          tanggalPembelian: '-',
          durasiGaransi: null,
          statusGaransi: '-',
          tukarTambah: '-',
          cabang: '-',
          tanggalDibuat: cust.created_at ? cust.created_at.split('T')[0] : '-',
        })
      }
    })

    // 3. Generate Microsoft Excel XML Spreadsheet
    const dateFormatted = new Date().toISOString().split('T')[0]
    const filename = `Data-Customer-Pusat-Aki-${dateFormatted}.xls`

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Pusat Aki CRM</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#333333"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#DC2626" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Cell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="TextCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <NumberFormat ss:Format="@"/>
  </Style>
  <Style ss:ID="CurrencyCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="ValidStatus">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:Bold="1" ss:Color="#15803D"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ExpiredStatus">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Database Customer">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="40"/>  <!-- No -->
   <Column ss:Width="80"/>  <!-- Kode -->
   <Column ss:Width="160"/> <!-- Nama -->
   <Column ss:Width="110"/> <!-- No HP -->
   <Column ss:Width="70"/>  <!-- Tipe -->
   <Column ss:Width="140"/> <!-- Catatan -->
   <Column ss:Width="100"/> <!-- Merek Mobil -->
   <Column ss:Width="130"/> <!-- Jenis Mobil -->
   <Column ss:Width="90"/>  <!-- Plat Nomor -->
   <Column ss:Width="100"/> <!-- Merek Aki -->
   <Column ss:Width="90"/>  <!-- Tipe Aki -->
   <Column ss:Width="100"/> <!-- Harga -->
   <Column ss:Width="90"/>  <!-- Tgl Beli -->
   <Column ss:Width="80"/>  <!-- Garansi -->
   <Column ss:Width="80"/>  <!-- Status -->
   <Column ss:Width="90"/>  <!-- Tukar Tambah -->
   <Column ss:Width="100"/> <!-- Cabang -->
   <Column ss:Width="90"/>  <!-- Terdaftar -->
   <Row ss:Height="26">
    <Cell ss:StyleID="Header"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Kode Cust</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Nama Customer</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Nomor WhatsApp</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tipe</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Catatan</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Merek Mobil</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Jenis Mobil</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Plat Nomor</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Merek Aki</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tipe Aki</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Harga Beli (Rp)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tgl Beli</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Garansi (Bln)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status Garansi</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tukar Tambah</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Cabang</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tgl Terdaftar</Data></Cell>
   </Row>
${rows
  .map((row, index) => {
    const statusStyle =
      row.statusGaransi === 'VALID'
        ? 'ValidStatus'
        : row.statusGaransi === 'EXPIRED'
        ? 'ExpiredStatus'
        : 'CenterCell'

    return `   <Row>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${index + 1}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(row.kodeCustomer)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.nama)}</Data></Cell>
    <Cell ss:StyleID="TextCell"><Data ss:Type="String">${escapeXml(row.nomorTelp)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(row.tipeCustomer)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.catatanCustomer)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.merekMobil)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.jenisMobil)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(row.platNomor)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.merekAki)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.tipeAki)}</Data></Cell>
    ${
      row.hargaBeli !== null
        ? `<Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${row.hargaBeli}</Data></Cell>`
        : `<Cell ss:StyleID="CenterCell"><Data ss:Type="String">-</Data></Cell>`
    }
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(row.tanggalPembelian)}</Data></Cell>
    ${
      row.durasiGaransi !== null
        ? `<Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${row.durasiGaransi}</Data></Cell>`
        : `<Cell ss:StyleID="CenterCell"><Data ss:Type="String">-</Data></Cell>`
    }
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(row.statusGaransi)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(row.tukarTambah)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row.cabang)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(row.tanggalDibuat)}</Data></Cell>
   </Row>`
  })
  .join('\n')}
  </Table>
 </Worksheet>
</Workbook>`

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: any) {
    console.error('Export error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
