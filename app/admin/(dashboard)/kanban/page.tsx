import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminKanbanTemplateView from '../../../../components/admin/kanban/AdminKanbanTemplateView'

type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

function normalizeStatus(value: string): TaskStatus {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'inprogress' || normalized === 'review' || normalized === 'done') return normalized
  return 'todo'
}

function normalizePriority(value: string): TaskPriority {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'low' || normalized === 'high' || normalized === 'critical') return normalized
  return 'medium'
}

function historyEvent(label: string, by: string) {
  return JSON.stringify([{ at: new Date().toISOString(), by, label }])
}

async function ensureKanbanTable() {
  await sql(`
    create table if not exists admin_kanban_tasks (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references ongoing_projects(id) on delete cascade,
      title text not null,
      description text,
      priority text not null default 'medium',
      status text not null default 'todo',
      is_active boolean not null default true,
      history jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await sql("alter table admin_kanban_tasks add column if not exists priority text not null default 'medium'")
  await sql("alter table admin_kanban_tasks add column if not exists status text not null default 'todo'")
  await sql("alter table admin_kanban_tasks add column if not exists is_active boolean not null default true")
  await sql("alter table admin_kanban_tasks add column if not exists history jsonb not null default '[]'::jsonb")
}

async function createTask(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensureKanbanTable()

  const projectId = String(formData.get('projectId') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'todo'))
  const priority = normalizePriority(String(formData.get('priority') ?? 'medium'))
  const actor = String(formData.get('actor') ?? 'Admin').trim() || 'Admin'

  if (!projectId || !title) throw new Error('Project and title are required.')

  await sql(
    `insert into admin_kanban_tasks(project_id, title, description, priority, status, history)
     values ($1::uuid, $2, nullif($3, ''), $4, $5, $6::jsonb)`,
    [projectId, title, description, priority, status, historyEvent('Task created', actor)]
  )

  revalidatePath('/admin/kanban')
}

async function updateTask(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensureKanbanTable()

  const id = String(formData.get('id') ?? '').trim()
  const projectId = String(formData.get('projectId') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'todo'))
  const priority = normalizePriority(String(formData.get('priority') ?? 'medium'))
  const actor = String(formData.get('actor') ?? 'Admin').trim() || 'Admin'

  if (!id || !projectId || !title) throw new Error('Task information is incomplete.')

  await sql(
    `update admin_kanban_tasks
        set project_id = $2::uuid,
            title = $3,
            description = nullif($4, ''),
            priority = $5,
            status = $6,
            history = coalesce(history, '[]'::jsonb) || $7::jsonb,
            updated_at = now()
      where id = $1::uuid`,
    [id, projectId, title, description, priority, status, historyEvent('Task updated', actor)]
  )

  revalidatePath('/admin/kanban')
}

async function moveTask(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensureKanbanTable()

  const id = String(formData.get('id') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'todo'))
  const actor = String(formData.get('actor') ?? 'Admin').trim() || 'Admin'

  if (!id) return

  await sql(
    `update admin_kanban_tasks
        set status = $2,
            history = coalesce(history, '[]'::jsonb) || $3::jsonb,
            updated_at = now()
      where id = $1::uuid`,
    [id, status, historyEvent(`Moved to ${status}`, actor)]
  )

  revalidatePath('/admin/kanban')
}

async function setTaskActive(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensureKanbanTable()

  const id = String(formData.get('id') ?? '').trim()
  const isActive = String(formData.get('isActive') ?? '1') === '1'
  const actor = String(formData.get('actor') ?? 'Admin').trim() || 'Admin'

  if (!id) return

  await sql(
    `update admin_kanban_tasks
        set is_active = $2,
            history = coalesce(history, '[]'::jsonb) || $3::jsonb,
            updated_at = now()
      where id = $1::uuid`,
    [id, isActive, historyEvent(isActive ? 'Marked active' : 'Marked inactive', actor)]
  )

  revalidatePath('/admin/kanban')
}

async function deleteTask(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'delete')
  await ensureKanbanTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('delete from admin_kanban_tasks where id = $1::uuid', [id])
  revalidatePath('/admin/kanban')
}

async function bulkSetInactive(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensureKanbanTable()

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const actor = String(formData.get('actor') ?? 'Admin').trim() || 'Admin'

  if (!ids.length) return

  await sql(
    `update admin_kanban_tasks
        set is_active = false,
            history = coalesce(history, '[]'::jsonb) || $2::jsonb,
            updated_at = now()
      where id = any($1::uuid[])`,
    [ids, historyEvent('Bulk set inactive', actor)]
  )

  revalidatePath('/admin/kanban')
}

async function bulkDelete(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'delete')
  await ensureKanbanTable()

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!ids.length) return

  await sql('delete from admin_kanban_tasks where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/kanban')
}

export default async function AdminKanbanPage() {
  await requirePermission('dashboard', 'read')
  await ensureKanbanTable()

  const [projects, tasks] = await Promise.all([
    sql<{ id: string; project_name: string; client_name: string | null }>(
      `select op.id,
              op.project_name,
              c.full_name as client_name
         from ongoing_projects op
         left join clients c on c.id = op.client_id
        order by op.project_name asc`
    ),
    sql<{
      id: string
      project_id: string
      title: string
      description: string | null
      priority: string
      status: string
      is_active: boolean
      history: unknown
      created_at: string
      updated_at: string
    }>(
      `select id,
              project_id::text,
              title,
              description,
              priority,
              status,
              is_active,
              history,
              created_at::text,
              updated_at::text
         from admin_kanban_tasks
        order by created_at desc`
    ),
  ])

  return (
    <AdminKanbanTemplateView
      projects={projects.map((project) => ({
        id: project.id,
        name: project.project_name,
        clientName: project.client_name || 'Unknown Client',
      }))}
      tasks={tasks.map((task) => ({
        id: task.id,
        projectId: task.project_id,
        title: task.title,
        description: task.description,
        priority: normalizePriority(task.priority),
        status: normalizeStatus(task.status),
        isActive: task.is_active,
        history: Array.isArray(task.history) ? task.history : [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }))}
      createTaskAction={createTask}
      updateTaskAction={updateTask}
      moveTaskAction={moveTask}
      setTaskActiveAction={setTaskActive}
      deleteTaskAction={deleteTask}
      bulkSetInactiveAction={bulkSetInactive}
      bulkDeleteAction={bulkDelete}
    />
  )
}
