'use client'

import { useMemo, useState } from 'react'
import { Download, Edit2, Eye, FileBadge2, Mail, Plus, ReceiptText, RefreshCw, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexColumnsToggle,
  ApexConfirmationModal,
  ApexDropdown,
  ApexExportButton,
  ApexFileDropzone,
  ApexModal,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type PaymentRow = {
  id: string
  projectId: string | null
  clientName: string
  projectName: string | null
  amount: number
  currency: string
  paymentMethod: string | null
  paymentType: string
  paymentDate: string | null
  status: string
  proofUrl: string | null
  notes: string | null
  invoiceNumber: string | null
  invoiceStatus: string
  invoiceDueDate: string | null
  invoiceSentAt: string | null
  createdAt: string | null
}

type ProjectOption = {
  id: string
  projectName: string
  clientName: string
  totalPrice: number
  balance: number
}

type PaymentFormState = {
  id?: string
  projectId: string
  amount: string
  currency: string
  paymentMethod: string
  paymentType: string
  paymentDate: string
  status: string
  notes: string
  invoiceNumber: string
  invoiceDueDate: string
}

type ColumnKey = 'project' | 'client' | 'type' | 'amount' | 'method' | 'paymentDate' | 'invoice' | 'status' | 'proof' | 'actions'

type ConfirmKind = 'delete' | 'generateInvoice' | 'markInvoiceSent' | 'toggleSettled'

const STATUS_OPTIONS = ['pending', 'partial', 'paid', 'refunded', 'failed']
const PAYMENT_METHOD_OPTIONS = ['Bank Transfer', 'GCash', 'Cash', 'Credit Card', 'PayPal', 'Other']
const PAYMENT_TYPE_OPTIONS = [
  { value: 'initial', label: 'Initial Payment' },
  { value: 'second', label: 'Second Payment' },
  { value: 'third', label: 'Third Payment' },
  { value: 'final', label: 'Final Payment' },
  { value: 'custom', label: 'Custom' },
]

function defaultForm(): PaymentFormState {
  return {
    projectId: '',
    amount: '',
    currency: 'PHP',
    paymentMethod: 'Bank Transfer',
    paymentType: 'initial',
    paymentDate: '',
    status: 'pending',
    notes: '',
    invoiceNumber: '',
    invoiceDueDate: '',
  }
}

function fromPayment(row: PaymentRow): PaymentFormState {
  return {
    id: row.id,
    projectId: row.projectId || '',
    amount: String(row.amount || ''),
    currency: row.currency || 'PHP',
    paymentMethod: row.paymentMethod || 'Bank Transfer',
    paymentType: row.paymentType || 'custom',
    paymentDate: row.paymentDate || '',
    status: row.status || 'pending',
    notes: row.notes || '',
    invoiceNumber: row.invoiceNumber || '',
    invoiceDueDate: row.invoiceDueDate || '',
  }
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatMoney(amount: number, currency: string) {
  const code = (currency || 'PHP').toUpperCase()
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: code,
  }).format(amount)
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'paid') return { bg: '#dcfce7', fg: '#166534' }
  if (normalized === 'partial') return { bg: '#fef3c7', fg: '#92400e' }
  if (normalized === 'failed') return { bg: '#fee2e2', fg: '#991b1b' }
  if (normalized === 'refunded') return { bg: '#e0e7ff', fg: '#3730a3' }
  return { bg: '#e2e8f0', fg: '#334155' }
}

function invoiceTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'sent') return { bg: 'rgba(22,163,74,0.12)', fg: '#166534' }
  if (normalized === 'generated') return { bg: 'rgba(14,165,233,0.12)', fg: '#0369a1' }
  return { bg: 'rgba(100,116,139,0.15)', fg: '#334155' }
}

function paymentTypeLabel(value: string) {
  const found = PAYMENT_TYPE_OPTIONS.find((option) => option.value === value)
  return found?.label || 'Custom'
}

function toCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function nextInvoiceNumber() {
  const stamp = Date.now().toString().slice(-6)
  return `INV-${stamp}`
}

export default function AdminPaymentsTemplateView({
  payments,
  projects,
  createPaymentAction,
  updatePaymentAction,
  deletePaymentAction,
  generateInvoiceAction,
  markInvoiceSentAction,
  togglePaymentSettledAction,
}: {
  payments: PaymentRow[]
  projects: ProjectOption[]
  createPaymentAction: (formData: FormData) => Promise<void>
  updatePaymentAction: (formData: FormData) => Promise<void>
  deletePaymentAction: (formData: FormData) => Promise<void>
  generateInvoiceAction: (formData: FormData) => Promise<void>
  markInvoiceSentAction: (formData: FormData) => Promise<void>
  togglePaymentSettledAction: (formData: FormData) => Promise<void>
}) {
  const [projectFilter, setProjectFilter] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    project: true,
    client: true,
    type: true,
    amount: true,
    method: true,
    paymentDate: true,
    invoice: true,
    status: true,
    proof: true,
    actions: true,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null)
  const [addForm, setAddForm] = useState<PaymentFormState>(defaultForm())
  const [editForm, setEditForm] = useState<PaymentFormState>(defaultForm())
  const [addProof, setAddProof] = useState<File[]>([])
  const [editProof, setEditProof] = useState<File[]>([])
  const [keepEditProof, setKeepEditProof] = useState(true)
  const [confirmConfig, setConfirmConfig] = useState<{ kind: ConfirmKind; title: string; description: string; confirmLabel: string; tone: 'primary' | 'danger' } | null>(null)

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])

  const visiblePayments = useMemo(() => {
    if (!projectFilter) return []
    const keyword = search.trim().toLowerCase()
    return payments.filter((item) => {
      if (item.projectId !== projectFilter) return false
      const statusMatch = status === 'all' ? true : item.status === status
      const searchMatch = keyword
        ? [item.clientName, item.projectName || '', item.paymentMethod || '', item.notes || '', item.invoiceNumber || ''].join(' ').toLowerCase().includes(keyword)
        : true
      return statusMatch && searchMatch
    })
  }, [payments, projectFilter, search, status])

  const selectedProject = projectFilter ? projectMap.get(projectFilter) || null : null

  const totals = useMemo(() => {
    const total = visiblePayments.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const paid = visiblePayments.filter((row) => row.status === 'paid').reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const pending = visiblePayments.filter((row) => row.status === 'pending' || row.status === 'partial').reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const records = visiblePayments.length
    return { total, paid, pending, records }
  }, [visiblePayments])

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toggleColumn(key: string) {
    const typed = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typed]: !prev[typed] }))
  }

  function toFormData(form: PaymentFormState, proofFiles: File[], keepProof = true) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('projectId', form.projectId)
    formData.set('amount', form.amount)
    formData.set('currency', form.currency)
    formData.set('paymentMethod', form.paymentMethod)
    formData.set('paymentType', form.paymentType)
    formData.set('paymentDate', form.paymentDate)
    formData.set('status', form.status)
    formData.set('notes', form.notes)
    formData.set('invoiceNumber', form.invoiceNumber)
    formData.set('invoiceDueDate', form.invoiceDueDate)
    formData.set('keepProof', keepProof ? '1' : '0')
    if (proofFiles[0]) formData.set('proofFile', proofFiles[0])
    return formData
  }

  async function handleCreate() {
    setPending(true)
    try {
      await createPaymentAction(toFormData(addForm, addProof, true))
      setAddOpen(false)
      setAddForm(defaultForm())
      setAddProof([])
      addToast('Payment record added', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to create payment record.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function handleEdit() {
    setPending(true)
    try {
      await updatePaymentAction(toFormData(editForm, editProof, keepEditProof))
      setEditOpen(false)
      setEditProof([])
      addToast('Payment record updated', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update payment record.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function executeConfirm() {
    if (!selectedPayment || !confirmConfig) return
    setPending(true)
    try {
      const formData = new FormData()
      formData.set('id', selectedPayment.id)

      if (confirmConfig.kind === 'delete') {
        await deletePaymentAction(formData)
        setViewOpen(false)
        addToast('Payment record deleted', 'success')
      }
      if (confirmConfig.kind === 'generateInvoice') {
        await generateInvoiceAction(formData)
        addToast('Invoice generated', 'success')
      }
      if (confirmConfig.kind === 'markInvoiceSent') {
        await markInvoiceSentAction(formData)
        addToast('Invoice marked as sent', 'success')
      }
      if (confirmConfig.kind === 'toggleSettled') {
        await togglePaymentSettledAction(formData)
        addToast('Payment status updated', 'success')
      }
      setConfirmOpen(false)
      setConfirmConfig(null)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Action failed.', 'danger')
    } finally {
      setPending(false)
    }
  }

  function exportCsv() {
    if (!selectedProject) return
    const rows = visiblePayments.map((row) => [
      row.projectName || '',
      row.clientName,
      paymentTypeLabel(row.paymentType),
      formatMoney(row.amount, row.currency),
      row.paymentMethod || '-',
      formatDate(row.paymentDate),
      row.invoiceNumber || '-',
      row.invoiceStatus,
      row.status,
      row.proofUrl ? 'Yes' : 'No',
    ])
    toCsv(`${selectedProject.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-payments.csv`, [['Project', 'Client', 'Payment Type', 'Amount', 'Method', 'Date', 'Invoice No.', 'Invoice Status', 'Payment Status', 'Proof'], ...rows])
    addToast('Payment records exported', 'success')
  }

  return (
    <div className="space-y-4">
      {pending ? <ApexBlockingSpinner label="Saving payment changes..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Payment' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Payment Tracking</h1>
          <p className="mt-1 text-sm apx-muted">Track invoices and settlements by ongoing project.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!projectFilter) {
              addToast('Select a project first before adding a payment.', 'default')
              return
            }
            setAddForm({ ...defaultForm(), projectId: projectFilter, invoiceNumber: nextInvoiceNumber() })
            setAddProof([])
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Payment
        </button>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide apx-muted">Project Filter</label>
            <ApexDropdown
              value={projectFilter}
              placeholder="Select project"
              options={[{ value: '', label: 'Select project' }, ...projects.map((project) => ({ value: project.id, label: `${project.projectName} - ${project.clientName}` }))]}
              onChange={setProjectFilter}
            />
          </div>
          <div className="text-sm apx-muted">{selectedProject ? `Outstanding balance: ${formatMoney(selectedProject.balance, 'PHP')}` : 'Select a project to load records.'}</div>
        </div>
      </div>

      {projectFilter ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              <p className="text-xs uppercase tracking-wide apx-muted">Project Price</p>
              <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(selectedProject?.totalPrice || 0, 'PHP')}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              <p className="text-xs uppercase tracking-wide apx-muted">Collected</p>
              <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(totals.paid, 'PHP')}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              <p className="text-xs uppercase tracking-wide apx-muted">Pending / Partial</p>
              <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(totals.pending, 'PHP')}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              <p className="text-xs uppercase tracking-wide apx-muted">Records</p>
              <p className="mt-1 text-2xl font-bold apx-text">{totals.records}</p>
            </div>
          </div>

          <ApexStatusTabs
            tabs={[
              { key: 'all', label: 'All', count: visiblePayments.length },
              { key: 'pending', label: 'Pending', count: visiblePayments.filter((p) => p.status === 'pending').length, indicatorColor: '#64748b' },
              { key: 'partial', label: 'Partial', count: visiblePayments.filter((p) => p.status === 'partial').length, indicatorColor: '#f59e0b' },
              { key: 'paid', label: 'Paid', count: visiblePayments.filter((p) => p.status === 'paid').length, indicatorColor: '#16a34a' },
              { key: 'refunded', label: 'Refunded', count: visiblePayments.filter((p) => p.status === 'refunded').length, indicatorColor: '#4f46e5' },
              { key: 'failed', label: 'Failed', count: visiblePayments.filter((p) => p.status === 'failed').length, indicatorColor: '#dc2626' },
            ]}
            active={status}
            onChange={setStatus}
          />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <ApexSearchField value={search} onChange={setSearch} placeholder="Search payments, invoice numbers, or notes..." />
            </div>
            <div className="flex items-center gap-2">
              <ApexColumnsToggle
                columns={[
                  { key: 'project', label: 'Project', visible: columns.project },
                  { key: 'client', label: 'Client', visible: columns.client },
                  { key: 'type', label: 'Payment Type', visible: columns.type },
                  { key: 'amount', label: 'Amount', visible: columns.amount },
                  { key: 'method', label: 'Method', visible: columns.method },
                  { key: 'paymentDate', label: 'Date', visible: columns.paymentDate },
                  { key: 'invoice', label: 'Invoice', visible: columns.invoice },
                  { key: 'status', label: 'Status', visible: columns.status },
                  { key: 'proof', label: 'Proof', visible: columns.proof },
                  { key: 'actions', label: 'Actions', visible: columns.actions },
                ]}
                onToggle={toggleColumn}
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
                  {columns.type ? <th className="px-4 py-3 font-semibold apx-text">Type</th> : null}
                  {columns.amount ? <th className="px-4 py-3 font-semibold apx-text">Amount</th> : null}
                  {columns.method ? <th className="px-4 py-3 font-semibold apx-text">Method</th> : null}
                  {columns.paymentDate ? <th className="px-4 py-3 font-semibold apx-text">Date</th> : null}
                  {columns.invoice ? <th className="px-4 py-3 font-semibold apx-text">Invoice</th> : null}
                  {columns.status ? <th className="px-4 py-3 font-semibold apx-text">Status</th> : null}
                  {columns.proof ? <th className="px-4 py-3 font-semibold apx-text">Proof</th> : null}
                  {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {visiblePayments.length ? (
                  visiblePayments.map((row) => {
                    const tone = statusTone(row.status)
                    const iTone = invoiceTone(row.invoiceStatus)
                    return (
                      <tr key={row.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                        {columns.project ? <td className="px-4 py-3 apx-text">{row.projectName || '-'}</td> : null}
                        {columns.client ? <td className="px-4 py-3 apx-text">{row.clientName}</td> : null}
                        {columns.type ? <td className="px-4 py-3 apx-text">{paymentTypeLabel(row.paymentType)}</td> : null}
                        {columns.amount ? <td className="px-4 py-3 apx-text">{formatMoney(row.amount, row.currency)}</td> : null}
                        {columns.method ? <td className="px-4 py-3 apx-text">{row.paymentMethod || '-'}</td> : null}
                        {columns.paymentDate ? <td className="px-4 py-3 apx-muted">{formatDate(row.paymentDate)}</td> : null}
                        {columns.invoice ? (
                          <td className="px-4 py-3">
                            <p className="apx-text">{row.invoiceNumber || '-'}</p>
                            <span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: iTone.bg, color: iTone.fg }}>
                              {row.invoiceStatus}
                            </span>
                          </td>
                        ) : null}
                        {columns.status ? (
                          <td className="px-4 py-3">
                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: tone.bg, color: tone.fg }}>
                              {row.status}
                            </span>
                          </td>
                        ) : null}
                        {columns.proof ? (
                          <td className="px-4 py-3">
                            {row.proofUrl ? (
                              <a href={row.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--apx-primary)' }}>
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </a>
                            ) : (
                              <span className="text-xs apx-muted">No proof</span>
                            )}
                          </td>
                        ) : null}
                        {columns.actions ? (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                className="apx-icon-action"
                                onClick={() => {
                                  setSelectedPayment(row)
                                  setViewOpen(true)
                                }}
                                aria-label={`View ${row.clientName}`}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="apx-icon-action"
                                onClick={() => {
                                  setSelectedPayment(row)
                                  setEditForm(fromPayment(row))
                                  setEditProof([])
                                  setKeepEditProof(Boolean(row.proofUrl))
                                  setEditOpen(true)
                                }}
                                aria-label={`Edit ${row.clientName}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="apx-icon-action"
                                onClick={() => {
                                  setSelectedPayment(row)
                                  setConfirmConfig({
                                    kind: 'generateInvoice',
                                    title: 'Generate Invoice',
                                    description: `Generate invoice for ${row.projectName || 'this payment'}?`,
                                    confirmLabel: 'Generate',
                                    tone: 'primary',
                                  })
                                  setConfirmOpen(true)
                                }}
                                aria-label="Generate invoice"
                              >
                                <ReceiptText className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="apx-icon-action"
                                onClick={() => {
                                  setSelectedPayment(row)
                                  setConfirmConfig({
                                    kind: 'markInvoiceSent',
                                    title: 'Send Invoice',
                                    description: `Mark invoice as sent for ${row.projectName || 'this payment'}?`,
                                    confirmLabel: 'Mark Sent',
                                    tone: 'primary',
                                  })
                                  setConfirmOpen(true)
                                }}
                                aria-label="Mark invoice sent"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="apx-icon-action"
                                onClick={() => {
                                  setSelectedPayment(row)
                                  setConfirmConfig({
                                    kind: 'toggleSettled',
                                    title: row.status === 'paid' ? 'Set Payment Pending' : 'Set Payment Paid',
                                    description: `Update settlement status for ${row.projectName || 'this payment'}?`,
                                    confirmLabel: row.status === 'paid' ? 'Set Pending' : 'Set Paid',
                                    tone: 'primary',
                                  })
                                  setConfirmOpen(true)
                                }}
                                aria-label="Toggle settled"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="apx-icon-action-danger"
                                onClick={() => {
                                  setSelectedPayment(row)
                                  setConfirmConfig({
                                    kind: 'delete',
                                    title: 'Delete Payment Record',
                                    description: `Delete ${row.projectName || 'this payment record'}? This cannot be undone.`,
                                    confirmLabel: 'Delete',
                                    tone: 'danger',
                                  })
                                  setConfirmOpen(true)
                                }}
                                aria-label={`Delete ${row.clientName}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm apx-muted">No payment records found for this project and filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <FileBadge2 className="mx-auto h-8 w-8 apx-muted" />
          <p className="mt-3 text-sm apx-muted">Select a project first to view and manage payments.</p>
        </div>
      )}

      <ApexModal size="md" open={addOpen} title="Add Payment" subtitle="Create a project payment record." onClose={() => setAddOpen(false)}>
        <PaymentForm
          form={addForm}
          onChange={setAddForm}
          projects={projects}
          proof={addProof}
          onProofChange={setAddProof}
          keepProof={true}
          onKeepProofChange={() => undefined}
          onCancel={() => setAddOpen(false)}
          onSubmit={() => {
            void handleCreate()
          }}
          submitLabel="Save Payment"
        />
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Payment" subtitle="Update payment record details." onClose={() => setEditOpen(false)}>
        <PaymentForm
          form={editForm}
          onChange={setEditForm}
          projects={projects}
          proof={editProof}
          onProofChange={setEditProof}
          keepProof={keepEditProof}
          onKeepProofChange={setKeepEditProof}
          showKeepProof={Boolean(selectedPayment?.proofUrl)}
          onCancel={() => setEditOpen(false)}
          onSubmit={() => {
            void handleEdit()
          }}
          submitLabel="Save Changes"
        />
      </ApexModal>

      <ApexModal size="sm" open={viewOpen} title="Payment Details" subtitle="View selected payment record." onClose={() => setViewOpen(false)}>
        {selectedPayment ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs apx-muted">Project</p>
                <p className="font-semibold apx-text">{selectedPayment.projectName || '-'}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Client</p>
                <p className="apx-text">{selectedPayment.clientName}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Amount</p>
                <p className="apx-text">{formatMoney(selectedPayment.amount, selectedPayment.currency)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Type</p>
                <p className="apx-text">{paymentTypeLabel(selectedPayment.paymentType)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Status</p>
                <p className="capitalize apx-text">{selectedPayment.status}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Payment Date</p>
                <p className="apx-text">{formatDate(selectedPayment.paymentDate)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Invoice No.</p>
                <p className="apx-text">{selectedPayment.invoiceNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Invoice Sent</p>
                <p className="apx-text">{formatDateTime(selectedPayment.invoiceSentAt)}</p>
              </div>
            </div>

            {selectedPayment.notes ? (
              <div>
                <p className="text-xs apx-muted">Notes</p>
                <p className="text-sm apx-text">{selectedPayment.notes}</p>
              </div>
            ) : null}

            {selectedPayment.proofUrl ? (
              <div className="flex justify-end">
                <a
                  href={selectedPayment.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm apx-text"
                  style={{ borderColor: 'var(--apx-border)' }}
                >
                  <Download className="h-4 w-4" />
                  Open Proof
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
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
  proof,
  onProofChange,
  keepProof,
  onKeepProofChange,
  showKeepProof = false,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  form: PaymentFormState
  onChange: (next: PaymentFormState) => void
  projects: ProjectOption[]
  proof: File[]
  onProofChange: (files: File[]) => void
  keepProof: boolean
  onKeepProofChange: (next: boolean) => void
  showKeepProof?: boolean
  onCancel: () => void
  onSubmit: () => void
  submitLabel: string
}) {
  const selectedProject = projects.find((project) => project.id === form.projectId) || null

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
        <label className="mb-1 block text-xs font-medium apx-muted">Client</label>
        <ApexInput value={selectedProject?.clientName || ''} readOnly placeholder="Auto-filled from project" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Payment Type</label>
        <ApexDropdown
          value={form.paymentType}
          options={PAYMENT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          onChange={(value) => onChange({ ...form, paymentType: value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Amount</label>
        <ApexInput required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => onChange({ ...form, amount: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Currency</label>
        <ApexDropdown value={form.currency} options={[{ value: 'PHP', label: 'PHP' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }]} onChange={(value) => onChange({ ...form, currency: value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Payment Method</label>
        <ApexDropdown value={form.paymentMethod} options={PAYMENT_METHOD_OPTIONS.map((option) => ({ value: option, label: option }))} onChange={(value) => onChange({ ...form, paymentMethod: value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Payment Date</label>
        <ApexInput type="date" value={form.paymentDate} onChange={(event) => onChange({ ...form, paymentDate: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
        <ApexDropdown value={form.status} options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))} onChange={(value) => onChange({ ...form, status: value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Invoice Number</label>
        <ApexInput value={form.invoiceNumber} onChange={(event) => onChange({ ...form, invoiceNumber: event.target.value })} placeholder="INV-000001" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Invoice Due Date</label>
        <ApexInput type="date" value={form.invoiceDueDate} onChange={(event) => onChange({ ...form, invoiceDueDate: event.target.value })} />
      </div>

      <div className="md:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium apx-muted">Proof of Payment</label>
          {showKeepProof ? (
            <label className="inline-flex items-center gap-2 text-xs apx-muted">
              <input type="checkbox" checked={keepProof} onChange={(event) => onKeepProofChange(event.target.checked)} />
              Keep existing proof
            </label>
          ) : null}
        </div>
        <ApexFileDropzone maxFiles={1} maxSizeMb={10} files={proof} onFilesChange={onProofChange} />
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
