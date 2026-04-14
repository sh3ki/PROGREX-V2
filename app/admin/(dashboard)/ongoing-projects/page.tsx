import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminOngoingProjectsTemplateView from '../../../../components/admin/ongoing-projects/AdminOngoingProjectsTemplateView'

async function uploadRawToCloudinary(file: File, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${opts.folder}&public_id=${opts.filename}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}

async function ensureOngoingProjectsTable() {
  await sql(`
    create table if not exists ongoing_projects (
      id uuid primary key default gen_random_uuid(),
      project_name text not null,
      project_description text,
      start_date date,
      target_date date,
      client_id uuid references clients(id) on delete set null,
      category text,
      assigned_team_member_ids uuid[] default array[]::uuid[],
      agreement_file_url text,
      project_scope_file_url text,
      other_files_urls text[] default array[]::text[],
      payment_term text,
      is_active boolean not null default true,
      progress_color text not null default '#16a34a',
      total_price numeric(12,2),
      balance numeric(12,2),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await sql('alter table ongoing_projects add column if not exists is_active boolean not null default true')
  await sql('alter table ongoing_projects add column if not exists other_files_urls text[] default array[]::text[]')
  await sql("alter table ongoing_projects add column if not exists progress_color text not null default '#16a34a'")
  await sql("alter table ongoing_projects add column if not exists status text not null default 'active'")
  await sql('alter table ongoing_projects add column if not exists progress numeric(5,2) not null default 0')
  await sql('alter table ongoing_projects add column if not exists invoice_no text')
  await sql(`
    update ongoing_projects
       set status = case
         when is_active then coalesce(nullif(status, ''), 'active')
         else 'finished'
       end
     where status is null or trim(status) = ''
  `)
  await sql(`
    with source as (
      select id,
             to_char(coalesce(start_date, created_at::date), 'YYYY-MM') as ym,
             row_number() over (
               partition by to_char(coalesce(start_date, created_at::date), 'YYYY-MM')
               order by coalesce(start_date, created_at::date) asc, created_at asc, id asc
             ) as seq
        from ongoing_projects
       where invoice_no is null or trim(invoice_no) = ''
    )
    update ongoing_projects op
       set invoice_no = concat('INV-', source.ym, '-', lpad(source.seq::text, 3, '0'))
      from source
     where op.id = source.id
  `)
  await sql(`
    create table if not exists ongoing_project_progress (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references ongoing_projects(id) on delete cascade,
      progress numeric(5,2) not null,
      notes text,
      created_by text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await sql('alter table ongoing_project_progress add column if not exists created_by text')
}

function normalizeProjectStatus(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'finished' || normalized === 'maintenance') return normalized
  return 'active'
}

function parseCurrency(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim().replace(/[^0-9.\-]/g, '')
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizedProgressValue(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function progressColorByValue(value: number) {
  const progress = normalizedProgressValue(value)
  if (progress < 25) return '#ef4444'
  if (progress < 50) return '#f59e0b'
  if (progress < 75) return '#3b82f6'
  return '#16a34a'
}

function normalizeInvoiceDatePart(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-\d{2}$/)
  if (match) return `${match[1]}-${match[2]}`
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function generateInvoiceNumberByDate(startDate: string) {
  const datePart = normalizeInvoiceDatePart(startDate)
  const counts = await sql<{ total: string }>(
    `select count(*)::text as total
       from ongoing_projects
      where invoice_no like $1`,
    [`INV-${datePart}-%`]
  )
  const nextIndex = Number(counts[0]?.total ?? '0') + 1
  return `INV-${datePart}-${String(nextIndex).padStart(3, '0')}`
}

async function createOngoingProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureOngoingProjectsTable()

  const projectName = String(formData.get('projectName') ?? '').trim()
  const projectDescription = String(formData.get('projectDescription') ?? '').trim()
  const startDate = String(formData.get('startDate') ?? '').trim()
  const targetDate = String(formData.get('targetDate') ?? '').trim()
  const clientId = String(formData.get('clientId') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const assignedTeamIds = formData.getAll('assignedTeamIds').map((value) => String(value).trim()).filter(Boolean)
  const paymentTerm = String(formData.get('paymentTerm') ?? '').trim()
  const status = normalizeProjectStatus(String(formData.get('status') ?? 'active'))
  const isActive = status !== 'finished'
  const totalPrice = parseCurrency(formData.get('totalPrice'))
  const balance = totalPrice
  const initialProgress = 0
  const initialProgressColor = progressColorByValue(initialProgress)
  const invoiceNo = await generateInvoiceNumberByDate(startDate)

  if (!projectName) return

  const agreementFile = formData.get('agreementFile')
  const scopeFile = formData.get('scopeFile')
  const otherFiles = formData.getAll('otherFiles').filter((value) => value instanceof File) as File[]
  let agreementUrl = ''
  let scopeUrl = ''
  const otherFileUrls: string[] = []

  if (agreementFile instanceof File && agreementFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'agreement'}-${randomBytes(3).toString('hex')}`
    agreementUrl = await uploadRawToCloudinary(agreementFile, { folder: 'ProgreX Agreement', filename })
  }

  if (scopeFile instanceof File && scopeFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'scope'}-${randomBytes(3).toString('hex')}`
    scopeUrl = await uploadRawToCloudinary(scopeFile, { folder: 'ProgreX Project Scope', filename })
  }

  for (const file of otherFiles.slice(0, 5)) {
    const base = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'other-file'
    const filename = `${base}-${randomBytes(3).toString('hex')}`
    const uploaded = await uploadRawToCloudinary(file, { folder: 'Other Files', filename })
    otherFileUrls.push(uploaded)
  }

  await sql(
    `insert into ongoing_projects(
      project_name,
      project_description,
      start_date,
      target_date,
      client_id,
      category,
      assigned_team_member_ids,
      agreement_file_url,
      project_scope_file_url,
      other_files_urls,
      payment_term,
      invoice_no,
      is_active,
      status,
      progress,
      progress_color,
      total_price,
      balance
    ) values ($1, $2, $3::date, $4::date, nullif($5, '')::uuid, $6, $7::uuid[], $8, $9, $10::text[], $11, $12, $13, $14, $15, $16, $17, $18)`,
    [
      projectName,
      projectDescription || null,
      startDate || null,
      targetDate || null,
      clientId,
      category || null,
      assignedTeamIds,
      agreementUrl || null,
      scopeUrl || null,
      otherFileUrls,
      paymentTerm || null,
      invoiceNo,
      isActive,
      status,
      initialProgress,
      initialProgressColor,
      totalPrice,
      balance,
    ]
  )

  revalidatePath('/admin/ongoing-projects')
}

async function updateOngoingProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureOngoingProjectsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const projectName = String(formData.get('projectName') ?? '').trim()
  const projectDescription = String(formData.get('projectDescription') ?? '').trim()
  const startDate = String(formData.get('startDate') ?? '').trim()
  const targetDate = String(formData.get('targetDate') ?? '').trim()
  const clientId = String(formData.get('clientId') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const assignedTeamIds = formData.getAll('assignedTeamIds').map((value) => String(value).trim()).filter(Boolean)
  const paymentTerm = String(formData.get('paymentTerm') ?? '').trim()
  const status = normalizeProjectStatus(String(formData.get('status') ?? 'active'))
  const isActive = status !== 'finished'
  const totalPrice = parseCurrency(formData.get('totalPrice'))
  const existingProgressRow = await sql<{ progress: string | null }>('select progress::text from ongoing_projects where id = $1::uuid limit 1', [id])
  const progressValue = Number(existingProgressRow[0]?.progress ?? '0') || 0
  const paymentsTable = await sql<{ exists: string | null }>("select to_regclass('public.payments')::text as exists")
  let paidAmount = 0
  if (paymentsTable[0]?.exists) {
    const paidRows = await sql<{ total_paid: string | null }>(
      `select coalesce(sum(amount), 0)::text as total_paid
         from payments
        where project_name = (select project_name from ongoing_projects where id = $1::uuid)`,
      [id]
    )
    paidAmount = Number(paidRows[0]?.total_paid ?? '0') || 0
  }
  const balance = Math.max(totalPrice - paidAmount, 0)
  const normalizedProgress = normalizedProgressValue(progressValue)
  const progressColor = progressColorByValue(normalizedProgress)
  const existingAgreementFileUrl = String(formData.get('existingAgreementFileUrl') ?? '').trim()
  const existingScopeFileUrl = String(formData.get('existingScopeFileUrl') ?? '').trim()
  const keptOtherFileUrls = String(formData.get('keptOtherFileUrls') ?? '')
    .split('||')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!projectName) return

  const agreementFile = formData.get('agreementFile')
  const scopeFile = formData.get('scopeFile')
  const otherFiles = formData.getAll('otherFiles').filter((value) => value instanceof File) as File[]
  let agreementUrl = existingAgreementFileUrl
  let scopeUrl = existingScopeFileUrl
  let otherFileUrls = [...keptOtherFileUrls]

  if (agreementFile instanceof File && agreementFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'agreement'}-${randomBytes(3).toString('hex')}`
    agreementUrl = await uploadRawToCloudinary(agreementFile, { folder: 'ProgreX Agreement', filename })
  }

  if (scopeFile instanceof File && scopeFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'scope'}-${randomBytes(3).toString('hex')}`
    scopeUrl = await uploadRawToCloudinary(scopeFile, { folder: 'ProgreX Project Scope', filename })
  }

  for (const file of otherFiles.slice(0, 5)) {
    const base = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'other-file'
    const filename = `${base}-${randomBytes(3).toString('hex')}`
    const uploaded = await uploadRawToCloudinary(file, { folder: 'Other Files', filename })
    otherFileUrls = [...otherFileUrls, uploaded]
  }

  if (otherFileUrls.length > 5) otherFileUrls = otherFileUrls.slice(0, 5)

  await sql(
    `update ongoing_projects
     set project_name = $2,
         project_description = nullif($3, ''),
         start_date = nullif($4, '')::date,
         target_date = nullif($5, '')::date,
         client_id = nullif($6, '')::uuid,
         category = nullif($7, ''),
         assigned_team_member_ids = $8::uuid[],
         agreement_file_url = nullif($9, ''),
         project_scope_file_url = nullif($10, ''),
         other_files_urls = $11::text[],
         payment_term = nullif($12, ''),
         is_active = $13,
         status = $14,
         progress = $15,
         progress_color = $16,
         total_price = $17,
         balance = $18,
         updated_at = now()
     where id = $1::uuid`,
    [
      id,
      projectName,
      projectDescription,
      startDate,
      targetDate,
      clientId,
      category,
      assignedTeamIds,
      agreementUrl,
      scopeUrl,
      otherFileUrls,
      paymentTerm,
      isActive,
      status,
      normalizedProgress,
      progressColor,
      totalPrice,
      balance,
    ]
  )

  revalidatePath('/admin/ongoing-projects')
}

