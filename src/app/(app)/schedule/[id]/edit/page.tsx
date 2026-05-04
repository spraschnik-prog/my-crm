'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

export default function EditEventPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [leads, setLeads] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({ title: '', description: '', event_type: 'task', client_id: '', lead_id: '', start_at: '', end_at: '', status: 'pending' })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('clients').select('id,name').order('name'),
      supabase.from('leads').select('id,name').order('name'),
      supabase.from('schedule_events').select('*').eq('id', id).single(),
    ]).then(([{ data: c }, { data: l }, { data: ev }]) => {
      setClients(c ?? [])
      setLeads(l ?? [])
      if (ev) setForm({
        title: ev.title, description: ev.description ?? '', event_type: ev.event_type,
        client_id: ev.client_id ?? '', lead_id: ev.lead_id ?? '',
        start_at: ev.start_at?.slice(0, 16) ?? '', end_at: ev.end_at?.slice(0, 16) ?? '',
        status: ev.status,
      })
    })
  }, [id])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await createClient().from('schedule_events').update({
      title: form.title, description: form.description || null, event_type: form.event_type,
      client_id: form.client_id || null, lead_id: form.lead_id || null,
      start_at: form.start_at, end_at: form.end_at || null, status: form.status,
    }).eq('id', id)
    router.push('/schedule')
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return
    await createClient().from('schedule_events').delete().eq('id', id)
    router.push('/schedule')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/schedule" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select value={form.event_type} onChange={e => set('event_type', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {['meeting','call','followup','task'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {['pending','completed','cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start</label>
            <input type="datetime-local" value={form.start_at} onChange={e => set('start_at', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End</label>
            <input type="datetime-local" value={form.end_at} onChange={e => set('end_at', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client</label>
            <select value={form.client_id} onChange={e => set('client_id', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— None —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead</label>
            <select value={form.lead_id} onChange={e => set('lead_id', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— None —</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link href="/schedule" className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg border border-slate-200">Cancel</Link>
          </div>
          <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </form>
    </div>
  )
}
