import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import InviteForm from './InviteForm'
import RemoveMemberButton from './RemoveMemberButton'

export default async function TeamSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at')

  const { data: myRecord } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  const isAdmin = myRecord?.role === 'admin' || !myRecord

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Team Settings</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Members</h2>
        </div>

        {(members ?? []).length === 0 ? (
          <p className="text-slate-400 text-sm">No team members yet. You're the sole owner.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(members ?? []).map((m: any) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.invited_email ?? m.user_id}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                    m.role === 'viewer' ? 'bg-slate-100 text-slate-600' :
                    'bg-green-100 text-green-700'
                  }`}>{m.role}</span>
                </div>
                {isAdmin && m.user_id !== user?.id && (
                  <RemoveMemberButton id={m.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Invite a Member</h2>
          <InviteForm />
        </div>
      )}
    </div>
  )
}
