import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('branches')
      .select('id, nama_cabang, kota')
      .eq('aktif', true)
      .order('nama_cabang', { ascending: true })

    if (error) {
      console.error('Error fetching branches:', error)
      return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
