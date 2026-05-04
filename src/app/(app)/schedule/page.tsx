import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Plus, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react'
import StatusFilter from '@/components/StatusFilter'
import SearchInput from '@/components/SearchInput'
import CompleteEventButton from './CompleteEventButton'
import { cn } from '@/lib/utils'

const EVENT_TYPES: Record<string, string> = {
  meeting:   'bg-blue-100 text-blue-700',
  call:      'bg-purple-100 text-purple-700',
  followup:  'bg-yellow-100 text-yellow-700',
  task:      'bg-slate-100 text-slate-700',
}

const STATUS_ICON: Record<string, React.ElementType> = {
  pending:   Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
}

function formatDateTime(dt: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(dt))
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('schedule_events')
    .select('*, clients(name), leads(name)')
    .order('start_at', { ascending: true })

  if (status && status !== 'all') query = query.eq('status', status)
  else query = query.neq('status', 'cancelled')
  if (search) query = query.ilike('title', `%${search}%`)

  const { data: events } = await query

  const now = new Date()
  const upcoming = (events ?? []).filter(e => new Date(e.start_at) >= now)
  const past = (events ?? []).filter(e => new Date(e.start_at) < now)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">{upcoming.length} upcoming</p>
        </div>
        <Link href="/schedule/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Event
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <StatusFilter statuses={['pending', 'completed', 'cancelled']} />
        <SearchInput placeholder="Search events…" />
      </div>

      {(!events || events.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No events found</p>
          <Link href="/schedule/new" className="inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> New Event
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <Section title="Upcoming" events={upcoming} />
          )}
          {past.length > 0 && (
            <Section title="Past" events={past} muted />
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, events, muted = false }: { title: string; events: any[]; muted?: boolean }) {
  return (
    <div>
      <h2 className={cn('text-xs font-semibold uppercase tracking-wider mb-3', muted ? 'text-slate-400' : 'text-slate-600')}>{title}</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
        {events.map(ev => {
          const Icon = STATUS_ICON[ev.status] ?? Clock
          return (
            <div key={ev.id} className={cn('flex items-start gap-4 px-5 py-4', muted && 'opacity-60')}>
              <div className="mt-0.5">
                <Icon className={cn('w-4 h-4', ev.status === 'completed' ? 'text-green-500' : ev.status === 'cancelled' ? 'text-slate-400' : 'text-indigo-500')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/schedule/${ev.id}/edit`} className="font-medium text-slate-900 hover:text-indigo-600 text-sm">{ev.title}</Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVENT_TYPES[ev.event_type] ?? 'bg-slate-100 text-slate-600'}`}>{ev.event_type}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatDateTime(ev.start_at)}
                  {ev.clients?.name && <span className="ml-2">· {ev.clients.name}</span>}
                  {ev.leads?.name && <span className="ml-2">· {ev.leads.name} (lead)</span>}
                </div>
                {ev.description && <p className="text-xs text-slate-500 mt-1 truncate">{ev.description}</p>}
              </div>
              {ev.status === 'pending' && <CompleteEventButton id={ev.id} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
