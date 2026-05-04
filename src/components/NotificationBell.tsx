'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

interface Props {
  initialNotifications: Notification[]
}

const typeColor: Record<string, string> = {
  overdue_invoice: 'bg-red-100 text-red-700',
  upcoming_event: 'bg-blue-100 text-blue-700',
  quote_expiring: 'bg-yellow-100 text-yellow-700',
  payment_received: 'bg-green-100 text-green-700',
}

export default function NotificationBell({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function markRead(id: string) {
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'all' }) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No notifications.</p>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 border-b border-slate-50 ${!n.read ? 'bg-indigo-50/50' : ''} hover:bg-slate-50`}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-snug ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  {n.body && <p className="text-xs text-slate-400 mt-0.5 truncate">{n.body}</p>}
                  {n.link && (
                    <Link href={n.link} onClick={() => setOpen(false)} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
