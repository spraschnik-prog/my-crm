import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { Plus, FileText } from 'lucide-react'
import StatusFilter from '@/components/StatusFilter'
import SearchInput from '@/components/SearchInput'

const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'declined']

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('quotes').select('*, clients(name)').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  if (search) query = query.ilike('quote_number', `%${search}%`)
  const { data: quotes } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
          <p className="text-slate-500 text-sm mt-1">{quotes?.length ?? 0} shown</p>
        </div>
        <Link href="/quotes/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Quote
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <StatusFilter statuses={QUOTE_STATUSES} />
        <SearchInput placeholder="Search quote #…" />
      </div>

      {(!quotes || quotes.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No quotes found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Quote #</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Client</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Issue Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Expiry</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(quotes as any[]).map(q => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/quotes/${q.id}`} className="font-medium text-indigo-600 hover:underline">#{q.quote_number}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{q.clients?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(q.status)}`}>{q.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(q.issue_date)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(q.expiry_date)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatCurrency(q.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
