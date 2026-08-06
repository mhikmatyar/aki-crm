import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WALogsClient } from '@/components/wa-logs/WALogsClient'

export const dynamic = 'force-dynamic'

export default async function WALogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, cabang_id')
    .eq('id', user.id)
    .single()

  const { data: logs } = await supabase
    .from('wa_logs')
    .select('*, branches(nama_cabang)')
    .order('waktu_kirim', { ascending: false })

  const isSuperAdmin = profile?.role === 'super_admin'

  return <WALogsClient initialLogs={logs || []} isSuperAdmin={isSuperAdmin} />
}
