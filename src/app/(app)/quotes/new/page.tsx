'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LineItemEditor, { type DraftItem } from '@/components/LineItemEditor'
import { formatCurrency } from '@/lib/utils'
import type { Client } from '@/types'

export default function NewQuotePage() {
  return <Suspense><NewQuoteForm /></Suspense>
}

function NewQuoteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [items, setItems] = useState<DraftItem[]>([
    { id: crypto.randomUUID(), product_id: '', description: '', quantity: '1', unit_price: '', total: 0 }
  ])
  const [form, setForm] = useState({
    client_id: searchParams.get('client') ?? '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    tax_rate: '0',
    discount: '0',
    notes: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('clients').select('*').order('name').then(({ data }) => setClients(data ?? []))
  }, [])

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discount = parseFloat(form.discount) || 0
  const taxRate = parseFloat(form.tax_rate) || 0
  const taxAmount = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + taxAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { setError('Add at least one line item.'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: seqData } = await supabase.rpc('nextval', { seq: 'quote_seq' }).single() as any
    const quoteNumber = `Q-${(seqData ?? Math.floor(Math.random() * 9000) + 1000)}`

    const { data: quote, error: qErr } = await supabase.from('quotes').insert([{
      client_id: form.client_id || null,
      quote_number: quoteNumber,
      status: 'draft',
      issue_date: form.issue_date,
      expiry_date: form.expiry_date || null,
      notes: form.notes || null,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount,
      total,
    }]).select().single()

    if (qErr || !quote) { setError(qErr?.message ?? 'Failed to create quote'); setSaving(false); return }

    const lineItems = items.map(i => ({
      quote_id: quote.id,
      product_id: i.product_id || null,
      description: i.description,
      quantity: parseFloat(i.quantity) || 1,
      unit_price: parseFloat(i.unit_price) || 0,
      total: i.total,
    }))

    const { error: itemErr } = await supabase.from('quote_items').insert(lineItems)
    if (itemErr) { setError(itemErr.message); setSaving(false); return }

    router.push(`/quotes/${quote.id}`)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/quotes" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">New Quote</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

        {/* Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Client</label>
              <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">— Select client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Date *</label>
              <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Line Items</h2>
          <LineItemEditor items={items} onChange={setItems} />
        </div>

        {/* Totals + Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4}
                placeholder="Payment terms, special conditions…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="w-64 space-y-3">
              <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600 w-20 shrink-0">Discount</label>
                <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                  min="0" step="0.01" className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600 w-20 shrink-0">Tax %</label>
                <input type="number" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))}
                  min="0" step="0.01" className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              {taxRate > 0 && <TotalRow label={`Tax (${taxRate}%)`} value={formatCurrency(taxAmount)} />}
              <div className="border-t border-slate-200 pt-2">
                <TotalRow label="Total" value={formatCurrency(total)} bold />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg">
            {saving ? 'Saving…' : 'Create Quote'}
          </button>
          <Link href="/quotes" className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg border border-slate-200">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function TotalRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
