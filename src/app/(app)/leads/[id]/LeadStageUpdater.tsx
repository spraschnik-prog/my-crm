'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { STAGES, stageColor } from '@/lib/leadUtils'
import { cn } from '@/lib/utils'

export default function LeadStageUpdater({ id, currentStage }: { id: string; currentStage: string }) {
  const router = useRouter()
  const [stage, setStage] = useState(currentStage)
  const [saving, setSaving] = useState(false)

  async function update(newStage: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('leads').update({ stage: newStage }).eq('id', id)
    setStage(newStage)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map(s => (
        <button key={s} disabled={saving} onClick={() => update(s)}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full font-medium transition-all border-2 capitalize',
            stage === s
              ? `${stageColor[s]} border-current`
              : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
          )}>
          {s}
        </button>
      ))}
    </div>
  )
}
