import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { Plus, Receipt } from 'lucide-react'
import StatusFilter from '@/components/StatusFilter'
import SearchInput from '@/components/SearchInput'

const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  if (search) query = query.ilike('invoice_number', `%${search}%`)
  const { data: invoices } = await query

  const totals = {
    outstanding: (invoices ?? []).filter(i => ['sent','overdue'].includes(i.status)).reduce((s, i) => s + (Number(i.total) - Number(i.paid_amount)), 0),
    paid: (invoices ?? []).filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">{invoices?.length ?? 0} shown</p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Outstanding</div>
          <div className="text-xl font-bold text-yellow-600">{formatCurrency(totals.outstanding)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Paid (shown)</div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <StatusFilter statuses={INVOICE_STATUSES} />
        <SearchInput placeholder="Search invoice #…" />
      </div>

      {(!invoices || invoices.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No invoices found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Invoice #</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Client</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Issue Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Due Date</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Total</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(invoices as any[]).map(inv => {
                const balance = inv.total - inv.paid_amount
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-indigo-600 hover:underline">#{inv.invoice_number}</Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{inv.clients?.name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(inv.status)}`}>{inv.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.issue_date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {balance > 0 ? formatCurrency(balance) : 'Paid'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
