'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
]

export default function RecordPaymentForm({ id, balance }: { id: string; balance: number }) {
  const router = useRouter()
  const [amount, setAmount] = useState(String(balance.toFixed(2)))
  const [method, setMethod] = useState('other')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: inv } = await supabase.from('invoices').select('paid_amount, total').eq('id', id).single()
    if (!inv) { setSaving(false); return }

    const paid = parseFloat(amount) || 0
    const newPaid = Math.min(Number(inv.paid_amount) + paid, Number(inv.total))
    const newStatus = newPaid >= Number(inv.total) ? 'paid' : 'sent'

    await Promise.all([
      supabase.from('invoices').update({ paid_amount: newPaid, status: newStatus }).eq('id', id),
      supabase.from('payments').insert([{
        invoice_id: id,
        amount: paid,
        payment_date: paymentDate,
        payment_method: method,
        notes: notes || null,
      }]),
    ])

    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Amount ({formatCurrency(balance)} due)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          min="0.01" step="0.01" max={balance} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Method</label>
        <select value={method} onChange={e => setMethod(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Date</label>
        <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Notes</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <button type="submit" disabled={saving}
        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
        {saving ? 'Recording…' : 'Record Payment'}
      </button>
    </form>
  )
}
