import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Receipt } from 'lucide-react'
import StatusFilter from '@/components/StatusFilter'
import DeleteExpenseButton from './DeleteExpenseButton'

const CATEGORIES = ['office','software','travel','marketing','equipment','meals','utilities','other']

const catColor: Record<string, string> = {
  office:     'bg-slate-100 text-slate-700',
  software:   'bg-blue-100 text-blue-700',
  travel:     'bg-purple-100 text-purple-700',
  marketing:  'bg-pink-100 text-pink-700',
  equipment:  'bg-orange-100 text-orange-700',
  meals:      'bg-yellow-100 text-yellow-700',
  utilities:  'bg-teal-100 text-teal-700',
  other:      'bg-gray-100 text-gray-600',
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false })
  if (status && status !== 'all') query = query.eq('category', status)
  const { data: expenses } = await query

  const { data: all } = await supabase.from('expenses').select('category, amount')
  const total = (all ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const byCategory = CATEGORIES.map(c => ({
    cat: c,
    amount: (all ?? []).filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0),
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 text-sm mt-1">Total: {formatCurrency(total)}</p>
        </div>
        <Link href="/expenses/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {byCategory.slice(0, 4).map(c => (
            <div key={c.cat} className="bg-white rounded-xl border border-slate-200 p-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor[c.cat]}`}>{c.cat}</span>
              <div className="text-lg font-bold text-slate-900 mt-2">{formatCurrency(c.amount)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <StatusFilter statuses={CATEGORIES} />
      </div>

      {(!expenses || expenses.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No expenses found</p>
          <Link href="/expenses/new" className="inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Add Expense
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Description</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(expenses ?? []).map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/expenses/${exp.id}/edit`} className="font-medium text-slate-900 hover:text-indigo-600">{exp.description}</Link>
                    {exp.notes && <div className="text-xs text-slate-400 truncate max-w-xs">{exp.notes}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor[exp.category] ?? 'bg-gray-100 text-gray-600'}`}>{exp.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(exp.expense_date)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatCurrency(exp.amount)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/expenses/${exp.id}/edit`} className="text-xs text-slate-400 hover:text-indigo-600 font-medium">Edit</Link>
                      <DeleteExpenseButton id={exp.id} />
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