async function deleteOngoingProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql('delete from ongoing_projects where id = $1::uuid', [id])
  revalidatePath('/admin/ongoing-projects')
}

async function toggleOngoingProjectActive(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql(
    `update ongoing_projects
        set is_active = not is_active,
            status = case when is_active then 'finished' else 'active' end,
            updated_at = now()
      where id = $1::uuid`,
    [id]
  )
  revalidatePath('/admin/ongoing-projects')
}

async function updateOngoingProjectFiles(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureOngoingProjectsTable()

  const id = String(formData.get('id') ?? '').trim()
  const projectName = String(formData.get('projectName') ?? '').trim() || 'project'
  if (!id) return

  const keptAgreement = String(formData.get('existingAgreementFileUrl') ?? '').trim()
  const keptScope = String(formData.get('existingScopeFileUrl') ?? '').trim()
  const keptOtherFileUrls = String(formData.get('keptOtherFileUrls') ?? '')
    .split('||')
    .map((value) => value.trim())
    .filter(Boolean)

  let agreementUrl = keptAgreement
  let scopeUrl = keptScope
  let otherFileUrls = [...keptOtherFileUrls]

  const agreementFile = formData.get('agreementFile')
  const scopeFile = formData.get('scopeFile')
  const otherFiles = formData.getAll('otherFiles').filter((value) => value instanceof File) as File[]

  if (agreementFile instanceof File && agreementFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'agreement'}-${randomBytes(3).toString('hex')}`
    agreementUrl = await uploadRawToCloudinary(agreementFile, { folder: 'ProgreX Agreement', filename })
  }

  if (scopeFile instanceof File && scopeFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'scope'}-${randomBytes(3).toString('hex')}`
    scopeUrl = await uploadRawToCloudinary(scopeFile, { folder: 'ProgreX Project Scope', filename })
  }

  for (const file of otherFiles.slice(0, 5)) {
    const base = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'other-file'
    const filename = `${base}-${randomBytes(3).toString('hex')}`
    const uploaded = await uploadRawToCloudinary(file, { folder: 'Other Files', filename })
    otherFileUrls = [...otherFileUrls, uploaded]
  }

  if (otherFileUrls.length > 5) otherFileUrls = otherFileUrls.slice(0, 5)

  await sql(
    `update ongoing_projects
     set agreement_file_url = nullif($2, ''),
         project_scope_file_url = nullif($3, ''),
         other_files_urls = $4::text[],
         updated_at = now()
     where id = $1::uuid`,
    [id, agreementUrl, scopeUrl, otherFileUrls]
  )

  revalidatePath('/admin/ongoing-projects')
}

