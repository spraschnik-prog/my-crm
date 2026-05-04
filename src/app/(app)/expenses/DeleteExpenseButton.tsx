'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter()
  async function del() {
    if (!confirm('Delete this expense?')) return
    await createClient().from('expenses').delete().eq('id', id)
    router.refresh()
  }
  return <button onClick={del} className="text-xs text-red-400 hover:text-red-600 font-medium">Delete</button>
}
