import { formatCurrency, formatDate } from './utils'

type LineItem = { description: string; quantity: number; unit_price: number; total: number }

function base(title: string, content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
  <!-- Header -->
  <tr><td style="background:#0f172a;padding:28px 40px">
    <p style="margin:0;color:#fff;font-size:22px;font-weight:700">MyCRM</p>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px">${title}</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px">${content}</td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0">
    <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">Thank you for your business!</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function itemsTable(items: LineItem[]) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155">${i.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:right">${i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:right">${formatCurrency(i.unit_price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;text-align:right">${formatCurrency(i.total)}</td>
    </tr>`).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:24px 0">
    <tr style="background:#f8fafc">
      <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Description</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Qty</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Price</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Total</th>
    </tr>
    ${rows}
  </table>`
}

function totalsBlock(subtotal: number, discount: number, taxRate: number, taxAmount: number, total: number) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#64748b">Subtotal</td>
      <td style="padding:4px 0;font-size:14px;color:#64748b;text-align:right">${formatCurrency(subtotal)}</td>
    </tr>
    ${discount > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#64748b">Discount</td><td style="padding:4px 0;font-size:14px;color:#64748b;text-align:right">-${formatCurrency(discount)}</td></tr>` : ''}
    ${taxRate > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#64748b">Tax (${taxRate}%)</td><td style="padding:4px 0;font-size:14px;color:#64748b;text-align:right">${formatCurrency(taxAmount)}</td></tr>` : ''}
    <tr style="border-top:2px solid #e2e8f0">
      <td style="padding:10px 0 4px;font-size:16px;font-weight:700;color:#0f172a">Total</td>
      <td style="padding:10px 0 4px;font-size:16px;font-weight:700;color:#0f172a;text-align:right">${formatCurrency(total)}</td>
    </tr>
  </table>`
}

export function invoiceEmail(inv: any, appUrl: string) {
  const balance = inv.total - inv.paid_amount
  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#0f172a">Invoice #${inv.invoice_number}</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b">Hi ${inv.clients?.name ?? 'there'},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#334155">Please find your invoice below. Payment is due by <strong>${formatDate(inv.due_date)}</strong>.</p>
    ${itemsTable(inv.invoice_items ?? [])}
    ${totalsBlock(inv.subtotal, inv.discount, inv.tax_rate, inv.tax_amount, inv.total)}
    ${balance > 0 ? `<p style="margin:20px 0 0;padding:16px;background:#fef3c7;border-radius:8px;font-size:14px;color:#92400e"><strong>Balance Due: ${formatCurrency(balance)}</strong></p>` : ''}
    ${inv.notes ? `<p style="margin:24px 0 0;font-size:13px;color:#64748b;padding:16px;background:#f8fafc;border-radius:8px">${inv.notes}</p>` : ''}
  `
  return {
    subject: `Invoice #${inv.invoice_number} — ${formatCurrency(inv.total)}`,
    html: base(`Invoice #${inv.invoice_number}`, content),
  }
}

export function quoteEmail(quote: any, appUrl: string) {
  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#0f172a">Quote #${quote.quote_number}</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b">Hi ${quote.clients?.name ?? 'there'},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#334155">Please review the quote below${quote.expiry_date ? `, valid until <strong>${formatDate(quote.expiry_date)}</strong>` : ''}.</p>
    ${itemsTable(quote.quote_items ?? [])}
    ${totalsBlock(quote.subtotal, quote.discount, quote.tax_rate, quote.tax_amount, quote.total)}
    ${quote.notes ? `<p style="margin:24px 0 0;font-size:13px;color:#64748b;padding:16px;background:#f8fafc;border-radius:8px">${quote.notes}</p>` : ''}
  `
  return {
    subject: `Quote #${quote.quote_number} — ${formatCurrency(quote.total)}`,
    html: base(`Quote #${quote.quote_number}`, content),
  }
}

export function notificationEmail(title: string, body: string) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a">${title}</h2>
    <p style="margin:0;font-size:14px;color:#334155;line-height:1.6">${body}</p>
  `
  return { subject: title, html: base(title, content) }
}
