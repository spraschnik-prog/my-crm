import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (id === 'all') {
    await supabase.from('notifications').update({ read: true }).eq('read', false)
  } else {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }
  return NextResponse.json({ success: true })
}
