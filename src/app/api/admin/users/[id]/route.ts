import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

async function authorize() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user }
}

function adminClient() {
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await authorize()
    if ('error' in auth) return auth.error
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum diatur di .env.local.' }, { status: 500 })
    }

    const body = await req.json()
    const { nama, email, role, aktif, password } = body
    if (!nama || !email || !['admin', 'super_admin'].includes(role) || typeof aktif !== 'boolean') {
      return NextResponse.json({ error: 'Data user tidak valid.' }, { status: 400 })
    }

    const supabaseAdmin = adminClient()
    const authUpdate: { email?: string; password?: string; user_metadata?: { nama: string } } = {
      email: email.trim(),
      user_metadata: { nama: nama.trim() },
    }
    if (password?.trim()) authUpdate.password = password.trim()
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(params.id, authUpdate)
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ nama: nama.trim(), email: email.trim(), role, aktif, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, email, nama, role, aktif, created_at')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await authorize()
    if ('error' in auth) return auth.error
    if (auth.user.id === params.id) return NextResponse.json({ error: 'Akun yang sedang digunakan tidak bisa dihapus.' }, { status: 400 })
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum diatur di .env.local.' }, { status: 500 })
    }
    const { error } = await adminClient().auth.admin.deleteUser(params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 })
  }
}
