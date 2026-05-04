import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign } from 'lucide-react'

const METHOD_COLOR: Record<string, string> = {
  cash:          'bg-green-100 text-green-700',
  check:         'bg-blue-100 text-blue-700',
  credit_card:   'bg-purple-100 text-purple-700',
  bank_transfer: 'bg-teal-100 text-teal-700',
  other:         'bg-slate-100 text-slate-600',
}

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*, invoices(invoice_number, clients(name))')
    .order('payment_date', { ascending: false })

  const total = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const thisMonth = (payments ?? [])
    .filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth())
    .reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 text-sm mt-1">All recorded payments across invoices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Total Received</div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(total)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">This Month</div>
          <div className="text-xl font-bold text-indigo-600">{formatCurrency(thisMonth)}</div>
        </div>
      </div>

      {(!payments || payments.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No payments recorded yet</p>
          <p className="text-slate-400 text-sm mt-1">Record payments on an invoice to see them here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Client</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Invoice</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Method</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Notes</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(payments as any[]).map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(p.payment_date)}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{p.invoices?.clients?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    {p.invoices ? (
                      <Link href={`/invoices/${p.invoice_id}`} className="text-indigo-600 hover:underline">
                        #{p.invoices.invoice_number}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${METHOD_COLOR[p.payment_method] ?? 'bg-slate-100 text-slate-600'}`}>
                      {p.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{p.notes ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-green-600">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
