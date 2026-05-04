import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Package } from 'lucide-react'
import DeleteProductButton from './DeleteProductButton'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').order('name')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products & Services</h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length ?? 0} items</p>
        </div>
        <Link href="/products/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Item
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products yet</p>
          <p className="text-slate-400 text-sm mt-1">Add products or services to use in quotes and invoices.</p>
          <Link href="/products/new" className="inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Item
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Description</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Price</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Added</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/products/${p.id}/edit`} className="font-medium text-slate-900 hover:text-indigo-600">{p.name}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{p.description ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.unit}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/products/${p.id}/edit`} className="text-xs text-slate-500 hover:text-indigo-600 font-medium">Edit</Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
