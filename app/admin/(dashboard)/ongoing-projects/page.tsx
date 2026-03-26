import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import { ApexButton, ApexInput, ApexSelect, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import { ApexBreadcrumbs } from '@/components/admin/apex/ApexDataUi'

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
      client_name: string | null
      category: string | null
      payment_term: string | null
      total_price: string | null
      balance: string | null
    }>(
      `select op.id,
              op.project_name,
              op.project_description,
              case when op.start_date is null then null else to_char(op.start_date, 'YYYY-MM-DD') end as start_date,
              case when op.target_date is null then null else to_char(op.target_date, 'YYYY-MM-DD') end as target_date,
              c.full_name as client_name,
              op.category,
              op.payment_term,
              op.total_price::text,
              op.balance::text
       from ongoing_projects op
       left join clients c on c.id = op.client_id
       order by op.created_at desc`
    ),
    sql<{ id: string; full_name: string }>('select id, full_name from clients order by full_name asc'),
    sql<{ id: string; name: string }>('select id, name from team_members where is_active = true order by sort_order asc, name asc'),
  ])

  return (
    <div className="space-y-4">
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Ongoing Projects' }]} />

      <div>
        <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Ongoing Projects</h1>
        <p className="mt-1 text-sm apx-muted">Track active client projects and delivery details.</p>
      </div>

      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <h2 className="mb-3 text-lg font-semibold apx-text">Add Ongoing Project</h2>
        <form action={createOngoingProject} className="grid gap-3 md:grid-cols-2" encType="multipart/form-data">
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Project Name</label>
            <ApexInput name="projectName" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Category</label>
            <ApexInput name="category" placeholder="Same category style as Projects" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Project Description</label>
            <ApexTextarea name="projectDescription" rows={3} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Date</label>
            <ApexInput name="startDate" type="date" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Target Date</label>
            <ApexInput name="targetDate" type="date" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Client Name</label>
            <ApexSelect name="clientId" defaultValue="">
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.full_name}</option>
              ))}
            </ApexSelect>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Assigned Team Member (multi-select)</label>
            <ApexSelect name="assignedTeamIds" multiple className="h-28">
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </ApexSelect>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Agreement Upload (Optional)</label>
            <ApexInput name="agreementFile" type="file" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Project Scope Upload (Optional)</label>
            <ApexInput name="scopeFile" type="file" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Payment Term</label>
            <ApexSelect name="paymentTerm" defaultValue="One-time Payment">
              <option value="One-time Payment">One-time Payment</option>
              <option value="Progress-based">Progress-based</option>
              <option value="Monthly billing">Monthly billing</option>
            </ApexSelect>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Total Price</label>
            <ApexInput name="totalPrice" type="number" step="0.01" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Balance</label>
            <ApexInput name="balance" type="number" step="0.01" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ApexButton type="submit">Save Project</ApexButton>
          </div>
        </form>
      </section>

      <section className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="px-4 py-3 font-semibold apx-text">Project</th>
              <th className="px-4 py-3 font-semibold apx-text">Dates</th>
              <th className="px-4 py-3 font-semibold apx-text">Client</th>
              <th className="px-4 py-3 font-semibold apx-text">Category</th>
              <th className="px-4 py-3 font-semibold apx-text">Payment</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-4 py-3">
                  <p className="font-semibold apx-text">{project.project_name}</p>
                  <p className="text-xs apx-muted line-clamp-2">{project.project_description || '-'}</p>
                </td>
                <td className="px-4 py-3 apx-text">{project.start_date || '-'} • {project.target_date || '-'}</td>
                <td className="px-4 py-3 apx-text">{project.client_name || '-'}</td>
                <td className="px-4 py-3 apx-text">{project.category || '-'}</td>
                <td className="px-4 py-3">
                  <p className="apx-text">{project.payment_term || '-'}</p>
                  <p className="text-xs apx-muted">Total: {project.total_price || '0'} • Balance: {project.balance || '0'}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
