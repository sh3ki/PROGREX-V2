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
  invoiceKind: 'transaction' | 'project'
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
  projectTotalAmount: number
  currencyCode: string
  currencySymbol: string
  currencyLabel: string
}

const COMPANY_DETAILS = {
  name: 'PROGREX',
  service: 'Software and Systems Development',
  address: 'Dayap, Calauan, Laguna',
  phone: '+63 956 593 4460',
  email: 'info@progrex.cloud',
}

function formatMoney(amount: number, code: string) {
  return `${(code || 'PHP').toUpperCase()} ${new Intl.NumberFormat('en-PH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
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

function safePdfText(value: string) {
  return value.replace(/₱/g, 'PHP').replace(/[^\x20-\x7E]/g, '')
}

async function loadLogoBytes() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'Progrex Logo Black Transparent.png')
    return await readFile(logoPath)
  } catch {
    try {
      const fallback = path.join(process.cwd(), 'public', 'ProgreX Logo Black.png')
      return await readFile(fallback)
    } catch {
      return null
    }
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
    project_total: string | null
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
            op.total_price::text as project_total,
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
    invoiceKind: 'transaction',
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
    projectTotalAmount: first.amount,
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
    project_total: string | null
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
            op.total_price::text as project_total,
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
  const projectTotalAmount = Number(rows[0]?.project_total || '0')

  return {
    invoiceKind: 'project',
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
    projectTotalAmount,
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
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const write = (text: string, x: number, y: number, size: number, useBold = false, color = rgb(0.12, 0.18, 0.24)) => {
    page.drawText(safePdfText(text), { x, y, size, font: useBold ? bold : font, color })
  }
  const isProjectInvoice = payload.invoiceKind === 'project'
  const computedBalance = Math.max((payload.projectTotalAmount || 0) - payload.totalAmount, 0)
  const brandBlue = rgb(0.07, 0.45, 0.67)
  const lightPanel = rgb(0.93, 0.96, 0.98)

  write('INVOICE', 238, height - 44, 40, true, brandBlue)

  const logoBytes = await loadLogoBytes()
  if (logoBytes) {
    try {
      const image = await pdf.embedPng(logoBytes)
      const dims = image.scale(0.19)
      page.drawImage(image, { x: 36, y: height - 120, width: dims.width, height: dims.height })
    } catch {
      // Non-fatal if logo cannot be embedded.
    }
  }

  write(COMPANY_DETAILS.name, 176, height - 86, 31, true, brandBlue)
  write('SOFTWARE AND SERVICES COMPANY', 176, height - 100, 8.4, true, brandBlue)
  write('[Software Services]', 176, height - 114, 10)
  write(`Address: ${COMPANY_DETAILS.address}`, 176, height - 128, 10)
  write(`Phone: ${COMPANY_DETAILS.phone}`, 176, height - 142, 10)
  write(`Email: ${COMPANY_DETAILS.email}`, 176, height - 156, 10)

  page.drawRectangle({ x: 28, y: height - 172, width: width - 56, height: 2, color: brandBlue })

  const infoY = height - 212
  write('BILL TO :', 40, infoY, 11)
  write(payload.clientName, 96, infoY, 11)
  write(payload.clientEmail ? payload.clientEmail : '-', 96, infoY - 16, 11)
  write(payload.projectName ? payload.projectName : '-', 96, infoY - 32, 11)

  if (isProjectInvoice) {
    write(`INVOICE # : ${payload.invoiceNumber}`, 352, infoY, 11, true)
    write(`DATE : ${formatDate(payload.generatedAt)}`, 352, infoY - 16, 11)
  } else {
    const row = payload.rows[0]
    write(`O.R. # : ${row?.orNumber || '-'}`, 352, infoY, 11, true)
    write(`DATE : ${formatDate(row?.paymentDate || payload.generatedAt)}`, 352, infoY - 16, 11)
    write(`PAYMENT : ${row?.paymentMethod || '-'}`, 352, infoY - 32, 11)
  }

  write('PROJECT :', 40, infoY - 64, 11)
  write(payload.projectName || '-', 104, infoY - 64, 11)

  const tableTop = height - 318
  page.drawRectangle({ x: 36, y: tableTop, width: width - 72, height: 26, color: brandBlue })

  if (isProjectInvoice) {
    write('DESCRIPTION', 62, tableTop + 9, 11, true, rgb(1, 1, 1))
    write('DATE', 242, tableTop + 9, 11, true, rgb(1, 1, 1))
    write('O.R. #', 308, tableTop + 9, 11, true, rgb(1, 1, 1))
    write('MOP', 390, tableTop + 9, 11, true, rgb(1, 1, 1))
    write('AMOUNT', 486, tableTop + 9, 11, true, rgb(1, 1, 1))
  } else {
    write('DESCRIPTION', 62, tableTop + 9, 11, true, rgb(1, 1, 1))
    write('AMOUNT', 300, tableTop + 9, 11, true, rgb(1, 1, 1))
    write('BALANCE', 408, tableTop + 9, 11, true, rgb(1, 1, 1))
  }

  const panelHeight = isProjectInvoice ? 210 : 68
  page.drawRectangle({ x: 36, y: tableTop - panelHeight, width: width - 72, height: panelHeight, color: lightPanel })

  let y = tableTop - 22
  const rows = isProjectInvoice ? payload.rows.slice(0, 16) : payload.rows.slice(0, 1)

  for (const row of rows) {
    if (isProjectInvoice) {
      write(row.notes || 'Payment', 58, y, 11)
      write(formatDate(row.paymentDate), 242, y, 11)
      write(row.orNumber || '-', 308, y, 11)
      write(row.paymentMethod || '-', 390, y, 11)
      write(formatMoney(row.amount, row.currencyCode), 440, y, 11, true)
      y -= 34
    } else {
      write(row.notes || 'Payment notes', 58, y, 11)
      write(formatMoney(row.amount, row.currencyCode), 296, y, 11, true)
      write(formatMoney(computedBalance, row.currencyCode), 406, y, 11, true)
      y -= 26
    }
  }

  const totalBoxY = tableTop - panelHeight - (isProjectInvoice ? 58 : 34)
  page.drawRectangle({ x: 250, y: totalBoxY, width: width - 286, height: isProjectInvoice ? 58 : 34, color: brandBlue })
  write('TOTAL :', 274, totalBoxY + (isProjectInvoice ? 36 : 12), 16, true, rgb(1, 1, 1))
  write(formatMoney(payload.totalAmount, payload.currencyCode), 430, totalBoxY + (isProjectInvoice ? 36 : 12), 16, true, rgb(1, 1, 1))
  if (isProjectInvoice) {
    write('BALANCE :', 274, totalBoxY + 12, 16, true, rgb(1, 1, 1))
    write(formatMoney(computedBalance, payload.currencyCode), 430, totalBoxY + 12, 16, true, rgb(1, 1, 1))
  }

  page.drawLine({ start: { x: 378, y: 118 }, end: { x: 548, y: 118 }, thickness: 1.2, color: rgb(0.2, 0.25, 0.32) })
  page.drawText(safePdfText('Authorized Signature'), { x: 408, y: 104, size: 10, font: italic, color: rgb(0.2, 0.25, 0.32) })
  write('PROGREX Finance Team', 404, 90, 10, true, rgb(0.1, 0.15, 0.2))

  write('[PROFESSIONAL FOOTER]', 206, 54, 12, true, rgb(0.1, 0.15, 0.2))

  return pdf.save()
}
