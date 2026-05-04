export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  notes: string | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  unit: string
  created_at: string
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
export type EventType = 'meeting' | 'call' | 'followup' | 'task'
export type EventStatus = 'pending' | 'completed' | 'cancelled'

export type LineItem = {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
}

export type Quote = {
  id: string
  client_id: string | null
  quote_number: string
  status: QuoteStatus
  issue_date: string
  expiry_date: string | null
  notes: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  total: number
  created_at: string
  clients?: Client | null
  quote_items?: LineItem[]
}

export type Invoice = {
  id: string
  client_id: string | null
  quote_id: string | null
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string | null
  notes: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  total: number
  paid_amount: number
  created_at: string
  clients?: Client | null
  invoice_items?: LineItem[]
}

export type Lead = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  source: string | null
  stage: LeadStage
  expected_value: number
  notes: string | null
  created_at: string
}

export type ScheduleEvent = {
  id: string
  title: string
  description: string | null
  client_id: string | null
  lead_id: string | null
  event_type: EventType
  start_at: string
  end_at: string | null
  status: EventStatus
  created_at: string
  clients?: Client | null
  leads?: Lead | null
}

export type Expense = {
  id: string
  description: string
  category: string
  amount: number
  expense_date: string
  notes: string | null
  created_at: string
}

export type Payment = {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: string
  notes: string | null
  created_at: string
  invoices?: { invoice_number: string; clients?: { name: string } | null } | null
}
