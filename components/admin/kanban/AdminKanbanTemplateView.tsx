'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { CalendarDays, Edit2, Plus, Power, Trash2, User } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexCheckbox,
  ApexConfirmationModal,
  ApexDropdown,
  ApexModal,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

type ProjectOption = {
  id: string
  name: string
  clientName: string
}

type TeamMember = {
  id: string
  name: string
  avatar: string | null
}

type TaskHistoryItem = {
  at?: string
  by?: string
  label?: string
}

type TaskRow = {
  id: string
  projectId: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  assigneeIds: string[]
  isActive: boolean
  history: TaskHistoryItem[]
  createdAt: string
  updatedAt: string
}

type TaskForm = {
  id?: string
  projectId: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  assigneeIds: string[]
}

type ConfirmKind = 'delete' | 'bulkDelete' | 'bulkSetInactive' | 'toggleActive'

const LANES: Array<{ key: TaskStatus; label: string; color: string; soft: string }> = [
  { key: 'todo', label: 'To Do', color: '#475569', soft: 'rgba(71,85,105,0.12)' },
  { key: 'inprogress', label: 'In Progress', color: '#0284c7', soft: 'rgba(2,132,199,0.12)' },
  { key: 'review', label: 'For Review', color: '#d97706', soft: 'rgba(217,119,6,0.12)' },
  { key: 'done', label: 'Done', color: '#16a34a', soft: 'rgba(22,163,74,0.12)' },
]

const PRIORITIES: Array<{ key: TaskPriority; label: string; color: string }> = [
  { key: 'low', label: 'Low', color: '#64748b' },
  { key: 'medium', label: 'Medium', color: '#0284c7' },
  { key: 'high', label: 'High', color: '#ea580c' },
]

const PRIORITY_SCORE: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 }

function defaultForm(projectId = ''): TaskForm {
  return {
    projectId,
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assigneeIds: [],
  }
}

function fromTask(task: TaskRow): TaskForm {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate || '',
    assigneeIds: task.assigneeIds,
  }
}

function laneLabel(status: TaskStatus) {
  return LANES.find((lane) => lane.key === status)?.label || 'To Do'
}

function priorityStyle(priority: TaskPriority) {
  const item = PRIORITIES.find((entry) => entry.key === priority)
  return { backgroundColor: `${item?.color || '#64748b'}22`, color: item?.color || '#334155' }
}

function formatDueDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminKanbanTemplateView({
  projects,
  teamMembers,
  tasks,
  createTaskAction,
  updateTaskAction,
  moveTaskAction,
  setTaskActiveAction,
  deleteTaskAction,
  bulkSetInactiveAction,
  bulkDeleteAction,
}: {
  projects: ProjectOption[]
  teamMembers: TeamMember[]
  tasks: TaskRow[]
  createTaskAction: (formData: FormData) => Promise<void>
  updateTaskAction: (formData: FormData) => Promise<void>
  moveTaskAction: (formData: FormData) => Promise<void>
  setTaskActiveAction: (formData: FormData) => Promise<void>
  deleteTaskAction: (formData: FormData) => Promise<void>
  bulkSetInactiveAction: (formData: FormData) => Promise<void>
  bulkDeleteAction: (formData: FormData) => Promise<void>
}) {
  const [projectFilter, setProjectFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active')
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null)
  const [taskForm, setTaskForm] = useState<TaskForm>(defaultForm())
  const [confirmConfig, setConfirmConfig] = useState<{ kind: ConfirmKind; title: string; description: string; confirmLabel: string; tone: 'primary' | 'danger' } | null>(null)

  const filteredTasks = useMemo(() => {
    if (!projectFilter) return []
    const keyword = search.trim().toLowerCase()
    return tasks.filter((task) => {
      if (task.projectId !== projectFilter) return false
      if (activeTab === 'active' && !task.isActive) return false
      if (activeTab === 'inactive' && task.isActive) return false
      if (!keyword) return true
      return [task.title, task.description || '', task.priority].join(' ').toLowerCase().includes(keyword)
    })
  }, [tasks, projectFilter, activeTab, search])

  const laneTasks = useMemo(() => {
    const map: Record<TaskStatus, TaskRow[]> = { todo: [], inprogress: [], review: [], done: [] }
    for (const task of filteredTasks) map[task.status].push(task)
    for (const lane of LANES) {
      map[lane.key].sort((a, b) => {
        const priorityDelta = PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority]
        if (priorityDelta !== 0) return priorityDelta
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    }
    return map
  }, [filteredTasks])

  const teamMap = useMemo(() => new Map(teamMembers.map((member) => [member.id, member])), [teamMembers])

  const counts = useMemo(
    () => ({
      active: tasks.filter((task) => task.projectId === projectFilter && task.isActive).length,
      inactive: tasks.filter((task) => task.projectId === projectFilter && !task.isActive).length,
    }),
    [projectFilter, tasks]
  )

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toFormData(form: TaskForm) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('projectId', form.projectId)
    formData.set('title', form.title)
    formData.set('description', form.description)
    formData.set('priority', form.priority)
    formData.set('status', form.status)
    formData.set('dueDate', form.dueDate)
    formData.set('assigneeIds', form.assigneeIds.join(','))
    return formData
  }

  async function handleCreate() {
    setPending(true)
    try {
      await createTaskAction(toFormData(taskForm))
      setAddOpen(false)
      setTaskForm(defaultForm(projectFilter))
      addToast('Task created', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to create task.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function handleEdit() {
    setPending(true)
    try {
      await updateTaskAction(toFormData(taskForm))
      setEditOpen(false)
      addToast('Task updated', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update task.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function moveTask(id: string, status: TaskStatus) {
    setPending(true)
    try {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('status', status)
      await moveTaskAction(formData)
      addToast(`Task moved to ${laneLabel(status)}`, 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to move task.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function executeConfirm() {
    if (!confirmConfig) return
    setPending(true)
    try {
      if (confirmConfig.kind === 'delete' && selectedTask) {
        const formData = new FormData()
        formData.set('id', selectedTask.id)
        await deleteTaskAction(formData)
        setViewOpen(false)
      }

      if (confirmConfig.kind === 'toggleActive' && selectedTask) {
        const formData = new FormData()
        formData.set('id', selectedTask.id)
        formData.set('isActive', selectedTask.isActive ? '0' : '1')
        await setTaskActiveAction(formData)
      }

      if (confirmConfig.kind === 'bulkSetInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveAction(formData)
        setSelectedIds([])
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteAction(formData)
        setSelectedIds([])
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
      addToast('Task action completed', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Action failed.', 'danger')
    } finally {
      setPending(false)
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const hasProjects = projects.length > 0

  return (
    <div className="space-y-4">
      {pending ? <ApexBlockingSpinner label="Updating board..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Kanban' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Kanban</h1>
          <p className="mt-1 text-sm apx-muted">Project-scoped task board with drag and drop progression.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!projectFilter) {
              addToast('Select a project first before adding tasks.', 'default')
              return
            }
            setTaskForm(defaultForm(projectFilter))
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {!hasProjects ? (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <p className="text-sm apx-muted">No ongoing projects found. Create a project first in Ongoing Projects to use Kanban.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
              <div className="w-full md:max-w-sm">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide apx-muted">Project Name</label>
                <ApexDropdown
                  value={projectFilter}
                  options={[{ value: '', label: 'Select a project first' }, ...projects.map((project) => ({ value: project.id, label: `${project.name} - ${project.clientName}` }))]}
                  onChange={(value) => {
                    setProjectFilter(value)
                    setSelectedIds([])
                  }}
                />
              </div>
              <div className="w-full md:max-w-sm">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide apx-muted">Search</label>
                <ApexSearchField value={search} onChange={setSearch} placeholder="Search tasks..." />
              </div>
            </div>
          </div>

          {projectFilter ? (
            <>
              <ApexStatusTabs
                tabs={[
                  { key: 'active', label: 'Active', count: counts.active, indicatorColor: '#16a34a' },
                  { key: 'inactive', label: 'Inactive', count: counts.inactive, indicatorColor: '#64748b' },
                ]}
                active={activeTab}
                onChange={(value) => {
                  setActiveTab(value as 'active' | 'inactive')
                  setSelectedIds([])
                }}
              />

              {selectedIds.length > 0 ? (
                <div className="flex items-center justify-end gap-2">
                  <ApexButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setConfirmConfig({
                        kind: 'bulkSetInactive',
                        title: 'Set Selected Tasks Inactive',
                        description: `Set ${selectedIds.length} selected task(s) inactive?`,
                        confirmLabel: 'Set Inactive',
                        tone: 'primary',
                      })
                      setConfirmOpen(true)
                    }}
                  >
                    <Power className="h-4 w-4" />
                    Set Inactive
                  </ApexButton>
                  <ApexButton
                    type="button"
                    variant="danger"
                    onClick={() => {
                      setConfirmConfig({
                        kind: 'bulkDelete',
                        title: 'Delete Selected Tasks',
                        description: `Delete ${selectedIds.length} selected task(s)? This cannot be undone.`,
                        confirmLabel: 'Delete',
                        tone: 'danger',
                      })
                      setConfirmOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </ApexButton>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
                {LANES.map((lane) => (
                  <section
                    key={lane.key}
                    className="rounded-2xl border p-3"
                    style={{ borderColor: lane.color, backgroundColor: lane.soft }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      if (!dragTaskId) return
                      void moveTask(dragTaskId, lane.key)
                      setDragTaskId(null)
                    }}
                  >
                    <h2 className="mb-2 px-1 text-sm font-semibold" style={{ color: lane.color }}>{lane.label}</h2>
                    <div className="space-y-2">
                      {laneTasks[lane.key].map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border p-3 transition-shadow hover:shadow-md"
                          style={{ borderColor: PRIORITIES.find((item) => item.key === task.priority)?.color || 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
                          draggable={activeTab === 'active'}
                          onDragStart={() => setDragTaskId(task.id)}
                          onClick={() => {
                            setSelectedTask(task)
                            setViewOpen(true)
                          }}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <label className="inline-flex items-center gap-2 text-xs apx-muted" onClick={(event) => event.stopPropagation()}>
                              <ApexCheckbox checked={selectedIds.includes(task.id)} onChange={() => toggleSelectOne(task.id)} ariaLabel="Select task" />
                              Select
                            </label>
                            <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" style={priorityStyle(task.priority)}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold apx-text">{task.title}</p>
                            {task.description ? <p className="mt-1 line-clamp-2 text-xs apx-muted">{task.description}</p> : null}
                            <p className="mt-2 inline-flex items-center gap-1 text-xs apx-muted">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDueDate(task.dueDate)}
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                              {task.assigneeIds.slice(0, 3).map((memberId) => {
                                const member = teamMap.get(memberId)
                                return (
                                  <span key={`${task.id}-${memberId}`} className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border text-[10px] font-semibold" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                                    {member?.avatar ? <Image src={member.avatar} alt={member.name} width={24} height={24} className="h-full w-full object-cover" /> : (member?.name || 'U').slice(0, 1).toUpperCase()}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              className="apx-icon-action"
                              onClick={() => {
                                setSelectedTask(task)
                                setTaskForm(fromTask(task))
                                setEditOpen(true)
                              }}
                              aria-label="Edit task"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="apx-icon-action"
                              onClick={() => {
                                setSelectedTask(task)
                                setConfirmConfig({
                                  kind: 'toggleActive',
                                  title: task.isActive ? 'Set Task Inactive' : 'Set Task Active',
                                  description: `Update active status for ${task.title}?`,
                                  confirmLabel: task.isActive ? 'Set Inactive' : 'Set Active',
                                  tone: 'primary',
                                })
                                setConfirmOpen(true)
                              }}
                              aria-label="Toggle active"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="apx-icon-action-danger"
                              onClick={() => {
                                setSelectedTask(task)
                                setConfirmConfig({
                                  kind: 'delete',
                                  title: 'Delete Task',
                                  description: `Delete ${task.title}? This cannot be undone.`,
                                  confirmLabel: 'Delete',
                                  tone: 'danger',
                                })
                                setConfirmOpen(true)
                              }}
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {laneTasks[lane.key].length === 0 ? <p className="rounded-xl border border-dashed px-3 py-4 text-center text-xs apx-muted" style={{ borderColor: 'var(--apx-border)' }}>No tasks</p> : null}
                    </div>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              <p className="text-sm apx-muted">Select a project first.</p>
            </div>
          )}
        </>
      )}

      <ApexModal size="md" open={addOpen} title="Add Task" subtitle="Create a new task." onClose={() => setAddOpen(false)}>
        <TaskFormCard
          form={taskForm}
          onChange={setTaskForm}
          projects={projects}
          teamMembers={teamMembers}
          projectLocked={Boolean(projectFilter)}
          onCancel={() => setAddOpen(false)}
          onSubmit={() => {
            void handleCreate()
          }}
          submitLabel="Create Task"
        />
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Task" subtitle="Update task details." onClose={() => setEditOpen(false)}>
        <TaskFormCard
          form={taskForm}
          onChange={setTaskForm}
          projects={projects}
          teamMembers={teamMembers}
          projectLocked={Boolean(projectFilter)}
          onCancel={() => setEditOpen(false)}
          onSubmit={() => {
            void handleEdit()
          }}
          submitLabel="Save Changes"
        />
      </ApexModal>

      <ApexModal size="sm" open={viewOpen} title="Task Details" subtitle="Task information and history." onClose={() => setViewOpen(false)}>
        {selectedTask ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs apx-muted">Title</p>
                <p className="font-semibold apx-text">{selectedTask.title}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Status</p>
                <p className="apx-text">{laneLabel(selectedTask.status)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Priority</p>
                <p className="apx-text">{selectedTask.priority}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Due Date</p>
                <p className="apx-text">{formatDueDate(selectedTask.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs apx-muted">Updated</p>
                <p className="apx-text">{new Date(selectedTask.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </div>

            <div>
              <p className="text-xs apx-muted">Assigned Team Members</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedTask.assigneeIds.length ? selectedTask.assigneeIds.map((memberId) => {
                  const member = teamMap.get(memberId)
                  return (
                    <span key={`${selectedTask.id}-view-${memberId}`} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs" style={{ borderColor: 'var(--apx-border)' }}>
                      <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                        {member?.avatar ? <Image src={member.avatar} alt={member.name} width={20} height={20} className="h-full w-full object-cover" /> : (member?.name || 'U').slice(0, 1).toUpperCase()}
                      </span>
                      {member?.name || 'Unknown Member'}
                    </span>
                  )
                }) : <span className="text-xs apx-muted">No assigned team member.</span>}
              </div>
            </div>

            {selectedTask.description ? (
              <div>
                <p className="text-xs apx-muted">Description</p>
                <p className="text-sm apx-text">{selectedTask.description}</p>
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-xs apx-muted">History</p>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)' }}>
                {selectedTask.history.length ? (
                  selectedTask.history.map((entry, index) => (
                    <div key={`${selectedTask.id}-history-${index}`} className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: 'var(--apx-border)' }}>
                      <p className="font-semibold apx-text">{entry.label || 'Updated'}</p>
                      <p className="apx-muted">{entry.by || 'Admin'} - {entry.at ? new Date(entry.at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs apx-muted">No history yet.</p>
                )}
              </div>
            </div>
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

function TaskFormCard({
  form,
  onChange,
  projects,
  teamMembers,
  projectLocked,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  form: TaskForm
  onChange: (next: TaskForm) => void
  projects: ProjectOption[]
  teamMembers: TeamMember[]
  projectLocked: boolean
  onCancel: () => void
  onSubmit: () => void
  submitLabel: string
}) {
  const [membersOpen, setMembersOpen] = useState(false)
  const selectedProject = projects.find((project) => project.id === form.projectId)
  const membersLabel = form.assigneeIds.length
    ? `${form.assigneeIds.length} member${form.assigneeIds.length > 1 ? 's' : ''} selected`
    : 'Select team members (optional)'

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
        {projectLocked ? (
          <ApexInput value={selectedProject ? `${selectedProject.name} - ${selectedProject.clientName}` : 'Select a project first'} readOnly />
        ) : (
          <ApexDropdown
            value={form.projectId}
            options={[{ value: '', label: 'Select project' }, ...projects.map((project) => ({ value: project.id, label: `${project.name} - ${project.clientName}` }))]}
            onChange={(value) => onChange({ ...form, projectId: value })}
          />
        )}
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Title</label>
        <ApexInput value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} required />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Description</label>
        <ApexTextarea rows={4} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Priority</label>
        <ApexDropdown
          value={form.priority}
          options={PRIORITIES.map((priority) => ({ value: priority.key, label: priority.label, color: priority.color }))}
          onChange={(value) => onChange({ ...form, priority: value as TaskPriority })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Column</label>
        <ApexDropdown
          value={form.status}
          options={LANES.map((lane) => ({ value: lane.key, label: lane.label, color: lane.color }))}
          onChange={(value) => onChange({ ...form, status: value as TaskStatus })}
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Team Member</label>
        <div className="relative">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}
            onClick={() => setMembersOpen((prev) => !prev)}
          >
            <span className="apx-text">{membersLabel}</span>
            <User className="h-4 w-4 apx-muted" />
          </button>
          {membersOpen ? (
            <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              {teamMembers.length ? teamMembers.map((member) => (
                <label key={member.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-(--apx-surface-alt)">
                  <input
                    type="checkbox"
                    checked={form.assigneeIds.includes(member.id)}
                    onChange={() => {
                      const next = form.assigneeIds.includes(member.id)
                        ? form.assigneeIds.filter((id) => id !== member.id)
                        : [...form.assigneeIds, member.id]
                      onChange({ ...form, assigneeIds: next })
                    }}
                  />
                  <span className="apx-text text-sm">{member.name}</span>
                </label>
              )) : <p className="px-2 py-1 text-xs apx-muted">No active team members found.</p>}
            </div>
          ) : null}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Due Date</label>
        <ApexInput type="date" value={form.dueDate} onChange={(event) => onChange({ ...form, dueDate: event.target.value })} />
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-1">
        <ApexButton type="button" variant="outline" onClick={onCancel}>Cancel</ApexButton>
        <ApexButton type="submit">{submitLabel}</ApexButton>
      </div>
    </form>
  )
}
