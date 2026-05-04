'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Paperclip, Upload, Trash2, FileText, Download } from 'lucide-react'

interface Attachment {
  id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

interface Props {
  entityType: 'client' | 'invoice' | 'quote'
  entityId: string
  initialAttachments?: Attachment[]
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Attachments({ entityType, entityId, initialAttachments = [] }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    const supabase = createClient()
    const path = `${entityType}/${entityId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('attachments').upload(path, file)
    if (uploadError) { alert(uploadError.message); setUploading(false); return }

    const { data, error } = await supabase.from('attachments').insert([{
      entity_type: entityType,
      entity_id: entityId,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type,
    }]).select().single()

    if (!error && data) setAttachments(prev => [...prev, data])
    setUploading(false)
  }

  async function handleDelete(att: Attachment) {
    if (!confirm(`Delete "${att.file_name}"?`)) return
    const supabase = createClient()
    await supabase.storage.from('attachments').remove([att.file_path])
    await supabase.from('attachments').delete().eq('id', att.id)
    setAttachments(prev => prev.filter(a => a.id !== att.id))
  }

  async function handleDownload(att: Attachment) {
    const supabase = createClient()
    const { data } = await supabase.storage.from('attachments').createSignedUrl(att.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <Paperclip className="w-4 h-4" /> Attachments
        </h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg"
        >
          <Upload className="w-3 h-3" /> {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }} />
      </div>

      {attachments.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-4">No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map(att => (
            <li key={att.id} className="flex items-center gap-3 text-sm">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="flex-1 text-slate-700 truncate">{att.file_name}</span>
              {att.file_size && <span className="text-xs text-slate-400">{formatBytes(att.file_size)}</span>}
              <button onClick={() => handleDownload(att)} className="text-indigo-500 hover:text-indigo-700">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(att)} className="text-slate-300 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
