import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate } from './utils'
import type { Invoice, Quote } from '@/types'

type Doc = InstanceType<typeof jsPDF> & { lastAutoTable: { finalY: number } }

function buildPdf(
  type: 'QUOTE' | 'INVOICE',
  number: string,
  clientName: string,
  clientEmail: string | null,
  issueDate: string,
  secondDate: string | null,
  secondDateLabel: string,
  items: { description: string; quantity: number; unit_price: number; total: number }[],
  subtotal: number,
  discount: number,
  taxRate: number,
  taxAmount: number,
  total: number,
  notes: string | null,
  extraBadge?: string
): jsPDF {
  const doc = new jsPDF() as Doc
  const pageW = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageW, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('YOUR COMPANY', 14, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('your@email.com  •  (555) 000-0000', 14, 22)

  // Type + number
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(type, pageW - 14, 14, { align: 'right' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`#${number}`, pageW - 14, 22, { align: 'right' })

  // Dates + client
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text('Bill To:', 14, 44)
  doc.setFont('helvetica', 'bold')
  doc.text(clientName, 14, 50)
  doc.setFont('helvetica', 'normal')
  if (clientEmail) doc.text(clientEmail, 14, 56)

  doc.text(`Issue Date: ${formatDate(issueDate)}`, pageW - 14, 44, { align: 'right' })
  if (secondDate) doc.text(`${secondDateLabel}: ${formatDate(secondDate)}`, pageW - 14, 50, { align: 'right' })
  if (extraBadge) {
    doc.setFillColor(220, 252, 231)
    doc.setTextColor(21, 128, 61)
    doc.roundedRect(pageW - 54, 54, 40, 8, 2, 2, 'F')
    doc.setFontSize(9)
    doc.text(extraBadge.toUpperCase(), pageW - 34, 59.5, { align: 'center' })
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
  }

  // Line items table
  autoTable(doc, {
    startY: 68,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: items.map(i => [
      i.description,
      i.quantity.toString(),
      formatCurrency(i.unit_price),
      formatCurrency(i.total),
    ]),
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  })

  const finalY = (doc as Doc).lastAutoTable.finalY + 6

  // Totals
  const col1 = pageW - 80
  const col2 = pageW - 14
  let y = finalY

  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(label, col1, y, { align: 'right' })
    doc.text(value, col2, y, { align: 'right' })
    y += 7
  }

  row('Subtotal:', formatCurrency(subtotal))
  if (discount > 0) row('Discount:', `-${formatCurrency(discount)}`)
  if (taxRate > 0) row(`Tax (${taxRate}%):`, formatCurrency(taxAmount))
  doc.setDrawColor(200, 200, 200)
  doc.line(col1 - 20, y - 2, col2, y - 2)
  row('Total:', formatCurrency(total), true)

  // Notes
  if (notes) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Notes:', 14, y + 4)
    doc.text(notes, 14, y + 10, { maxWidth: pageW - 28 })
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(248, 250, 252)
  doc.rect(0, pageH - 14, pageW, 14, 'F')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for your business!', pageW / 2, pageH - 5, { align: 'center' })

  return doc
}

export function downloadQuotePdf(quote: Quote) {
  const doc = buildPdf(
    'QUOTE',
    quote.quote_number,
    quote.clients?.name ?? 'Client',
    quote.clients?.email ?? null,
    quote.issue_date,
    quote.expiry_date ?? null,
    'Expiry Date',
    quote.quote_items ?? [],
    quote.subtotal,
    quote.discount,
    quote.tax_rate,
    quote.tax_amount,
    quote.total,
    quote.notes ?? null,
    quote.status === 'accepted' ? 'Accepted' : undefined
  )
  doc.save(`Quote-${quote.quote_number}.pdf`)
}

export function downloadInvoicePdf(invoice: Invoice) {
  const doc = buildPdf(
    'INVOICE',
    invoice.invoice_number,
    invoice.clients?.name ?? 'Client',
    invoice.clients?.email ?? null,
    invoice.issue_date,
    invoice.due_date ?? null,
    'Due Date',
    invoice.invoice_items ?? [],
    invoice.subtotal,
    invoice.discount,
    invoice.tax_rate,
    invoice.tax_amount,
    invoice.total,
    invoice.notes ?? null,
    invoice.status === 'paid' ? 'Paid' : undefined
  )
  doc.save(`Invoice-${invoice.invoice_number}.pdf`)
}
