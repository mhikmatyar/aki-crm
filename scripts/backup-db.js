const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local if present
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

async function runBackup() {
  console.log('Memulai proses backup database Supabase...')
  const tables = [
    'customer_profiles',
    'vehicles',
    'vehicle_purchases',
    'customers',
    'claims',
    'wa_logs',
    'branches',
    'user_profiles',
  ]

  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {},
  }

  const backupDir = path.join(__dirname, '..', 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  for (const table of tables) {
    let allRows = []
    let from = 0
    const step = 1000

    while (true) {
      const { data, error } = await client.from(table).select('*').range(from, from + step - 1)
      if (error) {
        console.error(`Error on ${table}:`, error.message)
        break
      }
      if (data) allRows.push(...data)
      if (!data || data.length < step) break
      from += step
    }

    backupData.tables[table] = allRows
    console.log(`✓ ${table}: ${allRows.length} baris data berhasil disalin`)
  }

  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `backup-aki-crm-${dateStr}.json`
  const filePath = path.join(backupDir, filename)

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8')
  console.log(`\n🎉 SUKSES! File backup tersimpan di:\n${filePath}`)
}

runBackup().catch((err) => {
  console.error('Backup gagal:', err)
  process.exit(1)
})

