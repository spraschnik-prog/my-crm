'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserMinus } from 'lucide-react'

export default function RemoveMemberButton({ id }: { id: string }) {
  const router = useRouter()

  async function remove() {
    if (!confirm('Remove this team member?')) return
    await createClient().from('team_members').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={remove} className="text-slate-300 hover:text-red-500 transition-colors">
      <UserMinus className="w-4 h-4" />
    </button>
  )
}
