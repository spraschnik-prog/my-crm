'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Receipt } from 'lucide-react'

export default function ConvertToInvoiceButton({ quoteId }: { quoteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function convert() {
    if (!confirm('Convert this quote to an invoice?')) return
    setLoading(true)
    const supabase = createClient()

    const { data: quote } = await supabase
      .from('quotes')
      .select('*, quote_items(*)')
      .eq('id', quoteId)
      .single()

    if (!quote) { setLoading(false); return }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

    const { data: invoice, error } = await supabase.from('invoices').insert([{
      client_id: quote.client_id,
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: null,
      notes: quote.notes,
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      tax_amount: quote.tax_amount,
      discount: quote.discount,
      total: quote.total,
      paid_amount: 0,
    }]).select().single()

    if (error || !invoice) { setLoading(false); return }

    const items = (quote.quote_items ?? []).map((i: any) => ({
      invoice_id: invoice.id,
      product_id: i.product_id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total: i.total,
    }))

    await supabase.from('invoice_items').insert(items)
    router.push(`/invoices/${invoice.id}`)
  }

  return (
    <button
      onClick={convert}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm font-medium bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
    >
      <Receipt className="w-3.5 h-3.5" />
      {loading ? 'Converting…' : 'Convert to Invoice'}
    </button>
  )
}
