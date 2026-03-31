import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { sql } from '@/lib/server/db'

export type InvoicePaymentRow = {
  id: string
  projectId: string | null
  projectName: string
  category: string | null
  clientName: string
  clientEmail: string | null
  amount: number
  currencyCode: string
  currencySymbol: string
  currencyLabel: string
  paymentMethod: string | null
  paymentDate: string | null
  status: string
  orNumber: string | null
  notes: string | null
  createdAt: string | null
}

export type InvoicePayload = {
  invoiceNumber: string
  title: string
  subtitle: string
  generatedAt: string
  projectName: string
  category: string | null
  clientName: string
  clientEmail: string | null
  rows: InvoicePaymentRow[]
  totalAmount: number
  currencyCode: string
  currencySymbol: string
  currencyLabel: string
}

function formatMoney(amount: number, code: string) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: code || 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function invoiceCode(prefix: string) {
  const stamp = Date.now().toString().slice(-6)
  return `${prefix}-${stamp}`
}

async function loadLogoBytes() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'ProgreX Logo Black.png')
    return await readFile(logoPath)
  } catch {
    return null
  }
}

async function mapRowsForInvoice(rows: Array<{
  id: string
  project_id: string | null
  project_name: string | null
  category: string | null
  client_name: string
  client_email: string | null
  amount: string
  currency: string
  currency_symbol: string | null
  currency_label: string | null
  payment_method: string | null
  payment_date: string | null
  status: string
  or_number: string | null
  notes: string | null
  created_at: string | null
}>): Promise<InvoicePaymentRow[]> {
  return rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name || 'Unknown Project',
    category: row.category,
    clientName: row.client_name,
    clientEmail: row.client_email,
    amount: Number(row.amount || '0'),
    currencyCode: row.currency || 'PHP',
    currencySymbol: row.currency_symbol || '₱',
    currencyLabel: row.currency_label || 'Philippine Peso',
    paymentMethod: row.payment_method,
    paymentDate: row.payment_date,
    status: row.status,
    orNumber: row.or_number,
    notes: row.notes,
    createdAt: row.created_at,
  }))
}

export async function getSinglePaymentInvoicePayload(paymentId: string): Promise<InvoicePayload | null> {
  const rows = await sql<{
    id: string
    project_id: string | null
    project_name: string | null
    category: string | null
    client_name: string
    client_email: string | null
    amount: string
    currency: string
    currency_symbol: string | null
    currency_label: string | null
    payment_method: string | null
    payment_date: string | null
    status: string
    or_number: string | null
    notes: string | null
    created_at: string | null
  }>(
    `select p.id,
            p.project_id::text,
            p.project_name,
            op.category,
            p.client_name,
            c.email as client_email,
            p.amount::text,
            p.currency,
            p.currency_symbol,
            p.currency_label,
            p.payment_method,
            p.payment_date::text,
            p.status,
            p.or_number,
            p.notes,
            p.created_at::text
       from payments p
       left join ongoing_projects op on op.id = p.project_id
       left join clients c on c.full_name = p.client_name
      where p.id = $1
      limit 1`,
    [paymentId]
  )

  if (!rows.length) return null
  const mapped = await mapRowsForInvoice(rows)
  const first = mapped[0]

  return {
    invoiceNumber: invoiceCode('TXN'),
    title: 'Payment Receipt Invoice',
    subtitle: 'Single transaction invoice',
    generatedAt: new Date().toISOString(),
    projectName: first.projectName,
    category: first.category,
    clientName: first.clientName,
    clientEmail: first.clientEmail,
    rows: mapped,
    totalAmount: first.amount,
    currencyCode: first.currencyCode,
    currencySymbol: first.currencySymbol,
    currencyLabel: first.currencyLabel,
  }
}

export async function getProjectInvoicePayload(projectId: string): Promise<InvoicePayload | null> {
  const rows = await sql<{
    id: string
    project_id: string | null
    project_name: string | null
    category: string | null
    client_name: string
    client_email: string | null
    amount: string
    currency: string
    currency_symbol: string | null
    currency_label: string | null
    payment_method: string | null
    payment_date: string | null
    status: string
    or_number: string | null
    notes: string | null
    created_at: string | null
  }>(
    `select p.id,
            p.project_id::text,
            p.project_name,
            op.category,
            p.client_name,
            c.email as client_email,
            p.amount::text,
            p.currency,
            p.currency_symbol,
            p.currency_label,
            p.payment_method,
            p.payment_date::text,
            p.status,
            p.or_number,
            p.notes,
            p.created_at::text
       from payments p
       left join ongoing_projects op on op.id = p.project_id
       left join clients c on c.full_name = p.client_name
      where p.project_id = $1::uuid
      order by p.payment_date asc nulls last, p.created_at asc`,
    [projectId]
  )

  if (!rows.length) return null
  const mapped = await mapRowsForInvoice(rows)
  const first = mapped[0]
  const totalAmount = mapped.reduce((sum, row) => sum + row.amount, 0)

  return {
    invoiceNumber: invoiceCode('PRJ'),
    title: 'Project Payment Receipt Invoice',
    subtitle: 'All payments from oldest to latest',
    generatedAt: new Date().toISOString(),
    projectName: first.projectName,
    category: first.category,
    clientName: first.clientName,
    clientEmail: first.clientEmail,
    rows: mapped,
    totalAmount,
    currencyCode: first.currencyCode,
    currencySymbol: first.currencySymbol,
    currencyLabel: first.currencyLabel,
  }
}

