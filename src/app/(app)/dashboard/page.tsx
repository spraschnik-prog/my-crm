import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { stageColor } from '@/lib/leadUtils'
import Link from 'next/link'
import { Users, FileText, Receipt, DollarSign, AlertCircle, TrendingUp, Calendar } from 'lucide-react'

function formatDateTime(dt: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(dt))
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: clientCount },
    { data: invoices },
    { data: quotes },
    { data: leads },
    { data: recentInvoices },
    { data: upcomingEvents },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('total, paid_amount, status'),
    supabase.from('quotes').select('status'),
    supabase.from('leads').select('stage, expected_value, name, id'),
    supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('schedule_events').select('*, clients(name)').eq('status', 'pending').gte('start_at', new Date().toISOString()).order('start_at').limit(5),
    supabase.from('expenses').select('amount'),
  ])

  const totalRevenue = (invoices ?? []).filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const outstanding = (invoices ?? []).filter(i => ['sent','overdue'].includes(i.status)).reduce((s, i) => s + (Number(i.total) - Number(i.paid_amount)), 0)
  const overdueCount = (invoices ?? []).filter(i => i.status === 'overdue').length
  const openQuotes = (quotes ?? []).filter(q => ['draft','sent'].includes(q.status)).length
  const pipelineValue = (leads ?? []).filter(l => !['won','lost'].includes(l.stage)).reduce((s, l) => s + Number(l.expected_value), 0)
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const activeLeads = (leads ?? []).filter(l => !['won','lost'].includes(l.stage))

  const stats = [
    { label: 'Total Revenue',  value: formatCurrency(totalRevenue),  icon: DollarSign, color: 'bg-green-500' },
    { label: 'Outstanding',    value: formatCurrency(outstanding),   icon: Receipt,    color: 'bg-yellow-500' },
    { label: 'Clients',        value: clientCount ?? 0,             icon: Users,      color: 'bg-indigo-500' },
    { label: 'Open Quotes',    value: openQuotes,                   icon: FileText,   color: 'bg-purple-500' },
    { label: 'Pipeline Value', value: formatCurrency(pipelineValue),icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: Receipt,   color: 'bg-rose-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back — here's your overview.</p>
      </div>

      {overdueCount > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>You have <strong>{overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}</strong>. <Link href="/invoices?status=overdue" className="underline">View them →</Link></span>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 font-medium">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming events */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Upcoming</h2>
            <Link href="/schedule" className="text-indigo-600 text-sm hover:underline">View all</Link>
          </div>
          {(upcomingEvents ?? []).length === 0 ? (
            <p className="text-slate-400 text-sm px-5 py-6 text-center">No upcoming events.</p>
          ) : (upcomingEvents ?? []).map((ev: any) => (
            <Link key={ev.id} href={`/schedule/${ev.id}/edit`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
              <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">{ev.title}</div>
                <div className="text-xs text-slate-400">{formatDateTime(ev.start_at)}{ev.clients?.name ? ` · ${ev.clients.name}` : ''}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Recent invoices */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Invoices</h2>
              <Link href="/invoices" className="text-indigo-600 text-sm hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {(recentInvoices ?? []).length === 0 && <p className="text-slate-400 text-sm px-5 py-6 text-center">No invoices yet.</p>}
              {(recentInvoices ?? []).map((inv: any) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{inv.clients?.name ?? 'Unknown'}</div>
                    <div className="text-xs text-slate-400">#{inv.invoice_number} · {formatDate(inv.issue_date)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(inv.status)}`}>{inv.status}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active leads */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Active Leads</h2>
              <Link href="/leads" className="text-indigo-600 text-sm hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {activeLeads.length === 0 && <p className="text-slate-400 text-sm px-5 py-6 text-center">No active leads.</p>}
              {activeLeads.slice(0, 5).map((l: any) => (
                <Link key={l.id} href={`/leads/${l.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="text-sm font-medium text-slate-900">{l.name}</div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageColor[l.stage]}`}>{l.stage}</span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(l.expected_value)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
