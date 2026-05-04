'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Package, FileText,
  Receipt, LogOut, Building2, TrendingUp,
  Calendar, CreditCard, DollarSign, Settings,
} from 'lucide-react'

const nav = [
  { href: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients',      label: 'Clients',   icon: Users },
  { href: '/leads',        label: 'Leads',     icon: TrendingUp },
  { href: '/schedule',     label: 'Schedule',  icon: Calendar },
  { href: '/products',     label: 'Products',  icon: Package },
  { href: '/quotes',       label: 'Quotes',    icon: FileText },
  { href: '/invoices',     label: 'Invoices',  icon: Receipt },
  { href: '/payments',     label: 'Payments',  icon: DollarSign },
  { href: '/expenses',     label: 'Expenses',  icon: CreditCard },
  { href: '/settings/team',label: 'Team',      icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">MyCRM</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <form action="/auth/signout" method="POST">
          <button type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