async function bulkSetInactiveOngoingProjects(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql("update ongoing_projects set is_active = false, status = 'finished', updated_at = now() where id = any($1::uuid[])", [ids])
  revalidatePath('/admin/ongoing-projects')
}

async function bulkSetMaintenanceOngoingProjects(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql("update ongoing_projects set is_active = true, status = 'maintenance', updated_at = now() where id = any($1::uuid[])", [ids])
  revalidatePath('/admin/ongoing-projects')
}

async function createProjectProgress(formData: FormData) {
  'use server'
  const admin = await requirePermission('projects', 'write')

  const projectId = String(formData.get('projectId') ?? '').trim()
  const progress = normalizedProgressValue(Number(formData.get('progress') ?? 0) || 0)
  const notes = String(formData.get('notes') ?? '').trim()
  const color = progressColorByValue(progress)
  const createdBy = admin.fullName || 'Admin'
  if (!projectId) return

  await sql(
    'insert into ongoing_project_progress(project_id, progress, notes, created_by) values ($1::uuid, $2, $3, $4)',
    [projectId, progress, notes || null, createdBy]
  )
  await sql('update ongoing_projects set progress = $2, progress_color = $3, updated_at = now() where id = $1::uuid', [projectId, progress, color])
  revalidatePath('/admin/ongoing-projects')
}

