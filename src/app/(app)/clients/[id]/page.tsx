import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import { ArrowLeft, Pencil } from 'lucide-react'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: invoices }, { data: quotes }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('invoices').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('quotes').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ])

  if (!client) notFound()

  const totalBilled = (invoices ?? []).reduce((s, i) => s + Number(i.total), 0)
  const totalPaid = (invoices ?? []).filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clients" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
          {client.company && <p className="text-slate-500 text-sm">{client.company}</p>}
        </div>
        <Link href={`/clients/${id}/edit`} className="inline-flex items-center gap-2 text-sm font-medium border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Pencil className="w-4 h-4" /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Info */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-sm">
            <h2 className="font-semibold text-slate-900 mb-1">Contact Info</h2>
            {client.email && <Info label="Email" value={client.email} />}
            {client.phone && <Info label="Phone" value={client.phone} />}
            {(client.address || client.city) && (
              <Info label="Address" value={[client.address, client.city, client.state, client.zip].filter(Boolean).join(', ')} />
            )}
            {client.notes && <Info label="Notes" value={client.notes} />}
            <Info label="Added" value={formatDate(client.created_at)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-lg font-bold text-slate-900">{formatCurrency(totalBilled)}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total Billed</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total Paid</div>
            </div>
          </div>
        </div>

        {/* Invoices + Quotes */}
        <div className="xl:col-span-2 space-y-6">
          <Section title="Invoices" href={`/invoices/new?client=${id}`} linkLabel="New Invoice">
            {(invoices ?? []).length === 0 ? (
              <p className="text-slate-400 text-sm px-5 py-4">No invoices yet.</p>
            ) : (invoices ?? []).map(inv => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-900">#{inv.invoice_number}</div>
                  <div className="text-xs text-slate-400">{formatDate(inv.issue_date)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(inv.status)}`}>{inv.status}</span>
                  <span className="text-sm font-semibold">{formatCurrency(inv.total)}</span>
                </div>
              </Link>
            ))}
          </Section>

          <Section title="Quotes" href={`/quotes/new?client=${id}`} linkLabel="New Quote">
            {(quotes ?? []).length === 0 ? (
              <p className="text-slate-400 text-sm px-5 py-4">No quotes yet.</p>
            ) : (quotes ?? []).map(q => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-900">#{q.quote_number}</div>
                  <div className="text-xs text-slate-400">{formatDate(q.issue_date)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(q.status)}`}>{q.status}</span>
                  <span className="text-sm font-semibold">{formatCurrency(q.total)}</span>
                </div>
              </Link>
            ))}
          </Section>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400 font-medium">{label}</dt>
      <dd className="text-slate-700 mt-0.5">{value}</dd>
    </div>
  )
}

function Section({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <Link href={href} className="text-indigo-600 text-sm hover:underline">{linkLabel}</Link>
      </div>
      {children}
    </div>
  )
}
