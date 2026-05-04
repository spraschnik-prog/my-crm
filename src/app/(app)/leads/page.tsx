import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp } from 'lucide-react'
import { STAGES, stageColor, stageBar } from '@/lib/leadUtils'
import StatusFilter from '@/components/StatusFilter'
import SearchInput from '@/components/SearchInput'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('stage', status)
  if (search) query = query.ilike('name', `%${search}%`)
  const { data: leads } = await query

  const { data: all } = await supabase.from('leads').select('stage, expected_value')
  const pipeline = STAGES.map(s => ({
    stage: s,
    count: (all ?? []).filter(l => l.stage === s).length,
    value: (all ?? []).filter(l => l.stage === s).reduce((sum, l) => sum + Number(l.expected_value), 0),
  }))
  const totalPipeline = pipeline.filter(p => !['won','lost'].includes(p.stage)).reduce((s, p) => s + p.value, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm mt-1">Pipeline value: {formatCurrency(totalPipeline)}</p>
        </div>
        <Link href="/leads/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Lead
        </Link>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {pipeline.map(p => (
          <Link key={p.stage} href={`/leads?status=${p.stage}`}
            className="bg-white rounded-xl border border-slate-200 p-3 hover:border-indigo-300 transition-colors">
            <div className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${stageColor[p.stage]}`}>{p.stage}</div>
            <div className="text-lg font-bold text-slate-900">{p.count}</div>
            <div className="text-xs text-slate-500">{formatCurrency(p.value)}</div>
            <div className={`h-1 rounded-full mt-2 ${stageBar[p.stage]}`} style={{ width: p.count > 0 ? '100%' : '20%', opacity: p.count > 0 ? 1 : 0.2 }} />
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <StatusFilter statuses={[...STAGES]} />
        <SearchInput placeholder="Search leads…" />
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search ? `No leads matching "${search}"` : 'No leads yet'}</p>
          {!search && (
            <Link href="/leads/new" className="inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New Lead
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Company</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Stage</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Source</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(leads ?? []).map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/leads/${l.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{l.name}</Link>
                    {l.email && <div className="text-xs text-slate-400">{l.email}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{l.company ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageColor[l.stage]}`}>{l.stage}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{l.source ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatCurrency(l.expected_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
