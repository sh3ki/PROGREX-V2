import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import { ApexButton, ApexInput } from '@/components/admin/apex/AdminPrimitives'
import { ApexBreadcrumbs } from '@/components/admin/apex/ApexDataUi'

async function uploadImageToCloudinary(file: File, opts: { folder: string; filename: string }) {
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

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}

async function ensureClientsTable() {
  await sql(`
    create table if not exists clients (
      id uuid primary key default gen_random_uuid(),
      full_name text not null,
      profile_image text,
      other_member_names text[] default array[]::text[],
      role text,
      email text,
      fb_link text,
      phone text,
      client_date date,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
}

async function createClient(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')
  await ensureClientsTable()

  const fullName = String(formData.get('fullName') ?? '').trim()
  const otherMemberNames = String(formData.get('otherMemberNames') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const role = String(formData.get('role') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const fbLink = String(formData.get('fbLink') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const clientDate = String(formData.get('clientDate') ?? '').trim()

  if (!fullName) return

  let imageUrl = ''
  const profileImage = formData.get('profileImage')
  if (profileImage instanceof File && profileImage.size > 0) {
    const filename = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'client'}-${randomBytes(3).toString('hex')}`
    imageUrl = await uploadImageToCloudinary(profileImage, { folder: 'ProgreX Clients', filename })
  }

  await sql(
    `insert into clients(full_name, profile_image, other_member_names, role, email, fb_link, phone, client_date, is_active)
     values ($1, $2, $3::text[], $4, $5, $6, $7, $8::date, true)`,
    [fullName, imageUrl || null, otherMemberNames, role || null, email || null, fbLink || null, phone || null, clientDate || null]
  )

  revalidatePath('/admin/clients')
}

async function toggleClient(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql('update clients set is_active = not is_active, updated_at = now() where id = $1::uuid', [id])
  revalidatePath('/admin/clients')
}

export default async function AdminClientsPage() {
  await requirePermission('teams', 'read')
  await ensureClientsTable()

  const clients = await sql<{
    id: string
    full_name: string
    profile_image: string | null
    other_member_names: string[]
    role: string | null
    email: string | null
    fb_link: string | null
    phone: string | null
    client_date: string | null
    is_active: boolean
  }>(
    `select id,
            full_name,
            profile_image,
            other_member_names,
            role,
            email,
            fb_link,
            phone,
            case when client_date is null then null else to_char(client_date, 'YYYY-MM-DD') end as client_date,
            is_active
     from clients
     order by created_at desc`
  )

  return (
    <div className="space-y-4">
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Clients' }]} />

      <div>
        <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Clients</h1>
        <p className="mt-1 text-sm apx-muted">Manage client profiles and statuses.</p>
      </div>

      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <h2 className="mb-3 text-lg font-semibold apx-text">Add Client</h2>
        <form action={createClient} className="grid gap-3 md:grid-cols-2" encType="multipart/form-data">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Profile Image</label>
            <ApexInput type="file" name="profileImage" accept="image/*" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Full Name</label>
            <ApexInput name="fullName" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Other Member Name(s) (comma separated)</label>
            <ApexInput name="otherMemberNames" placeholder="Default none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Role</label>
            <ApexInput name="role" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput name="email" type="email" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Facebook Link (Optional)</label>
            <ApexInput name="fbLink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Phone (Optional)</label>
            <ApexInput name="phone" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexInput name="clientDate" type="date" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ApexButton type="submit">Save Client</ApexButton>
          </div>
        </form>
      </section>

      <section className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="px-4 py-3 font-semibold apx-text">Client</th>
              <th className="px-4 py-3 font-semibold apx-text">Members</th>
              <th className="px-4 py-3 font-semibold apx-text">Role | Email</th>
              <th className="px-4 py-3 font-semibold apx-text">FB | Phone</th>
              <th className="px-4 py-3 font-semibold apx-text">Date | Status</th>
              <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border" style={{ borderColor: 'var(--apx-border)' }}>
                      {client.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.profile_image} alt={client.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] apx-muted">N/A</div>
                      )}
                    </div>
                    <p className="font-semibold apx-text">{client.full_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 apx-text">{client.other_member_names?.length ? client.other_member_names.join(', ') : 'none'}</td>
                <td className="px-4 py-3">
                  <p className="apx-text">{client.role || '-'}</p>
                  <p className="text-xs apx-muted">{client.email || '-'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="apx-text">{client.fb_link || '-'}</p>
                  <p className="text-xs apx-muted">{client.phone || '-'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="apx-text">{client.client_date || '-'}</p>
                  <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={client.is_active ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
                    {client.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleClient}>
                    <input type="hidden" name="id" value={client.id} />
                    <ApexButton type="submit" variant="outline">Toggle Status</ApexButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
