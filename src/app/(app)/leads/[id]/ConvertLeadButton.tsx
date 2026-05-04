'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'
import type { Lead } from '@/types'

export default function ConvertLeadButton({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function convert() {
    if (!confirm(`Convert "${lead.name}" to a client?`)) return
    setLoading(true)
    const supabase = createClient()
    const { data: client } = await supabase.from('clients').insert([{
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes,
    }]).select().single()

    await supabase.from('leads').update({ stage: 'won' }).eq('id', lead.id)
    if (client) router.push(`/clients/${client.id}`)
    else { setLoading(false); router.refresh() }
  }

  return (
    <button onClick={convert} disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm font-medium bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
      <UserPlus className="w-3.5 h-3.5" />
      {loading ? 'Converting…' : 'Convert to Client'}
    </button>
  )
}