async function updateProjectProgress(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const projectId = String(formData.get('projectId') ?? '').trim()
  const progress = normalizedProgressValue(Number(formData.get('progress') ?? 0) || 0)
  const notes = String(formData.get('notes') ?? '').trim()
  const color = progressColorByValue(progress)
  if (!id || !projectId) return

  await sql(
    `update ongoing_project_progress
        set progress = $2,
            notes = $3,
            updated_at = now()
      where id = $1::uuid`,
    [id, progress, notes || null]
  )
  await sql('update ongoing_projects set progress = $2, progress_color = $3, updated_at = now() where id = $1::uuid', [projectId, progress, color])
  revalidatePath('/admin/ongoing-projects')
}

async function deleteProjectProgress(formData: FormData) {
  'use server'
  await requirePermission('projects', 'delete')

  const id = String(formData.get('id') ?? '').trim()
  const projectId = String(formData.get('projectId') ?? '').trim()
  if (!id || !projectId) return

  await sql('delete from ongoing_project_progress where id = $1::uuid', [id])
  const latest = await sql<{ progress: string | null }>(
    'select progress::text from ongoing_project_progress where project_id = $1::uuid order by created_at desc limit 1',
    [projectId]
  )
  const latestProgress = normalizedProgressValue(Number(latest[0]?.progress ?? '0') || 0)
  const color = progressColorByValue(latestProgress)
  await sql('update ongoing_projects set progress = $2, progress_color = $3, updated_at = now() where id = $1::uuid', [projectId, latestProgress, color])
  revalidatePath('/admin/ongoing-projects')
}

async function bulkDeleteProjectProgress(formData: FormData) {
  'use server'
  await requirePermission('projects', 'delete')

  const projectId = String(formData.get('projectId') ?? '').trim()
  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!projectId || ids.length === 0) return
  await sql('delete from ongoing_project_progress where id = any($1::uuid[])', [ids])
  const latest = await sql<{ progress: string | null }>(
    'select progress::text from ongoing_project_progress where project_id = $1::uuid order by created_at desc limit 1',
    [projectId]
  )
  const latestProgress = normalizedProgressValue(Number(latest[0]?.progress ?? '0') || 0)
  const color = progressColorByValue(latestProgress)
  await sql('update ongoing_projects set progress = $2, progress_color = $3, updated_at = now() where id = $1::uuid', [projectId, latestProgress, color])
  revalidatePath('/admin/ongoing-projects')
}

async function bulkDeleteOngoingProjects(formData: FormData) {
  'use server'
  await requirePermission('projects', 'delete')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from ongoing_projects where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/ongoing-projects')
}

