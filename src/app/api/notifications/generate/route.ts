import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
  const created: string[] = []

  const [{ data: overdueInvs }, { data: upcomingEvents }, { data: expiringQuotes }] = await Promise.all([
    supabase.from('invoices').select('id, invoice_number, total').eq('status', 'overdue'),
    supabase.from('schedule_events').select('id, title, start_at').eq('status', 'pending').gt('start_at', now.toISOString()).lte('start_at', in48h),
    supabase.from('quotes').select('id, quote_number, expiry_date').eq('status', 'sent').lte('expiry_date', in48h.slice(0, 10)),
  ])

  for (const inv of overdueInvs ?? []) {
    const key = `overdue_invoice_${inv.id}`
    const { data: existing } = await supabase.from('notifications').select('id').eq('link', `/invoices/${inv.id}`).eq('type', 'overdue_invoice').eq('read', false).maybeSingle()
    if (!existing) {
      await supabase.from('notifications').insert({ type: 'overdue_invoice', title: `Invoice #${inv.invoice_number} is overdue`, body: 'This invoice is past its due date.', link: `/invoices/${inv.id}` })
      created.push(key)
    }
  }

  for (const ev of upcomingEvents ?? []) {
    const { data: existing } = await supabase.from('notifications').select('id').eq('link', `/schedule/${ev.id}/edit`).eq('type', 'upcoming_event').eq('read', false).maybeSingle()
    if (!existing) {
      await supabase.from('notifications').insert({ type: 'upcoming_event', title: `Upcoming: ${ev.title}`, body: `Scheduled for ${new Date(ev.start_at).toLocaleString()}`, link: `/schedule/${ev.id}/edit` })
      created.push(`event_${ev.id}`)
    }
  }

  for (const q of expiringQuotes ?? []) {
    const { data: existing } = await supabase.from('notifications').select('id').eq('link', `/quotes/${q.id}`).eq('type', 'quote_expiring').eq('read', false).maybeSingle()
    if (!existing) {
      await supabase.from('notifications').insert({ type: 'quote_expiring', title: `Quote #${q.quote_number} is expiring soon`, body: `Expires on ${q.expiry_date}`, link: `/quotes/${q.id}` })
      created.push(`quote_${q.id}`)
    }
  }

  return NextResponse.json({ created: created.length })
}
