import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, email, password, role } = body

    if (!nama || !email || !password || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    }

    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !newUser.user) {
      return NextResponse.json(
        { error: authError?.message || 'Gagal membuat user auth.' },
        { status: 400 }
      )
    }

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: newUser.user.id,
      email,
      nama,
      role,
      aktif: true,
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: newUser.user.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 })
  }
}