export async function generateInvoicePdf(payload: InvoicePayload): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: rgb(0.03, 0.26, 0.55) })
  page.drawRectangle({ x: 0, y: height - 130, width, height: 85, color: rgb(0.02, 0.47, 0.79), opacity: 0.35 })

  const logoBytes = await loadLogoBytes()
  if (logoBytes) {
    try {
      const image = await pdf.embedPng(logoBytes)
      const dims = image.scale(0.25)
      page.drawImage(image, { x: 36, y: height - 92, width: dims.width, height: dims.height })
    } catch {
      // Non-fatal if logo cannot be embedded.
    }
  }

  page.drawText('ProgreX Technologies', { x: 150, y: height - 60, size: 22, font: bold, color: rgb(1, 1, 1) })
  page.drawText('Software and Systems Development', { x: 150, y: height - 82, size: 11, font, color: rgb(0.87, 0.95, 1) })

  page.drawText(payload.title, { x: 36, y: height - 162, size: 16, font: bold, color: rgb(0.02, 0.08, 0.2) })
  page.drawText(payload.subtitle, { x: 36, y: height - 180, size: 10.5, font, color: rgb(0.3, 0.37, 0.45) })

  page.drawText(`Invoice No.: ${payload.invoiceNumber}`, { x: 36, y: height - 212, size: 10.5, font: bold, color: rgb(0.02, 0.08, 0.2) })
  page.drawText(`Generated: ${formatDate(payload.generatedAt)}`, { x: 290, y: height - 212, size: 10.5, font, color: rgb(0.2, 0.28, 0.36) })

  page.drawText(`Project: ${payload.projectName}`, { x: 36, y: height - 236, size: 10.5, font, color: rgb(0.1, 0.16, 0.24) })
  page.drawText(`Category: ${payload.category || '-'}`, { x: 36, y: height - 252, size: 10.5, font, color: rgb(0.1, 0.16, 0.24) })
  page.drawText(`Client: ${payload.clientName}`, { x: 36, y: height - 268, size: 10.5, font, color: rgb(0.1, 0.16, 0.24) })
  page.drawText(`Email: ${payload.clientEmail || '-'}`, { x: 36, y: height - 284, size: 10.5, font, color: rgb(0.1, 0.16, 0.24) })

  const top = height - 320
  page.drawRectangle({ x: 36, y: top, width: width - 72, height: 24, color: rgb(0.93, 0.96, 0.99) })
  page.drawText('Date', { x: 42, y: top + 7, size: 10, font: bold, color: rgb(0.12, 0.18, 0.24) })
  page.drawText('Method', { x: 112, y: top + 7, size: 10, font: bold, color: rgb(0.12, 0.18, 0.24) })
  page.drawText('O.R. #', { x: 202, y: top + 7, size: 10, font: bold, color: rgb(0.12, 0.18, 0.24) })
  page.drawText('Status', { x: 282, y: top + 7, size: 10, font: bold, color: rgb(0.12, 0.18, 0.24) })
  page.drawText('Amount', { x: 470, y: top + 7, size: 10, font: bold, color: rgb(0.12, 0.18, 0.24) })

  let y = top - 22
  for (const row of payload.rows.slice(0, 18)) {
    page.drawText(formatDate(row.paymentDate), { x: 42, y, size: 9.5, font, color: rgb(0.12, 0.18, 0.24) })
    page.drawText(row.paymentMethod || '-', { x: 112, y, size: 9.5, font, color: rgb(0.12, 0.18, 0.24) })
    page.drawText(row.orNumber || '-', { x: 202, y, size: 9.5, font, color: rgb(0.12, 0.18, 0.24) })
    page.drawText(row.status, { x: 282, y, size: 9.5, font, color: rgb(0.12, 0.18, 0.24) })
    page.drawText(formatMoney(row.amount, row.currencyCode), { x: 438, y, size: 9.5, font: bold, color: rgb(0.02, 0.22, 0.44) })
    y -= 18
  }

  page.drawLine({ start: { x: 36, y: y - 2 }, end: { x: width - 36, y: y - 2 }, thickness: 1, color: rgb(0.85, 0.9, 0.95) })
  page.drawText('Total Amount', { x: 355, y: y - 18, size: 11, font: bold, color: rgb(0.06, 0.16, 0.27) })
  page.drawText(formatMoney(payload.totalAmount, payload.currencyCode), { x: 448, y: y - 18, size: 12, font: bold, color: rgb(0.03, 0.29, 0.58) })

  page.drawText('ProgreX Technologies', { x: 36, y: 66, size: 9.5, font: bold, color: rgb(0.15, 0.22, 0.32) })
  page.drawText('This document is system-generated and valid without signature.', { x: 36, y: 52, size: 8.5, font, color: rgb(0.4, 0.48, 0.56) })

  return pdf.save()
}
