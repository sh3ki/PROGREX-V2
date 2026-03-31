'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit2, Eye, Mail, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexColumnsToggle,
  ApexConfirmationModal,
  ApexDropdown,
  ApexExportButton,
  ApexImageDropzone,
  ApexModal,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type CurrencyOption = {
  code: string
  symbol: string
  label: string
}

type PaymentRow = {
  id: string
  projectId: string | null
  projectName: string | null
  category: string | null
  clientName: string
  clientEmail: string | null
  totalPrice: number
  amount: number
  currency: string
  currencySymbol: string
  currencyLabel: string
  paymentMethod: string | null
  paymentDate: string | null
  status: string
  proofUrl: string | null
  notes: string | null
  orNumber: string | null
  invoiceNumber: string | null
  invoiceStatus: string
  invoiceDueDate: string | null
  invoiceSentAt: string | null
  projectPaid: number
  projectBalance: number
  createdAt: string | null
}

type ProjectOption = {
  id: string
  projectName: string
  category: string | null
  clientName: string
  clientEmail: string | null
  totalPrice: number
}

type ColumnKey = 'project' | 'client' | 'totalPrice' | 'amountPaid' | 'date' | 'or' | 'method' | 'balance' | 'status' | 'actions'

type PaymentFormState = {
  id?: string
  projectId: string
  amount: string
  currency: string
  paymentMethod: string
  paymentDate: string
  status: string
  orNumber: string
  notes: string
}

type ConfirmKind = 'delete'

function dateToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function defaultForm(projectId = ''): PaymentFormState {
  return {
    projectId,
    amount: '',
    currency: 'PHP',
    paymentMethod: 'Gcash',
    paymentDate: dateToday(),
    status: 'pending',
    orNumber: '',
    notes: '',
  }
}

function fromPayment(payment: PaymentRow): PaymentFormState {
  return {
    id: payment.id,
    projectId: payment.projectId || '',
    amount: formatAmountInput(payment.amount),
    currency: payment.currency,
    paymentMethod: payment.paymentMethod || 'Gcash',
    paymentDate: payment.paymentDate || dateToday(),
    status: payment.status || 'pending',
    orNumber: payment.orNumber || '',
    notes: payment.notes || '',
  }
}

