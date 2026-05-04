'use client'

import { downloadQuotePdf } from '@/lib/pdf'
import { Download } from 'lucide-react'

export default function DownloadPdfButton({ quote }: { quote: any }) {
  return (
    <button
      onClick={() => downloadQuotePdf(quote)}
      className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <Download className="w-3.5 h-3.5" /> PDF
    </button>
  )
}
