'use client'

import { useMemo, useState } from 'react'
import { Download, Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexConfirmationModal,
  ApexFileDropzone,
  ApexModal,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type PaymentRow = {
  id: string
  clientName: string
  projectName: string | null
  amount: number
  currency: string
  paymentMethod: string | null
  paymentDate: string | null
  status: string
  proofUrl: string | null
  notes: string | null
  createdAt: string | null
}

type PaymentFormState = {
  id?: string
  clientName: string
  projectName: string
  amount: string
  currency: string
  paymentMethod: string
  paymentDate: string
  status: string
  notes: string
}

const STATUS_OPTIONS = ['pending', 'partial', 'paid', 'refunded', 'failed']

function defaultForm(): PaymentFormState {
  return {
    clientName: '',
    projectName: '',
    amount: '',
    currency: 'PHP',
    paymentMethod: '',
    paymentDate: '',
    status: 'pending',
    notes: '',
  }
}

function fromPayment(row: PaymentRow): PaymentFormState {
  return {
    id: row.id,
    clientName: row.clientName,
    projectName: row.projectName || '',
    amount: String(row.amount || ''),
    currency: row.currency || 'PHP',
    paymentMethod: row.paymentMethod || '',
    paymentDate: row.paymentDate || '',
    status: row.status || 'pending',
    notes: row.notes || '',
  }
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export default function AdminPaymentsTemplateView({
  payments,
  createPaymentAction,
  updatePaymentAction,
  deletePaymentAction,
}: {
  payments: PaymentRow[]
  createPaymentAction: (formData: FormData) => Promise<void>
  updatePaymentAction: (formData: FormData) => Promise<void>
  deletePaymentAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])

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

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return payments.filter((item) => {
      const statusMatch = status === 'all' ? true : item.status === status
      const searchMatch = keyword
        ? [item.clientName, item.projectName || '', item.paymentMethod || '', item.notes || ''].join(' ').toLowerCase().includes(keyword)
        : true
      return statusMatch && searchMatch
    })
  }, [payments, search, status])

  const totals = useMemo(() => {
    const total = payments.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const paid = payments.filter((row) => row.status === 'paid').length
    const pendingCount = payments.filter((row) => row.status === 'pending' || row.status === 'partial').length
    return { total, paid, pendingCount }
  }, [payments])

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toFormData(form: PaymentFormState, proofFiles: File[], keepProof = true) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('clientName', form.clientName)
    formData.set('projectName', form.projectName)
    formData.set('amount', form.amount)
    formData.set('currency', form.currency)
    formData.set('paymentMethod', form.paymentMethod)
    formData.set('paymentDate', form.paymentDate)
    formData.set('status', form.status)
    formData.set('notes', form.notes)
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

  async function handleDelete() {
    if (!selectedPayment) return
    setPending(true)
    try {
      const formData = new FormData()
      formData.set('id', selectedPayment.id)
      await deletePaymentAction(formData)
      setConfirmOpen(false)
      setViewOpen(false)
      addToast('Payment record deleted', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete payment record.', 'danger')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      {pending ? <ApexBlockingSpinner label="Saving payment changes..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Payment' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Payment Tracking</h1>
          <p className="mt-1 text-sm apx-muted">Manage payment records, statuses, and proof uploads.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddForm(defaultForm())
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-xs uppercase tracking-wide apx-muted">Total Value</p>
          <p className="mt-1 text-2xl font-bold apx-text">{formatMoney(totals.total, 'PHP')}</p>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-xs uppercase tracking-wide apx-muted">Paid Records</p>
          <p className="mt-1 text-2xl font-bold apx-text">{totals.paid}</p>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-xs uppercase tracking-wide apx-muted">Pending / Partial</p>
          <p className="mt-1 text-2xl font-bold apx-text">{totals.pendingCount}</p>
        </div>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: payments.length },
          { key: 'pending', label: 'Pending', count: payments.filter((p) => p.status === 'pending').length, indicatorColor: '#64748b' },
          { key: 'partial', label: 'Partial', count: payments.filter((p) => p.status === 'partial').length, indicatorColor: '#f59e0b' },
          { key: 'paid', label: 'Paid', count: payments.filter((p) => p.status === 'paid').length, indicatorColor: '#16a34a' },
          { key: 'refunded', label: 'Refunded', count: payments.filter((p) => p.status === 'refunded').length, indicatorColor: '#4f46e5' },
          { key: 'failed', label: 'Failed', count: payments.filter((p) => p.status === 'failed').length, indicatorColor: '#dc2626' },
        ]}
        active={status}
        onChange={setStatus}
      />

      <div className="w-full md:max-w-md">
        <ApexSearchField value={search} onChange={setSearch} placeholder="Search payments..." />
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="px-4 py-3 font-semibold apx-text">Client</th>
              <th className="px-4 py-3 font-semibold apx-text">Project</th>
              <th className="px-4 py-3 font-semibold apx-text">Amount</th>
              <th className="px-4 py-3 font-semibold apx-text">Date</th>
              <th className="px-4 py-3 font-semibold apx-text">Status</th>
              <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const tone = statusTone(row.status)
              return (
                <tr key={row.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-semibold apx-text">{row.clientName}</p>
                    <p className="text-xs apx-muted">{row.paymentMethod || '-'}</p>
                  </td>
                  <td className="px-4 py-3 apx-text">{row.projectName || '-'}</td>
                  <td className="px-4 py-3 apx-text">{formatMoney(row.amount, row.currency)}</td>
                  <td className="px-4 py-3 apx-muted">{formatDate(row.paymentDate)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: tone.bg, color: tone.fg }}>
                      {row.status}
                    </span>
                  </td>
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
                        className="apx-icon-action-danger"
                        onClick={() => {
                          setSelectedPayment(row)
                          setConfirmOpen(true)
                        }}
                        aria-label={`Delete ${row.clientName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ApexModal size="md" open={addOpen} title="Add Payment" subtitle="Create a new payment record." onClose={() => setAddOpen(false)}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            void handleCreate()
          }}
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Client Name</label>
            <ApexInput required value={addForm.clientName} onChange={(event) => setAddForm((prev) => ({ ...prev, clientName: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Project</label>
            <ApexInput value={addForm.projectName} onChange={(event) => setAddForm((prev) => ({ ...prev, projectName: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Payment Method</label>
            <ApexInput value={addForm.paymentMethod} onChange={(event) => setAddForm((prev) => ({ ...prev, paymentMethod: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Amount</label>
            <ApexInput required type="number" min="0" step="0.01" value={addForm.amount} onChange={(event) => setAddForm((prev) => ({ ...prev, amount: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Currency</label>
            <ApexInput value={addForm.currency} onChange={(event) => setAddForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Payment Date</label>
            <ApexInput type="date" value={addForm.paymentDate} onChange={(event) => setAddForm((prev) => ({ ...prev, paymentDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <select className="apx-select" value={addForm.status} onChange={(event) => setAddForm((prev) => ({ ...prev, status: event.target.value }))}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Proof of Payment (optional)</label>
            <ApexFileDropzone maxFiles={1} maxSizeMb={10} files={addProof} onFilesChange={setAddProof} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Notes</label>
            <ApexTextarea rows={3} value={addForm.notes} onChange={(event) => setAddForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Payment</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Payment" subtitle="Update payment record details." onClose={() => setEditOpen(false)}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            void handleEdit()
          }}
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Client Name</label>
            <ApexInput required value={editForm.clientName} onChange={(event) => setEditForm((prev) => ({ ...prev, clientName: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Project</label>
            <ApexInput value={editForm.projectName} onChange={(event) => setEditForm((prev) => ({ ...prev, projectName: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Payment Method</label>
            <ApexInput value={editForm.paymentMethod} onChange={(event) => setEditForm((prev) => ({ ...prev, paymentMethod: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Amount</label>
            <ApexInput required type="number" min="0" step="0.01" value={editForm.amount} onChange={(event) => setEditForm((prev) => ({ ...prev, amount: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Currency</label>
            <ApexInput value={editForm.currency} onChange={(event) => setEditForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Payment Date</label>
            <ApexInput type="date" value={editForm.paymentDate} onChange={(event) => setEditForm((prev) => ({ ...prev, paymentDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <select className="apx-select" value={editForm.status} onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium apx-muted">Proof of Payment</label>
              {selectedPayment?.proofUrl ? (
                <label className="inline-flex items-center gap-2 text-xs apx-muted">
                  <input type="checkbox" checked={keepEditProof} onChange={(event) => setKeepEditProof(event.target.checked)} />
                  Keep existing proof
                </label>
              ) : null}
            </div>
            <ApexFileDropzone maxFiles={1} maxSizeMb={10} files={editProof} onFilesChange={setEditProof} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Notes</label>
            <ApexTextarea rows={3} value={editForm.notes} onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={viewOpen} title="Payment Details" subtitle="View selected payment record." onClose={() => setViewOpen(false)}>
        {selectedPayment ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs apx-muted">Client</p>
                <p className="font-semibold apx-text">{selectedPayment.clientName}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Project</p>
                <p className="apx-text">{selectedPayment.projectName || '-'}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Amount</p>
                <p className="apx-text">{formatMoney(selectedPayment.amount, selectedPayment.currency)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Date</p>
                <p className="apx-text">{formatDate(selectedPayment.paymentDate)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Status</p>
                <p className="capitalize apx-text">{selectedPayment.status}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Created</p>
                <p className="apx-text">{formatDate(selectedPayment.createdAt)}</p>
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
        title="Delete Payment Record"
        description={`Delete ${selectedPayment?.clientName || 'this payment record'}? This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </div>
  )
}
