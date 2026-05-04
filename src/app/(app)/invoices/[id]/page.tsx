import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import { ArrowLeft, Pencil } from 'lucide-react'
import DownloadPdfButton from './DownloadPdfButton'
import StatusUpdater from '../../quotes/[id]/StatusUpdater'
import RecordPaymentForm from './RecordPaymentForm'
import SendEmailButton from '@/components/SendEmailButton'
import Attachments from '@/components/Attachments'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: invoice }, { data: attachments }] = await Promise.all([
    supabase.from('invoices').select('*, clients(*), invoice_items(*)').eq('id', id).single(),
    supabase.from('attachments').select('*').eq('entity_type', 'invoice').eq('entity_id', id).order('created_at'),
  ])

  if (!invoice) notFound()

  const balance = invoice.total - invoice.paid_amount

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/invoices" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Invoice #{invoice.invoice_number}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(invoice.status)}`}>{invoice.status}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{invoice.clients?.name ?? '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton invoice={invoice} />
          <SendEmailButton type="invoice" id={id} clientEmail={invoice.clients?.email} />
          {invoice.status !== 'paid' && (
            <Link href={`/invoices/${id}/edit`} className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
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
                {(invoice.invoice_items ?? []).map((item: any) => (
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
              <TotalRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
              {invoice.discount > 0 && <TotalRow label="Discount" value={`-${formatCurrency(invoice.discount)}`} />}
              {invoice.tax_rate > 0 && <TotalRow label={`Tax (${invoice.tax_rate}%)`} value={formatCurrency(invoice.tax_amount)} />}
              <TotalRow label="Total" value={formatCurrency(invoice.total)} bold />
              {invoice.paid_amount > 0 && <TotalRow label="Paid" value={`-${formatCurrency(invoice.paid_amount)}`} />}
              {balance > 0 && <TotalRow label="Balance Due" value={formatCurrency(balance)} bold />}
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-medium text-slate-700 mb-2 text-sm">Notes</h3>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-sm space-y-3">
            <h2 className="font-semibold text-slate-900">Details</h2>
            <Info label="Client" value={invoice.clients?.name ?? '—'} />
            {invoice.clients?.email && <Info label="Email" value={invoice.clients.email} />}
            <Info label="Issue Date" value={formatDate(invoice.issue_date)} />
            {invoice.due_date && <Info label="Due Date" value={formatDate(invoice.due_date)} />}
            <Info label="Balance Due" value={balance > 0 ? formatCurrency(balance) : 'Paid in full'} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-3 text-sm">Update Status</h2>
            <StatusUpdater id={id} currentStatus={invoice.status} type="invoice" />
          </div>

          {invoice.status !== 'paid' && balance > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3 text-sm">Record Payment</h2>
              <RecordPaymentForm id={id} balance={balance} />
            </div>
          )}
          <Attachments entityType="invoice" entityId={id} initialAttachments={attachments ?? []} />
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
