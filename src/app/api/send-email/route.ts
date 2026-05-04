import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { invoiceEmail, quoteEmail, notificationEmail } from '@/lib/emailTemplates'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, id, to } = body

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://my-crm-seven-kappa.vercel.app'

  try {
    let subject = ''
    let html = ''

    if (type === 'invoice') {
      const { data: inv } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .eq('id', id)
        .single()
      if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      ({ subject, html } = invoiceEmail(inv, appUrl))
    } else if (type === 'quote') {
      const { data: quote } = await supabase
        .from('quotes')
        .select('*, clients(*), quote_items(*)')
        .eq('id', id)
        .single()
      if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      ({ subject, html } = quoteEmail(quote, appUrl))
    } else if (type === 'notification') {
      const { title, body: bodyText } = body;
      ({ subject, html } = notificationEmail(title, bodyText))
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'MyCRM <noreply@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
