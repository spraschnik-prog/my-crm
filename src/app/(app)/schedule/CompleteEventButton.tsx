'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function CompleteEventButton({ id }: { id: string }) {
  const router = useRouter()

  async function complete() {
    await createClient().from('schedule_events').update({ status: 'completed' }).eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={complete} title="Mark complete"
      className="flex-shrink-0 text-slate-300 hover:text-green-500 transition-colors">
      <CheckCircle2 className="w-4 h-4" />
    </button>
  )
}
