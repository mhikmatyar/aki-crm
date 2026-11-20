const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  envContent.split('\n').forEach((line) => {
    const [k, ...v] = line.trim().split('=')
    if (k && v.length > 0) {
      process.env[k] = v.join('=')
    }
  })
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env.local')
  process.exit(1)
}
const client = createClient(url, serviceKey)

// Daftar merek resmi = daftar yang sama dengan dropdown di form kendaraan
const BRAND_GROUPS = require('../src/lib/vehicle-brands.json')
const CANONICAL_BY_UPPER = new Map(
  BRAND_GROUPS.flatMap((g) => g.brands.map((b) => [b.toUpperCase(), b]))
)

// Pakai: node scripts/cleanse-brands.js            → dry-run (hanya laporan CSV)
//        node scripts/cleanse-brands.js --apply    → benar-benar update database
const APPLY = process.argv.includes('--apply')

function determineStandardBrand(merek, jenis) {
  const raw = determineRawBrand(merek, jenis)
  // Samakan penulisan dengan opsi dropdown (mis. "HONDA (MOTOR)" → "HONDA (Motor)")
  return CANONICAL_BY_UPPER.get(raw.toUpperCase()) || raw
}

function determineRawBrand(merek, jenis) {
  const m = (merek || '').trim().toUpperCase()
  const j = (jenis || '').trim().toUpperCase()

  // 1. Direct typo / formatting fixes on current merek
  if (m === 'MITSHUBISHI') return 'MITSUBISHI'
  if (m === 'TOYOTA') return 'TOYOTA'
  if (m === 'MERCEDES BENZ' || m === 'MERCEDES') return 'MERCEDES-BENZ'
  if (m === 'MG CHINA') return 'MG'
  if (m === 'IONIQ') return 'HYUNDAI'
  if (m === 'OPEL BLAZER' || m === 'SUV BLAZER') return 'CHEVROLET'
  if (m === 'VESPA') return 'VESPA (Motor)'
  if (m === 'CHEVROLE' || m === 'CH') return 'CHEVROLET'
  if (m === 'GLORY') return 'DFSK'
  if (m === 'YAMAHA') return 'YAMAHA (Motor)'
  if (m === 'KAWASAKI') return 'KAWASAKI (Motor)'
  if (m === 'BMW / MINI') return 'MINI' // hasil versi lama script ini

  // If already standard and filled, keep it
  if (m && m !== '(NULL)') return m

  // 2. Intelligent mapping based on jenis_mobil keywords
  if (
    j.includes('CANTER') ||
    j.includes('FUSO') ||
    j.includes('L300') ||
    j.includes('TRITON') ||
    j.includes('PAJERO') ||
    j.includes('XPANDER')
  )
    return 'MITSUBISHI'

  if (
    j.includes('AVANZA') ||
    j.includes('INNOVA') ||
    j.includes('FORTUNER') ||
    j.includes('RUSH') ||
    j.includes('CALYA') ||
    j.includes('AGYA') ||
    j.includes('LAND CRUISER') ||
    j.includes('YARIS') ||
    j.includes('RAIZE') ||
    j.includes('SIENTA') ||
    j.includes('VIOS') ||
    j.includes('COROLLA') ||
    j.includes('CAMRY') ||
    j.includes('ALPHARD') ||
    j.includes('VOXY') ||
    j.includes('HILUX') ||
    j.includes('HIACE')
  )
    return 'TOYOTA'

  if (
    j.includes('XENIA') ||
    j.includes('SIGRA') ||
    j.includes('AYLA') ||
    j.includes('TERIOS') ||
    j.includes('GRAN MAX') ||
    j.includes('GRAND MAX') ||
    j.includes('LUXIO') ||
    j.includes('ROCKY') ||
    j.includes('SIRION') ||
    j.includes('TARUNA') ||
    j.includes('ZEBRA') ||
    j.includes('FEROZA') ||
    j.includes('TAFT')
  )
    return 'DAIHATSU'

  if (
    j.includes('BRIO') ||
    j.includes('MOBILIO') ||
    j.includes('HRV') ||
    j.includes('HR-V') ||
    j.includes('BRV') ||
    j.includes('BR-V') ||
    j.includes('CRV') ||
    j.includes('CR-V') ||
    j.includes('JAZZ') ||
    j.includes('CIVIC') ||
    j.includes('CITY') ||
    j.includes('ACCORD') ||
    j.includes('FREED') ||
    j.includes('WRV') ||
    j.includes('WR-V')
  )
    return 'HONDA'

  if (
    j.includes('ERTIGA') ||
    j.includes('CARRY') ||
    j.includes('XL7') ||
    j.includes('IGNIS') ||
    j.includes('BALENO') ||
    j.includes('KARIMUN') ||
    j.includes('SX4') ||
    j.includes('APV') ||
    j.includes('SPLASH') ||
    j.includes('SWIFT') ||
    j.includes('JIMNY') ||
    j.includes('KATANA')
  )
    return 'SUZUKI'

  if (
    j.includes('LIVINA') ||
    j.includes('SERENA') ||
    j.includes('XTRAIL') ||
    j.includes('X-TRAIL') ||
    j.includes('MARCH') ||
    j.includes('JUKE') ||
    j.includes('NAVARA') ||
    j.includes('EVALIA') ||
    j.includes('TEANA')
  )
    return 'NISSAN'

  if (
    j.includes('CONFERO') ||
    j.includes('ALMAZ') ||
    j.includes('CORTEZ') ||
    j.includes('AIR EV') ||
    j.includes('BINGUO') ||
    j.includes('ALVEZ') ||
    j.includes('FORMO')
  )
    return 'WULING'

  if (
    j.includes('CRETA') ||
    j.includes('STARGAZER') ||
    j.includes('SANTA FE') ||
    j.includes('PALISADE') ||
    j.includes('IONIQ') ||
    j.includes('TUCSON') ||
    j.includes('H-1') ||
    j.includes('AVEGA') ||
    j.includes('GETZ')
  )
    return 'HYUNDAI'

  if (
    j.includes('PANTHER') ||
    j.includes('D-MAX') ||
    j.includes('DMAX') ||
    j.includes('MUX') ||
    j.includes('MU-X') ||
    j.includes('ELF') ||
    j.includes('GIGA')
  )
    return 'ISUZU'

  if (j.includes('DUTRO') || j.includes('LOHAN') || j.includes('HINO')) return 'HINO'
  if (
    j.includes('ESCAPE') ||
    j.includes('ECOSPORT') ||
    j.includes('FIESTA') ||
    j.includes('RANGER') ||
    j.includes('EVEREST') ||
    j.includes('FOCUS')
  )
    return 'FORD'

  if (j.includes('CHERRY') || j.includes('OMODA') || j.includes('TIGGO')) return 'CHERY'
  if (j.includes('GLORY') || j.includes('DFSK') || j.includes('SUPER CAB') || j.includes('GELORA')) return 'DFSK'
  if (j.includes('MERCY') || j.includes('BENZ')) return 'MERCEDES-BENZ'
  // "MINI" saja tidak cukup: bisa kena "MINIBUS"
  if (j.includes('MINI COOPER') || j === 'MINI' || j.startsWith('MINI ')) return 'MINI'
  if (j.includes('LEXUS')) return 'LEXUS'
  if (j.includes('PEUGEOT')) return 'PEUGEOT'
  if (j.includes('TIMOR')) return 'TIMOR'

  // Motors
  if (
    j.includes('NINJA') ||
    j.includes('ZX25') ||
    j.includes('KLX') ||
    j.includes('D-TRACKER') ||
    j.includes('W175')
  )
    return 'KAWASAKI (Motor)'

  if (j.includes('VESPA')) return 'VESPA (Motor)'

  if (
    j.includes('VIXION') ||
    j.includes('MIO') ||
    j.includes('JUPITER') ||
    j.includes('AEROX') ||
    j.includes('NMAX') ||
    j.includes('N-MAX') ||
    j.includes('GEAR') ||
    j.includes('SCORPIO') ||
    j.includes('BYSON') ||
    j.includes('R15') ||
    j.includes('R25') ||
    j.includes('LEXI') ||
    j.includes('FAZZIO') ||
    j.includes('FILANO')
  )
    return 'YAMAHA (Motor)'

  if (
    j.includes('VARIO') ||
    j.includes('BEAT') ||
    j.includes('SCOOPY') ||
    j.includes('PCX') ||
    j.includes('ADV') ||
    j.includes('GENIO') ||
    j.includes('REVO') ||
    j.includes('SUPRA') ||
    j.includes('BLADE') ||
    j.includes('SPACY') ||
    j.includes('CBR') ||
    j.includes('CB150') ||
    j.includes('SONIC') ||
    j.includes('MEGAPRO') ||
    j.includes('TIGER')
  )
    return 'HONDA (Motor)'

  if (j.includes('QJ')) return 'QJ MOTOR'
  if (j.includes('MOTOR LISTRIK')) return 'MOTOR LISTRIK'
  if (j.startsWith('MOTOR')) return 'MOTOR (Lainnya)'

  // Non-kendaraan
  if (j.includes('GENSET') || j.includes('VTOMAN') || j.includes('MOTOBATT')) return 'GENSET / BATERAI'
  if (
    j.includes('EXCAVATOR') ||
    j.includes('FORK LIFT') ||
    j.includes('FORKLIFT') ||
    j.includes('TRAKTOR') ||
    j.includes('JONDER') ||
    j.includes('PERTANIAN') ||
    j.includes('WALET') ||
    j.includes('WALLET') ||
    j.includes('ALAT')
  )
    return 'ALAT BERAT / INDUSTRI'

  if (j.includes('KAPAL')) return 'KAPAL / MARINE'
  if (j.includes('MAINAN')) return 'MAINAN / HOBI'

  return 'LAINNYA'
}

