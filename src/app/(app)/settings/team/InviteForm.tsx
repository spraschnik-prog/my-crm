'use client'

import { useState } from 'react'

export default function InviteForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('sent')
      setEmail('')
    } else {
      setStatus('error')
      setErrorMsg(data.error ?? 'Failed to invite')
    }
  }

  return (
    <form onSubmit={handleInvite} className="space-y-3">
      {status === 'sent' && (
        <p className="text-green-600 text-sm font-medium bg-green-50 px-3 py-2 rounded-lg">Invitation sent! They'll get an email to join.</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          required
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
      >
        {status === 'sending' ? 'Sending…' : 'Send Invite'}
      </button>
    </form>
  )
}