function parseAmountInput(value: string) {
  const raw = value.replace(/[^0-9.\-]/g, '')
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(value: number, code: string) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: code || 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatAmountInput(value: number) {
  return formatMoney(value, 'PHP')
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function normalizeExternalUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function methodBadgeStyle(method: string | null) {
  const normalized = (method || '').toLowerCase()
  if (normalized === 'gcash') return { bg: 'rgba(14,165,233,0.14)', fg: '#0369a1' }
  if (normalized === 'cash') return { bg: 'rgba(22,163,74,0.14)', fg: '#166534' }
  if (normalized === 'bank transfer') return { bg: 'rgba(245,158,11,0.16)', fg: '#92400e' }
  if (normalized === 'credit card') return { bg: 'rgba(239,68,68,0.14)', fg: '#991b1b' }
  if (normalized === 'paypal') return { bg: 'rgba(249,115,22,0.16)', fg: '#c2410c' }
  return { bg: 'rgba(100,116,139,0.16)', fg: '#334155' }
}

function statusBadgeStyle(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'paid') return { bg: 'rgba(22,163,74,0.14)', fg: '#166534' }
  if (normalized === 'partial') return { bg: 'rgba(245,158,11,0.16)', fg: '#92400e' }
  if (normalized === 'refunded') return { bg: 'rgba(99,102,241,0.16)', fg: '#3730a3' }
  if (normalized === 'failed') return { bg: 'rgba(239,68,68,0.14)', fg: '#991b1b' }
  return { bg: 'rgba(100,116,139,0.16)', fg: '#334155' }
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function AdminPaymentsTemplateView({
  payments,
  projects,
  currencies,
  stats,
  createPaymentAction,
  updatePaymentAction,
  deletePaymentAction,
  sendTransactionInvoiceEmailAction,
  sendProjectInvoiceEmailAction,
}: {
  payments: PaymentRow[]
  projects: ProjectOption[]
  currencies: CurrencyOption[]
  stats: { totalProjected: number; totalCollected: number; totalBalance: number }
  createPaymentAction: (formData: FormData) => Promise<void>
  updatePaymentAction: (formData: FormData) => Promise<void>
  deletePaymentAction: (formData: FormData) => Promise<void>
  sendTransactionInvoiceEmailAction: (formData: FormData) => Promise<void>
  sendProjectInvoiceEmailAction: (formData: FormData) => Promise<void>
}) {
  const [projectFilter, setProjectFilter] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    project: true,
    client: true,
    totalPrice: true,
    amountPaid: true,
    date: true,
    or: true,
    method: true,
    balance: true,
    status: true,
    actions: true,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [projectInvoiceOpen, setProjectInvoiceOpen] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{ kind: ConfirmKind; title: string; description: string; confirmLabel: string; tone: 'primary' | 'danger' } | null>(null)

  const [addForm, setAddForm] = useState<PaymentFormState>(defaultForm())
  const [editForm, setEditForm] = useState<PaymentFormState>(defaultForm())
  const [addProofFile, setAddProofFile] = useState<File | null>(null)
  const [editProofFile, setEditProofFile] = useState<File | null>(null)
  const [keepEditProof, setKeepEditProof] = useState(true)

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const selectedProject = projectFilter ? projectMap.get(projectFilter) || null : null

  useEffect(() => {
    if (!projectFilter) return
    setAddForm((prev) => ({ ...prev, projectId: projectFilter }))
  }, [projectFilter])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return payments.filter((payment) => {
      if (projectFilter && payment.projectId !== projectFilter) return false
      const statusMatch = status === 'all' ? true : payment.status === status
      if (!statusMatch) return false
      if (!keyword) return true
      return [payment.projectName || '', payment.category || '', payment.clientName, payment.orNumber || '', payment.paymentMethod || '', payment.notes || '']
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [payments, projectFilter, search, status])

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toFormData(form: PaymentFormState, proofFile: File | null, keepProof = true) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('projectId', form.projectId)
    formData.set('amount', String(parseAmountInput(form.amount)))
    formData.set('currency', form.currency)
    formData.set('paymentMethod', form.paymentMethod)
    formData.set('paymentDate', form.paymentDate)
    formData.set('status', form.status)
    formData.set('orNumber', form.orNumber)
    formData.set('notes', form.notes)
    formData.set('keepProof', keepProof ? '1' : '0')
    if (proofFile) formData.set('proofFile', proofFile)
    return formData
  }

  async function handleCreate() {
    setPending(true)
    try {
      await createPaymentAction(toFormData(addForm, addProofFile, true))
      setAddOpen(false)
      setAddForm(defaultForm(projectFilter))
      setAddProofFile(null)
      addToast('Payment added.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to create payment.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function handleEdit() {
    setPending(true)
    try {
      await updatePaymentAction(toFormData(editForm, editProofFile, keepEditProof))
      setEditOpen(false)
      setEditProofFile(null)
      addToast('Payment updated.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update payment.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function executeConfirm() {
    if (!selectedPayment || !confirmConfig) return
    setPending(true)
    try {
      if (confirmConfig.kind === 'delete') {
        const formData = new FormData()
        formData.set('id', selectedPayment.id)
        await deletePaymentAction(formData)
        setViewOpen(false)
        addToast('Payment deleted.', 'success')
      }
      setConfirmOpen(false)
      setConfirmConfig(null)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Action failed.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function sendTransactionInvoice(paymentId: string) {
    setPending(true)
    try {
      const formData = new FormData()
      formData.set('id', paymentId)
      await sendTransactionInvoiceEmailAction(formData)
      addToast('Invoice email sent.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to send invoice email.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function sendProjectInvoice(projectId: string) {
    setPending(true)
    try {
      const formData = new FormData()
      formData.set('projectId', projectId)
      await sendProjectInvoiceEmailAction(formData)
      addToast('Project invoice email sent.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to send project invoice.', 'danger')
    } finally {
      setPending(false)
    }
  }

  function openSingleInvoicePdf(paymentId: string) {
    window.open(`/api/admin/payment/invoice?paymentId=${encodeURIComponent(paymentId)}`, '_blank', 'noopener,noreferrer')
  }

  function openProjectInvoicePdf(projectId: string) {
    window.open(`/api/admin/payment/invoice?projectId=${encodeURIComponent(projectId)}`, '_blank', 'noopener,noreferrer')
  }

  function exportCsv() {
    const rows = filtered.map((row) => [
      row.projectName || '',
      row.category || '',
      row.clientName,
      formatMoney(row.totalPrice, 'PHP'),
      formatMoney(row.amount, row.currency),
      formatDate(row.paymentDate),
      row.orNumber || '',
      row.paymentMethod || '',
      formatMoney(row.projectBalance, 'PHP'),
      row.status,
    ])
    downloadCsv('payments-export.csv', [['Project', 'Category', 'Client', 'Total Price', 'Amount Paid', 'Date', 'O.R. #', 'Payment Method', 'Balance', 'Status'], ...rows])
    addToast('Payments exported.', 'success')
  }

  return (
    <div className="space-y-4">
      {pending ? <ApexBlockingSpinner label="Processing payment changes..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Payment' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Payment Tracking</h1>
          <p className="mt-1 text-sm apx-muted">Track payment collections and project invoice receipts.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddForm(defaultForm(projectFilter))
            setAddProofFile(null)
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-xs uppercase tracking-wide apx-muted">Total Projected</p>
          <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(stats.totalProjected, 'PHP')}</p>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-xs uppercase tracking-wide apx-muted">Total Collected</p>
          <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(stats.totalCollected, 'PHP')}</p>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-xs uppercase tracking-wide apx-muted">Total Balance</p>
          <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(stats.totalBalance, 'PHP')}</p>
        </div>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: payments.length },
          { key: 'pending', label: 'Pending', count: payments.filter((item) => item.status === 'pending').length, indicatorColor: '#64748b' },
          { key: 'partial', label: 'Partial', count: payments.filter((item) => item.status === 'partial').length, indicatorColor: '#f59e0b' },
          { key: 'paid', label: 'Paid', count: payments.filter((item) => item.status === 'paid').length, indicatorColor: '#16a34a' },
          { key: 'refunded', label: 'Refunded', count: payments.filter((item) => item.status === 'refunded').length, indicatorColor: '#6366f1' },
          { key: 'failed', label: 'Failed', count: payments.filter((item) => item.status === 'failed').length, indicatorColor: '#ef4444' },
        ]}
        active={status}
        onChange={setStatus}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:max-w-sm">
            <ApexSearchField value={search} onChange={setSearch} placeholder="Search payments..." />
          </div>
          <div className="w-full md:max-w-sm">
            <ApexDropdown
              value={projectFilter}
              placeholder="Filter by project"
              options={[{ value: '', label: 'All projects' }, ...projects.map((project) => ({ value: project.id, label: `${project.projectName} - ${project.clientName}` }))]}
              onChange={setProjectFilter}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ApexButton
            type="button"
            variant="outline"
            onClick={() => {
              if (!selectedProject) {
                addToast('Select a project first to generate a full invoice.', 'default')
                return
              }
              setProjectInvoiceOpen(true)
            }}
          >
            <ReceiptText className="h-4 w-4" />
            Invoice
          </ApexButton>
          <ApexColumnsToggle
            columns={[
              { key: 'project', label: 'Project', visible: columns.project },
              { key: 'client', label: 'Client', visible: columns.client },
              { key: 'totalPrice', label: 'Total Price', visible: columns.totalPrice },
              { key: 'amountPaid', label: 'Amount Paid', visible: columns.amountPaid },
              { key: 'date', label: 'Date', visible: columns.date },
              { key: 'or', label: 'O.R. #', visible: columns.or },
              { key: 'method', label: 'Payment Method', visible: columns.method },
              { key: 'balance', label: 'Balance', visible: columns.balance },
              { key: 'status', label: 'Status', visible: columns.status },
              { key: 'actions', label: 'Actions', visible: columns.actions },
            ]}
            onToggle={(key) => {
              const typed = key as ColumnKey
              setColumns((prev) => ({ ...prev, [typed]: !prev[typed] }))
            }}
          />
          <ApexExportButton onClick={exportCsv} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              {columns.project ? <th className="px-4 py-3 font-semibold apx-text">Project</th> : null}
              {columns.client ? <th className="px-4 py-3 font-semibold apx-text">Client</th> : null}
              {columns.totalPrice ? <th className="px-4 py-3 font-semibold apx-text">Total Price</th> : null}
              {columns.amountPaid ? <th className="px-4 py-3 font-semibold apx-text">Amount Paid</th> : null}
              {columns.date ? <th className="px-4 py-3 font-semibold apx-text">Date</th> : null}
              {columns.or ? <th className="px-4 py-3 font-semibold apx-text">O.R. #</th> : null}
              {columns.method ? <th className="px-4 py-3 font-semibold apx-text">Payment Method</th> : null}
              {columns.balance ? <th className="px-4 py-3 font-semibold apx-text">Balance</th> : null}
              {columns.status ? <th className="px-4 py-3 font-semibold apx-text">Status</th> : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => {
              const methodStyle = methodBadgeStyle(payment.paymentMethod)
              const statusStyle = statusBadgeStyle(payment.status)
              return (
                <tr
                  key={payment.id}
                  className="cursor-pointer border-b last:border-b-0"
                  style={{ borderColor: 'var(--apx-border)' }}
                  onClick={() => {
                    setSelectedPayment(payment)
                    setViewOpen(true)
                  }}
                >
                  {columns.project ? (
                    <td className="px-4 py-3">
                      <p className="font-semibold apx-text">{payment.projectName || '-'}</p>
                      <p className="text-xs apx-muted">{payment.category || '-'}</p>
                    </td>
                  ) : null}
                  {columns.client ? <td className="px-4 py-3 apx-text">{payment.clientName}</td> : null}
                  {columns.totalPrice ? <td className="px-4 py-3 apx-text">{formatMoney(payment.totalPrice, 'PHP')}</td> : null}
                  {columns.amountPaid ? <td className="px-4 py-3 apx-text">{formatMoney(payment.amount, payment.currency)}</td> : null}
                  {columns.date ? <td className="px-4 py-3 apx-text">{formatDate(payment.paymentDate)}</td> : null}
                  {columns.or ? <td className="px-4 py-3 apx-text">{payment.orNumber || '-'}</td> : null}
                  {columns.method ? (
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: methodStyle.bg, color: methodStyle.fg }}>
                        {payment.paymentMethod || '-'}
                      </span>
                    </td>
                  ) : null}
                  {columns.balance ? <td className="px-4 py-3 apx-text">{formatMoney(payment.projectBalance, 'PHP')}</td> : null}
                  {columns.status ? (
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}>
                        {payment.status}
                      </span>
                    </td>
                  ) : null}
                  {columns.actions ? (
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" className="apx-icon-action" onClick={() => openSingleInvoicePdf(payment.id)} aria-label="Generate invoice PDF">
                          <ReceiptText className="h-4 w-4" />
                        </button>
                        <button type="button" className="apx-icon-action" onClick={() => void sendTransactionInvoice(payment.id)} aria-label="Send invoice email">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="apx-icon-action"
                          onClick={() => {
                            if (!payment.proofUrl) {
                              addToast('No proof of payment image uploaded.', 'default')
                              return
                            }
                            window.open(normalizeExternalUrl(payment.proofUrl), '_blank', 'noopener,noreferrer')
                          }}
                          aria-label="View proof of payment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="apx-icon-action"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setEditForm(fromPayment(payment))
                            setEditProofFile(null)
                            setKeepEditProof(Boolean(payment.proofUrl))
                            setEditOpen(true)
                          }}
                          aria-label="Edit payment"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="apx-icon-action-danger"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setConfirmConfig({
                              kind: 'delete',
                              title: 'Delete Payment',
                              description: `Delete payment for ${payment.projectName || 'project'}? This cannot be undone.`,
                              confirmLabel: 'Delete',
                              tone: 'danger',
                            })
                            setConfirmOpen(true)
                          }}
                          aria-label="Delete payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ApexModal size="md" open={addOpen} title="Add Payment" subtitle="Create a payment record." onClose={() => setAddOpen(false)}>
        <PaymentForm
          form={addForm}
          onChange={setAddForm}
          projects={projects}
          currencies={currencies}
          proofFile={addProofFile}
          setProofFile={setAddProofFile}
          showKeepProof={false}
          keepProof={true}
          onKeepProofChange={() => undefined}
          onCancel={() => setAddOpen(false)}
          onSubmit={() => {
            void handleCreate()
          }}
          submitLabel="Save Payment"
        />
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Payment" subtitle="Update payment details." onClose={() => setEditOpen(false)}>
        <PaymentForm
          form={editForm}
          onChange={setEditForm}
          projects={projects}
          currencies={currencies}
          proofFile={editProofFile}
          setProofFile={setEditProofFile}
          showKeepProof={Boolean(selectedPayment?.proofUrl)}
          keepProof={keepEditProof}
          onKeepProofChange={setKeepEditProof}
          existingProofUrl={selectedPayment?.proofUrl || ''}
          onCancel={() => setEditOpen(false)}
          onSubmit={() => {
            void handleEdit()
          }}
          submitLabel="Save Changes"
        />
      </ApexModal>

      <ApexModal size="sm" open={viewOpen} title="Payment Details" subtitle="View payment details." onClose={() => setViewOpen(false)}>
        {selectedPayment ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs apx-muted">Project</p><p className="apx-text font-semibold">{selectedPayment.projectName || '-'}</p></div>
              <div><p className="text-xs apx-muted">Client</p><p className="apx-text">{selectedPayment.clientName}</p></div>
              <div><p className="text-xs apx-muted">Total Price</p><p className="apx-text">{formatMoney(selectedPayment.totalPrice, 'PHP')}</p></div>
              <div><p className="text-xs apx-muted">Amount Paid</p><p className="apx-text">{formatMoney(selectedPayment.amount, selectedPayment.currency)}</p></div>
              <div><p className="text-xs apx-muted">Balance</p><p className="apx-text">{formatMoney(selectedPayment.projectBalance, 'PHP')}</p></div>
              <div><p className="text-xs apx-muted">O.R. #</p><p className="apx-text">{selectedPayment.orNumber || '-'}</p></div>
              <div><p className="text-xs apx-muted">Method</p><p className="apx-text">{selectedPayment.paymentMethod || '-'}</p></div>
              <div><p className="text-xs apx-muted">Date</p><p className="apx-text">{formatDate(selectedPayment.paymentDate)}</p></div>
            </div>
            {selectedPayment.notes ? (
              <div>
                <p className="text-xs apx-muted">Notes</p>
                <p className="text-sm apx-text">{selectedPayment.notes}</p>
              </div>
            ) : null}
            {selectedPayment.proofUrl ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--apx-border)', color: 'var(--apx-primary)' }}
                onClick={() => window.open(normalizeExternalUrl(selectedPayment.proofUrl || ''), '_blank', 'noopener,noreferrer')}
              >
                <Eye className="h-4 w-4" />
                View Proof Image
              </button>
            ) : null}
          </div>
        ) : null}
      </ApexModal>

      <ApexModal size="sm" open={projectInvoiceOpen} title="Project Invoice" subtitle="Generate full invoice for selected project." onClose={() => setProjectInvoiceOpen(false)}>
        {selectedProject ? (
          <div className="space-y-3">
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
              <p className="font-semibold apx-text">{selectedProject.projectName}</p>
              <p className="text-xs apx-muted">{selectedProject.clientName}</p>
            </div>
            <div className="flex justify-end gap-2">
              <ApexButton type="button" variant="outline" onClick={() => setProjectInvoiceOpen(false)}>Close</ApexButton>
              <ApexButton type="button" variant="outline" onClick={() => openProjectInvoicePdf(selectedProject.id)}>
                <ReceiptText className="h-4 w-4" />
                Open PDF
              </ApexButton>
              <ApexButton type="button" onClick={() => void sendProjectInvoice(selectedProject.id)}>
                <Mail className="h-4 w-4" />
                Send Email
              </ApexButton>
            </div>
          </div>
        ) : (
          <p className="text-sm apx-muted">Select a project first.</p>
        )}
      </ApexModal>

      <ApexConfirmationModal
        open={confirmOpen}
        title={confirmConfig?.title || 'Confirm action'}
        description={confirmConfig?.description || 'Proceed with this action?'}
        confirmLabel={confirmConfig?.confirmLabel || 'Confirm'}
        tone={confirmConfig?.tone || 'primary'}
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void executeConfirm()
        }}
      />
    </div>
  )
}

