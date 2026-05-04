import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft, Pencil, UserPlus } from 'lucide-react'
import { stageColor, STAGES } from '@/lib/leadUtils'
import LeadStageUpdater from './LeadStageUpdater'
import ConvertLeadButton from './ConvertLeadButton'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single()
  if (!lead) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/leads" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageColor[lead.stage]}`}>{lead.stage}</span>
          </div>
          {lead.company && <p className="text-slate-500 text-sm">{lead.company}</p>}
        </div>
        <div className="flex items-center gap-2">
          {lead.stage !== 'won' && lead.stage !== 'lost' && <ConvertLeadButton lead={lead} />}
          <Link href={`/leads/${id}/edit`} className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-sm">
            <h2 className="font-semibold text-slate-900">Details</h2>
            {lead.email && <Info label="Email" value={lead.email} />}
            {lead.phone && <Info label="Phone" value={lead.phone} />}
            {lead.source && <Info label="Source" value={lead.source} />}
            <Info label="Expected Value" value={formatCurrency(lead.expected_value)} />
            <Info label="Added" value={formatDate(lead.created_at)} />
            {lead.notes && <Info label="Notes" value={lead.notes} />}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Move Stage</h2>
            <LeadStageUpdater id={id} currentStage={lead.stage} />
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
