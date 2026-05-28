import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ClaimTable from '@/components/claims/ClaimTable'

interface PageProps {
  searchParams: { status?: string }
}

export const dynamic = 'force-dynamic'

export default async function ClaimsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, cabang_id')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  let query = supabase
    .from('claims')
    .select('*, customers(*, branches(nama_cabang, kota))')
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: claims } = await query

  const statuses = [
    { value: 'all', label: 'Semua' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'done', label: 'Selesai' },
  ]

  const activeCount = (claims || []).filter((c) => c.status === 'aktif').length
  const doneCount = (claims || []).filter((c) => c.status === 'done').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Klaim</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} aktif · {doneCount} selesai
          </p>
        </div>
        <Link
          href="/claims/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Buat Klaim
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={`/claims?status=${s.value}`}
              className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                (searchParams.status || 'all') === s.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <ClaimTable
        claims={(claims as any) || []}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  )
}
