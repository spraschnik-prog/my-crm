'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

function StatusFilterInner({ statuses }: { statuses: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'all'

  function select(s: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (s === 'all') params.delete('status')
    else params.set('status', s)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {['all', ...statuses].map(s => (
        <button
          key={s}
          onClick={() => select(s)}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize border',
            current === s
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          )}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export default function StatusFilter({ statuses }: { statuses: string[] }) {
  return <Suspense><StatusFilterInner statuses={statuses} /></Suspense>
}
