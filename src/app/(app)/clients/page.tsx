import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'
import SearchInput from '@/components/SearchInput'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('clients').select('*').order('name')
  if (search) query = query.ilike('name', `%${search}%`)
  const { data: clients } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clients?.length ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search clients…" />
          <Link href="/clients/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Client
          </Link>
        </div>
      </div>

      {(!clients || clients.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search ? `No clients matching "${search}"` : 'No clients yet'}</p>
          {!search && (
            <Link href="/clients/new" className="inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New Client
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Company</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Phone</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/clients/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{c.name}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{c.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
