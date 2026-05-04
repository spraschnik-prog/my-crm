'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import type { Product } from '@/types'

export type DraftItem = {
  id: string
  product_id: string
  description: string
  quantity: string
  unit_price: string
  total: number
}

type Props = {
  items: DraftItem[]
  onChange: (items: DraftItem[]) => void
}

export default function LineItemEditor({ items, onChange }: Props) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('products').select('*').order('name').then(({ data }) => setProducts(data ?? []))
  }, [])

  function addItem() {
    onChange([...items, { id: crypto.randomUUID(), product_id: '', description: '', quantity: '1', unit_price: '', total: 0 }])
  }

  function removeItem(id: string) {
    onChange(items.filter(i => i.id !== id))
  }

  function updateItem(id: string, field: string, value: string) {
    onChange(items.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'product_id') {
        const p = products.find(p => p.id === value)
        if (p) { updated.description = p.name; updated.unit_price = String(p.price) }
      }
      const qty = parseFloat(updated.quantity) || 0
      const price = parseFloat(updated.unit_price) || 0
      updated.total = qty * price
      return updated
    }))
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-2 font-medium text-slate-500 w-40">Product</th>
              <th className="text-left py-2 px-2 font-medium text-slate-500">Description</th>
              <th className="text-left py-2 px-2 font-medium text-slate-500 w-24">Qty</th>
              <th className="text-left py-2 px-2 font-medium text-slate-500 w-28">Unit Price</th>
              <th className="text-right py-2 px-2 font-medium text-slate-500 w-24">Total</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-50">
                <td className="py-2 px-2">
                  <select value={item.product_id} onChange={e => updateItem(item.id, 'product_id', e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                    <option value="">— Custom —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Description" required
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </td>
                <td className="py-2 px-2">
                  <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                    min="0" step="0.01" required
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </td>
                <td className="py-2 px-2">
                  <input type="number" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                    min="0" step="0.01" required placeholder="0.00"
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </td>
                <td className="py-2 px-2 text-right font-medium text-slate-700">{formatCurrency(item.total)}</td>
                <td className="py-2 px-1">
                  <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
        <Plus className="w-4 h-4" /> Add Line Item
      </button>
    </div>
  )
}