async function runDataCleansing() {
  console.log('Memulai proses data cleansing tabel vehicles...')

  let allVehicles = []
  let from = 0
  const step = 1000

  while (true) {
    const { data, error } = await client
      .from('vehicles')
      .select('id, jenis_mobil, merek_mobil')
      .range(from, from + step - 1)

    if (error) {
      console.error('Gagal mengambil data:', error.message)
      process.exit(1)
    }

    if (data) allVehicles.push(...data)
    if (!data || data.length < step) break
    from += step
  }

  console.log(`Total kendaraan diperiksa: ${allVehicles.length}`)

  const toUpdate = []
  const unknownKept = [] // merek terisi tapi tidak ada di daftar resmi: tidak diubah, hanya dilaporkan
  allVehicles.forEach((v) => {
    const targetBrand = determineStandardBrand(v.merek_mobil, v.jenis_mobil)
    const flag =
      targetBrand === 'LAINNYA'
        ? 'PERLU_CEK_LAINNYA'
        : CANONICAL_BY_UPPER.has(targetBrand.toUpperCase())
          ? ''
          : 'MEREK_TIDAK_DIKENAL'

    if (targetBrand !== v.merek_mobil) {
      toUpdate.push({ id: v.id, jenis: v.jenis_mobil, oldBrand: v.merek_mobil, newBrand: targetBrand, flag })
    } else if (flag) {
      unknownKept.push({ id: v.id, jenis: v.jenis_mobil, oldBrand: v.merek_mobil, newBrand: targetBrand, flag })
    }
  })

  // Laporan CSV (folder backups/ sudah di-.gitignore)
  const csvCell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`
  const reportRows = [
    ['id', 'jenis_mobil', 'merek_lama', 'merek_baru', 'aksi', 'catatan'],
    ...toUpdate.map((r) => [r.id, r.jenis, r.oldBrand, r.newBrand, 'UPDATE', r.flag]),
    ...unknownKept.map((r) => [r.id, r.jenis, r.oldBrand, r.newBrand, 'TIDAK_DIUBAH', r.flag]),
  ]
  const reportDir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(reportDir, { recursive: true })
  const reportPath = path.join(
    reportDir,
    `cleanse-brands-${APPLY ? 'apply' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
  )
  fs.writeFileSync(reportPath, '\ufeff' + reportRows.map((r) => r.map(csvCell).join(',')).join('\r\n'), 'utf8')

  const countLainnya = toUpdate.filter((r) => r.flag === 'PERLU_CEK_LAINNYA').length
  console.log(`Akan diseragamkan       : ${toUpdate.length} kendaraan`)
  console.log(`  - diisi "LAINNYA"     : ${countLainnya} (cek manual lewat tombol Edit kendaraan)`)
  const keptLainnya = unknownKept.filter((r) => r.flag === 'PERLU_CEK_LAINNYA').length
  console.log(`Sudah "LAINNYA"         : ${keptLainnya} (tidak diubah, cek manual lewat tombol Edit kendaraan)`)
  console.log(`Merek tidak dikenal     : ${unknownKept.length - keptLainnya} (dibiarkan, hanya dilaporkan)`)
  console.log(`Laporan                 : ${reportPath}`)

  if (!APPLY) {
    console.log('\nDRY-RUN: database TIDAK diubah. Periksa laporan, jalankan "npm run backup",')
    console.log('lalu jalankan ulang dengan: node scripts/cleanse-brands.js --apply')
    return
  }

  // Batch update in chunks of 50
  let updatedCount = 0
  const failed = []
  for (let i = 0; i < toUpdate.length; i += 50) {
    const chunk = toUpdate.slice(i, i + 50)
    const results = await Promise.all(
      chunk.map((item) =>
        client
          .from('vehicles')
          .update({ merek_mobil: item.newBrand, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      )
    )
    results.forEach((res, idx) => {
      if (res.error) failed.push({ id: chunk[idx].id, message: res.error.message })
    })
    updatedCount += chunk.length
    process.stdout.write(`\rProgres update: ${updatedCount} / ${toUpdate.length}`)
  }

  if (failed.length > 0) {
    console.error(`\n\n✗ ${failed.length} kendaraan gagal diupdate:`)
    failed.slice(0, 20).forEach((f) => console.error(`  - ${f.id}: ${f.message}`))
    process.exit(1)
  }

  console.log(`\n\n✓ Sukses! ${toUpdate.length} merek kendaraan sudah distandarisasi.`)
}

runDataCleansing().catch((err) => {
  console.error('Cleansing error:', err)
  process.exit(1)
})