export default async function AdminOngoingProjectsPage() {
  await requirePermission('projects', 'read')
  await ensureOngoingProjectsTable()

  const [projects, clients, teamMembers, categories, progressRows] = await Promise.all([
    sql<{
      id: string
      project_name: string
      project_description: string | null
      start_date: string | null
      target_date: string | null
      client_id: string | null
      client_name: string | null
      client_profile_image: string | null
      category: string | null
      assigned_team_member_ids: string[]
      agreement_file_url: string | null
      project_scope_file_url: string | null
      other_files_urls: string[]
      payment_term: string | null
      is_active: boolean
      status: string | null
      progress_color: string | null
      progress: string | null
      total_price: string | null
      balance: string | null
      invoice_no: string | null
    }>(
      `select op.id,
              op.project_name,
              op.project_description,
              case when op.start_date is null then null else to_char(op.start_date, 'YYYY-MM-DD') end as start_date,
              case when op.target_date is null then null else to_char(op.target_date, 'YYYY-MM-DD') end as target_date,
              op.client_id::text,
              c.full_name as client_name,
                    c.profile_image as client_profile_image,
              op.category,
                    op.assigned_team_member_ids,
              op.agreement_file_url,
              op.project_scope_file_url,
                    op.other_files_urls,
              op.payment_term,
              op.is_active,
              op.status,
              op.progress_color,
              op.progress::text,
              op.total_price::text,
              op.balance::text,
              op.invoice_no
       from ongoing_projects op
       left join clients c on c.id = op.client_id
            order by op.created_at desc`
    ),
                sql<{ id: string; full_name: string; profile_image: string | null }>('select id, full_name, profile_image from clients where is_active = true order by full_name asc'),
                sql<{ id: string; name: string; avatar: string | null }>('select id, name, avatar from team_members where is_active = true order by sort_order asc, name asc'),
    sql<{ category: string }>(
      `select distinct unnest(categories) as category
       from projects
       where categories is not null
       order by category asc`
    ),
    sql<{
      id: string
      project_id: string
      progress: string
      notes: string | null
      created_by: string | null
      created_at: string
      updated_at: string
    }>(
      `select id, project_id::text, progress::text, notes, created_by, created_at::text, updated_at::text
         from ongoing_project_progress
        order by created_at desc`
    ),
  ])

  return (
    <AdminOngoingProjectsTemplateView
      projects={projects.map((project) => ({
        id: project.id,
        projectName: project.project_name,
        projectDescription: project.project_description,
        startDate: project.start_date,
        targetDate: project.target_date,
        clientId: project.client_id,
        clientName: project.client_name,
        clientProfileImage: project.client_profile_image,
        category: project.category,
        assignedTeamIds: project.assigned_team_member_ids ?? [],
        agreementFileUrl: project.agreement_file_url,
        projectScopeFileUrl: project.project_scope_file_url,
        otherFileUrls: project.other_files_urls || [],
        paymentTerm: project.payment_term,
        isActive: project.is_active,
        status: normalizeProjectStatus(project.status || (project.is_active ? 'active' : 'finished')),
        progressColor: project.progress_color || '#16a34a',
        progress: project.progress,
        totalPrice: project.total_price,
        balance: project.balance,
        invoiceNo: project.invoice_no,
      }))}
      clients={clients.map((client) => ({ id: client.id, fullName: client.full_name, profileImage: client.profile_image }))}
      teamMembers={teamMembers.map((member) => ({ id: member.id, name: member.name, avatar: member.avatar || '' }))}
      categories={categories.map((item) => item.category).filter(Boolean)}
      createProjectAction={createOngoingProject}
      updateProjectAction={updateOngoingProject}
      updateProjectFilesAction={updateOngoingProjectFiles}
      toggleProjectAction={toggleOngoingProjectActive}
      bulkSetInactiveProjectsAction={bulkSetInactiveOngoingProjects}
      bulkSetMaintenanceProjectsAction={bulkSetMaintenanceOngoingProjects}
      bulkDeleteProjectsAction={bulkDeleteOngoingProjects}
      deleteProjectAction={deleteOngoingProject}
      progressEntries={progressRows.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        progress: Number(row.progress || '0'),
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))}
      createProjectProgressAction={createProjectProgress}
      updateProjectProgressAction={updateProjectProgress}
      deleteProjectProgressAction={deleteProjectProgress}
      bulkDeleteProjectProgressAction={bulkDeleteProjectProgress}
    />
  )
}
