'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { STAGES } from '@/lib/leadUtils'

export default function NewLeadPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    source: '', stage: 'new', expected_value: '', notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('leads').insert([{
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      source: form.source || null,
      stage: form.stage,
      expected_value: parseFloat(form.expected_value) || 0,
      notes: form.notes || null,
    }])
    if (error) { setError(error.message); setSaving(false) }
    else router.push('/leads')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/leads" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">New Lead</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name *" value={form.name} onChange={v => set('name', v)} required />
          <Field label="Company" value={form.company} onChange={v => set('company', v)} />
          <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} />
          <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Stage</label>
            <select value={form.stage} onChange={e => set('stage', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize">
              {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <Field label="Expected Value ($)" type="number" value={form.expected_value} onChange={v => set('expected_value', v)} />
          <div className="col-span-2">
            <Field label="Source" value={form.source} onChange={v => set('source', v)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg">
            {saving ? 'Saving…' : 'Save Lead'}
          </button>
          <Link href="/leads" className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg border border-slate-200">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} step={type === 'number' ? '0.01' : undefined}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  )
}
