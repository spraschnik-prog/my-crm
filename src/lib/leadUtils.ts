export const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const

export const stageColor: Record<string, string> = {
  new:       'bg-slate-100 text-slate-700',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal:  'bg-yellow-100 text-yellow-700',
  won:       'bg-green-100 text-green-700',
  lost:      'bg-red-100 text-red-700',
}

export const stageBar: Record<string, string> = {
  new:       'bg-slate-400',
  contacted: 'bg-blue-500',
  qualified: 'bg-purple-500',
  proposal:  'bg-yellow-500',
  won:       'bg-green-500',
  lost:      'bg-red-400',
}
