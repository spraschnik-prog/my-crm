'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, Suspense } from 'react'
import { Search } from 'lucide-react'

function SearchInputInner({ placeholder = 'Search…' }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) params.set('search', e.target.value)
    else params.delete('search')
    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        defaultValue={searchParams.get('search') ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-56"
      />
    </div>
  )
}

export default function SearchInput({ placeholder }: { placeholder?: string }) {
  return <Suspense><SearchInputInner placeholder={placeholder} /></Suspense>
}