function PaymentForm({
  form,
  onChange,
  projects,
  currencies,
  proofFile,
  setProofFile,
  showKeepProof,
  keepProof,
  onKeepProofChange,
  existingProofUrl = '',
  onCancel,
  onSubmit,
  submitLabel,
}: {
  form: PaymentFormState
  onChange: (next: PaymentFormState) => void
  projects: ProjectOption[]
  currencies: CurrencyOption[]
  proofFile: File | null
  setProofFile: (file: File | null) => void
  showKeepProof: boolean
  keepProof: boolean
  onKeepProofChange: (next: boolean) => void
  existingProofUrl?: string
  onCancel: () => void
  onSubmit: () => void
  submitLabel: string
}) {
  const selectedProject = projects.find((project) => project.id === form.projectId) || null
  const selectedCurrency = currencies.find((currency) => currency.code === form.currency) || currencies[0]
  const previewUrl = proofFile ? URL.createObjectURL(proofFile) : keepProof ? existingProofUrl : ''

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Project Name</label>
        <ApexDropdown
          value={form.projectId}
          options={[{ value: '', label: 'Select project' }, ...projects.map((project) => ({ value: project.id, label: `${project.projectName} - ${project.clientName}` }))]}
          onChange={(value) => onChange({ ...form, projectId: value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Client Name</label>
        <ApexInput value={selectedProject?.clientName || ''} readOnly />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Total Price</label>
        <ApexInput value={selectedProject ? formatMoney(selectedProject.totalPrice, 'PHP') : ''} readOnly />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Payment Method</label>
        <ApexDropdown
          value={form.paymentMethod}
          options={[
            { value: 'Cash', label: 'Cash' },
            { value: 'Gcash', label: 'Gcash' },
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'Credit Card', label: 'Credit Card' },
            { value: 'PayPal', label: 'PayPal' },
          ]}
          onChange={(value) => onChange({ ...form, paymentMethod: value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Payment Date</label>
        <ApexInput type="date" value={form.paymentDate} onChange={(event) => onChange({ ...form, paymentDate: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Currency</label>
        <ApexDropdown
          value={form.currency}
          options={currencies.map((currency) => ({ value: currency.code, label: `${currency.symbol} - ${currency.label}` }))}
          onChange={(value) => onChange({ ...form, currency: value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
        <ApexDropdown
          value={form.status}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'partial', label: 'Partial' },
            { value: 'paid', label: 'Paid' },
            { value: 'refunded', label: 'Refunded' },
            { value: 'failed', label: 'Failed' },
          ]}
          onChange={(value) => onChange({ ...form, status: value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Amount</label>
        <ApexInput
          value={form.amount}
          onChange={(event) => onChange({ ...form, amount: event.target.value })}
          onBlur={() => onChange({ ...form, amount: formatMoney(parseAmountInput(form.amount), selectedCurrency.code) })}
          placeholder={`${selectedCurrency.symbol} 0.00`}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">O.R. # (optional)</label>
        <ApexInput value={form.orNumber} onChange={(event) => onChange({ ...form, orNumber: event.target.value })} />
      </div>

      <div className="md:col-span-2">
        {showKeepProof ? (
          <label className="mb-2 inline-flex items-center gap-2 text-xs apx-muted">
            <input type="checkbox" checked={keepProof} onChange={(event) => onKeepProofChange(event.target.checked)} />
            Keep existing proof image
          </label>
        ) : null}
        <ApexImageDropzone
          label="Proof of Payment"
          previewUrl={previewUrl}
          previewVariant="portrait"
          onFileSelect={(file) => {
            onKeepProofChange(false)
            setProofFile(file)
          }}
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Notes</label>
        <ApexTextarea rows={3} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} />
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-1">
        <ApexButton type="button" variant="outline" onClick={onCancel}>Cancel</ApexButton>
        <ApexButton type="submit">{submitLabel}</ApexButton>
      </div>
    </form>
  )
}
