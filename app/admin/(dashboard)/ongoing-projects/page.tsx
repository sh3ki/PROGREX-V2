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
      payment_term text,
      total_price numeric(12,2),
      balance numeric(12,2),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
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
  const totalPrice = Number(formData.get('totalPrice') ?? 0) || 0
  const balance = Number(formData.get('balance') ?? 0) || 0

  if (!projectName) return

  const agreementFile = formData.get('agreementFile')
  const scopeFile = formData.get('scopeFile')
  let agreementUrl = ''
  let scopeUrl = ''

  if (agreementFile instanceof File && agreementFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'agreement'}-${randomBytes(3).toString('hex')}`
    agreementUrl = await uploadRawToCloudinary(agreementFile, { folder: 'ProgreX Agreement', filename })
  }

  if (scopeFile instanceof File && scopeFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'scope'}-${randomBytes(3).toString('hex')}`
    scopeUrl = await uploadRawToCloudinary(scopeFile, { folder: 'ProgreX Project Scopes', filename })
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
      payment_term,
      total_price,
      balance
    ) values ($1, $2, $3::date, $4::date, nullif($5, '')::uuid, $6, $7::uuid[], $8, $9, $10, $11, $12)`,
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
      paymentTerm || null,
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
  const totalPrice = Number(formData.get('totalPrice') ?? 0) || 0
  const balance = Number(formData.get('balance') ?? 0) || 0
  const existingAgreementFileUrl = String(formData.get('existingAgreementFileUrl') ?? '').trim()
  const existingScopeFileUrl = String(formData.get('existingScopeFileUrl') ?? '').trim()

  if (!projectName) return

  const agreementFile = formData.get('agreementFile')
  const scopeFile = formData.get('scopeFile')
  let agreementUrl = existingAgreementFileUrl
  let scopeUrl = existingScopeFileUrl

  if (agreementFile instanceof File && agreementFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'agreement'}-${randomBytes(3).toString('hex')}`
    agreementUrl = await uploadRawToCloudinary(agreementFile, { folder: 'ProgreX Agreement', filename })
  }

  if (scopeFile instanceof File && scopeFile.size > 0) {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'scope'}-${randomBytes(3).toString('hex')}`
    scopeUrl = await uploadRawToCloudinary(scopeFile, { folder: 'ProgreX Project Scopes', filename })
  }

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
         payment_term = nullif($11, ''),
         total_price = $12,
         balance = $13,
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
      paymentTerm,
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

export default async function AdminOngoingProjectsPage() {
  await requirePermission('projects', 'read')
  await ensureOngoingProjectsTable()

  const [projects, clients, teamMembers] = await Promise.all([
    sql<{
      id: string
      project_name: string
      project_description: string | null
      start_date: string | null
      target_date: string | null
      client_id: string | null
      client_name: string | null
      category: string | null
      assigned_team_member_ids: string[]
      agreement_file_url: string | null
      project_scope_file_url: string | null
      payment_term: string | null
      total_price: string | null
      balance: string | null
    }>(
      `select op.id,
              op.project_name,
              op.project_description,
              case when op.start_date is null then null else to_char(op.start_date, 'YYYY-MM-DD') end as start_date,
              case when op.target_date is null then null else to_char(op.target_date, 'YYYY-MM-DD') end as target_date,
              op.client_id::text,
              c.full_name as client_name,
              op.category,
              array_remove(array_agg(tm.id::text order by tm.sort_order asc, tm.name asc), null) as assigned_team_member_ids,
              op.agreement_file_url,
              op.project_scope_file_url,
              op.payment_term,
              op.total_price::text,
              op.balance::text
       from ongoing_projects op
       left join clients c on c.id = op.client_id
            left join team_members tm on tm.id = any(op.assigned_team_member_ids)
            group by op.id, c.full_name
            order by op.created_at desc`
    ),
    sql<{ id: string; full_name: string }>('select id, full_name from clients order by full_name asc'),
    sql<{ id: string; name: string }>('select id, name from team_members where is_active = true order by sort_order asc, name asc'),
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
        category: project.category,
        assignedTeamIds: project.assigned_team_member_ids ?? [],
        agreementFileUrl: project.agreement_file_url,
        projectScopeFileUrl: project.project_scope_file_url,
        paymentTerm: project.payment_term,
        totalPrice: project.total_price,
        balance: project.balance,
      }))}
      clients={clients.map((client) => ({ id: client.id, fullName: client.full_name }))}
      teamMembers={teamMembers}
      createProjectAction={createOngoingProject}
      updateProjectAction={updateOngoingProject}
      deleteProjectAction={deleteOngoingProject}
    />
  )
}
