import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: myRecord } = await supabase.from('team_members').select('role').eq('user_id', user.id).maybeSingle()
  if (myRecord && myRecord.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
  }

  const { email, role } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const admin = createAdminClient(supabaseUrl, serviceKey)

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard`,
    data: { invited_role: role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('team_members').upsert({
    user_id: data.user.id,
    role: role ?? 'member',
    invited_email: email,
  }, { onConflict: 'user_id' })

  return NextResponse.json({ success: true })
}
