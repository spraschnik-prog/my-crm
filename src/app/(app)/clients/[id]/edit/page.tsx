'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    address: '', city: '', state: '', zip: '', country: 'US', notes: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('clients').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        company: data.company ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip: data.zip ?? '',
        country: data.country ?? 'US',
        notes: data.notes ?? '',
      })
    })
  }, [id])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('clients').update({
      ...form,
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      notes: form.notes || null,
    }).eq('id', id)
    if (error) { setError(error.message); setSaving(false) }
    else router.push(`/clients/${id}`)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/clients/${id}`} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name *" value={form.name} onChange={v => set('name', v)} required />
          <Field label="Company" value={form.company} onChange={v => set('company', v)} />
          <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} />
          <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} />
        </div>

        <hr className="border-slate-100" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="Street Address" value={form.address} onChange={v => set('address', v)} /></div>
          <Field label="City" value={form.city} onChange={v => set('city', v)} />
          <Field label="State" value={form.state} onChange={v => set('state', v)} />
          <Field label="ZIP" value={form.zip} onChange={v => set('zip', v)} />
          <Field label="Country" value={form.country} onChange={v => set('country', v)} />
        </div>

        <hr className="border-slate-100" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href={`/clients/${id}`} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg border border-slate-200 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  )
}
