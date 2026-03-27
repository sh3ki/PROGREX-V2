import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminClientsTemplateView from '../../../../components/admin/clients/AdminClientsTemplateView'

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

async function updateClient(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')
  await ensureClientsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

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
  const existingProfileImage = String(formData.get('existingProfileImage') ?? '').trim()

  if (!fullName) return

  let imageUrl = existingProfileImage
  const profileImage = formData.get('profileImage')
  if (profileImage instanceof File && profileImage.size > 0) {
    const filename = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'client'}-${randomBytes(3).toString('hex')}`
    imageUrl = await uploadImageToCloudinary(profileImage, { folder: 'ProgreX Clients', filename })
  }

  await sql(
    `update clients
     set full_name = $2,
         profile_image = nullif($3, ''),
         other_member_names = $4::text[],
         role = nullif($5, ''),
         email = nullif($6, ''),
         fb_link = nullif($7, ''),
         phone = nullif($8, ''),
         client_date = nullif($9, '')::date,
         updated_at = now()
     where id = $1::uuid`,
    [id, fullName, imageUrl, otherMemberNames, role, email, fbLink, phone, clientDate]
  )

  revalidatePath('/admin/clients')
}

async function deleteClient(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql('delete from clients where id = $1::uuid', [id])
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
    <AdminClientsTemplateView
      clients={clients.map((client) => ({
        id: client.id,
        fullName: client.full_name,
        profileImage: client.profile_image,
        otherMemberNames: client.other_member_names ?? [],
        role: client.role,
        email: client.email,
        fbLink: client.fb_link,
        phone: client.phone,
        clientDate: client.client_date,
        isActive: client.is_active,
      }))}
      createClientAction={createClient}
      updateClientAction={updateClient}
      toggleClientAction={toggleClient}
      deleteClientAction={deleteClient}
    />
  )
}
