'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

interface Props {
  type: 'invoice' | 'quote'
  id: string
  clientEmail?: string | null
}

export default function SendEmailButton({ type, id, clientEmail }: Props) {
  const [to, setTo] = useState(clientEmail ?? '')
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function send() {
    if (!to) return
    setSending(true)
    setStatus('idle')
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, to }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('sent')
      setTimeout(() => { setOpen(false); setStatus('idle') }, 2000)
    } else {
      setStatus('error')
      setErrorMsg(data.error ?? 'Failed to send')
    }
    setSending(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
      >
        <Mail className="w-3.5 h-3.5" /> Send
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Send {type === 'invoice' ? 'Invoice' : 'Quote'}</h3>
            {status === 'sent' ? (
              <p className="text-green-600 text-sm font-medium">Email sent successfully!</p>
            ) : (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient email</label>
                <input
                  type="email"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                />
                {status === 'error' && (
                  <p className="text-red-600 text-xs mb-3">{errorMsg}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={send}
                    disabled={sending || !to}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg"
                  >
                    {sending ? 'Sending…' : 'Send Email'}
                  </button>
                  <button
                    onClick={() => { setOpen(false); setStatus('idle') }}
                    className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
