'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { statusColor } from '@/lib/utils'

const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'declined']
const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function StatusUpdater({
  id, currentStatus, type,
}: { id: string; currentStatus: string; type: 'quote' | 'invoice' }) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const statuses = type === 'quote' ? QUOTE_STATUSES : INVOICE_STATUSES
  const table = type === 'quote' ? 'quotes' : 'invoices'

  async function update(newStatus: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from(table).update({ status: newStatus }).eq('id', id)
    setStatus(newStatus)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map(s => (
        <button
          key={s}
          disabled={saving}
          onClick={() => update(s)}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border-2 ${
            status === s
              ? `${statusColor(s)} border-current`
              : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
