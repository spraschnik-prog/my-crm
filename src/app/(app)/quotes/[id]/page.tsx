import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import { ArrowLeft, Pencil, Download, FileText } from 'lucide-react'
import DownloadPdfButton from './DownloadPdfButton'
import StatusUpdater from './StatusUpdater'
import ConvertToInvoiceButton from './ConvertToInvoiceButton'

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, clients(*), quote_items(*)')
    .eq('id', id)
    .single()

  if (!quote) notFound()

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/quotes" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Quote #{quote.quote_number}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(quote.status)}`}>{quote.status}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{quote.clients?.name ?? '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton quote={quote} />
          {quote.status !== 'accepted' && (
            <Link href={`/quotes/${id}/edit`} className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          )}
          {quote.status === 'accepted' && (
            <ConvertToInvoiceButton quoteId={id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          {/* Line items */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Description</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-600">Qty</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-600">Unit Price</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(quote.quote_items ?? []).map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 text-slate-700">{item.description}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-5 py-4 space-y-1.5 text-sm">
              <TotalRow label="Subtotal" value={formatCurrency(quote.subtotal)} />
              {quote.discount > 0 && <TotalRow label="Discount" value={`-${formatCurrency(quote.discount)}`} />}
              {quote.tax_rate > 0 && <TotalRow label={`Tax (${quote.tax_rate}%)`} value={formatCurrency(quote.tax_amount)} />}
              <TotalRow label="Total" value={formatCurrency(quote.total)} bold />
            </div>
          </div>

          {quote.notes && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-medium text-slate-700 mb-2 text-sm">Notes</h3>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-sm space-y-3">
            <h2 className="font-semibold text-slate-900">Details</h2>
            <Info label="Client" value={quote.clients?.name ?? '—'} />
            {quote.clients?.email && <Info label="Email" value={quote.clients.email} />}
            <Info label="Issue Date" value={formatDate(quote.issue_date)} />
            {quote.expiry_date && <Info label="Expiry" value={formatDate(quote.expiry_date)} />}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-3 text-sm">Update Status</h2>
            <StatusUpdater id={id} currentStatus={quote.status} type="quote" />
          </div>
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

function TotalRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-slate-900 text-base mt-1' : 'text-slate-600'}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
