import { createHash, randomBytes } from 'node:crypto'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { sql } from '@/lib/server/db'
import { assertSameOrigin, getClientIp, hitRateLimit } from '@/lib/server/request-security'

const ALLOWED_DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
])

const emailSchema = z.string().trim().toLowerCase().email()

async function validateEmailWithZoho(email: string) {
  const endpoint = process.env.ZOHO_EMAIL_VALIDATION_ENDPOINT
  const token = process.env.ZOHO_EMAIL_VALIDATION_TOKEN
  if (!endpoint || !token) return true

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    })

    if (!response.ok) return true
    const payload = (await response.json()) as { valid?: boolean; status?: string }
    if (payload.valid === false) return false
    if ((payload.status || '').toLowerCase().includes('undelivered')) return false
    return true
  } catch {
    return true
  }
}

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

function validateMeetingOverlap(
  startTime: string,
  durationMinutes: number,
  events: Array<{ start_time: string | null; end_time: string | null }>
) {
  const [startHourRaw, startMinuteRaw] = startTime.split(':')
  const startMins = Number(startHourRaw) * 60 + Number(startMinuteRaw)
  const endMins = startMins + durationMinutes

  for (const event of events) {
    if (!event.start_time) continue
    const [eventStartHour, eventStartMinute] = event.start_time.split(':').map(Number)
    const eventStart = eventStartHour * 60 + eventStartMinute

    const [eventEndHour, eventEndMinute] = (event.end_time || event.start_time).split(':').map(Number)
    const eventEnd = eventEndHour * 60 + eventEndMinute

    if (startMins < eventEnd && endMins > eventStart) {
      return true
    }
  }

  return false
}

export async function POST(req: NextRequest) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const ip = getClientIp(req)
    if (hitRateLimit(`contact-submit:${ip}`, 8, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
    }

    await sql('alter table bookings add column if not exists is_approved boolean not null default false')
    await sql('alter table bookings add column if not exists requested_date date')
    await sql('alter table bookings add column if not exists requested_start_time text')
    await sql('alter table bookings add column if not exists requested_duration_minutes integer')
    await sql('alter table bookings add column if not exists attachment_urls text[] default array[]::text[]')
    await sql('alter table contact_submissions add column if not exists attachment_urls text[] default array[]::text[]')
    await sql('alter table contact_submissions add column if not exists request_meeting boolean not null default false')

    const body = await req.formData()
    const name = String(body.get('name') ?? '').trim()
    const email = String(body.get('email') ?? '').trim()
    const phone = String(body.get('phone') ?? '').trim()
    const company = String(body.get('company') ?? '').trim()
    const service = String(body.get('service') ?? '').trim()
    const budget = String(body.get('budget') ?? '').trim()
    const message = String(body.get('message') ?? '').trim()
    const requestMeeting = String(body.get('requestMeeting') ?? 'false') === 'true'
    const meetingDate = String(body.get('meetingDate') ?? '').trim()
    const meetingStartTime = String(body.get('meetingStartTime') ?? '').trim()
    const meetingDurationMinutes = Number(body.get('meetingDurationMinutes') ?? 0) || 0

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    if (!emailSchema.safeParse(email).success) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }

    const isZohoValid = await validateEmailWithZoho(email)
    if (!isZohoValid) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }

    if (hitRateLimit(`contact-submit-email:${email.toLowerCase()}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many submissions for this email. Please wait a minute and try again.' }, { status: 429 })
    }

    const attachments = body.getAll('attachments').filter((entry) => entry instanceof File) as File[]

    if (attachments.length > 3) {
      return NextResponse.json({ error: 'You can upload up to 3 files only.' }, { status: 400 })
    }

    for (const file of attachments) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `${file.name} exceeds 10 MB limit.` }, { status: 400 })
      }
      if (!ALLOWED_DOC_TYPES.has(file.type)) {
        return NextResponse.json({ error: `${file.name} is not a supported document format.` }, { status: 400 })
      }
    }

    if (requestMeeting) {
      if (!meetingDate || !meetingStartTime || meetingDurationMinutes <= 0) {
        return NextResponse.json({ error: 'Complete meeting date, start time, and duration.' }, { status: 400 })
      }

      const now = new Date()
      const todayKey = now.toISOString().slice(0, 10)
      if (meetingDate === todayKey) {
        const [hourRaw, minuteRaw] = meetingStartTime.split(':')
        const requestedMinutes = Number(hourRaw) * 60 + Number(minuteRaw)
        const minMinutes = now.getHours() * 60 + now.getMinutes() + 120
        if (requestedMinutes < minMinutes) {
          return NextResponse.json({ error: 'For same-day booking, time must be at least 2 hours from now.' }, { status: 400 })
        }
      }

      const dayEvents = await sql<{ start_time: string | null; end_time: string | null }>(
        `select start_time, end_time
         from calendar_events
         where event_date = $1::date`,
        [meetingDate]
      )

      const overlaps = validateMeetingOverlap(meetingStartTime, meetingDurationMinutes, dayEvents)
      if (overlaps) {
        return NextResponse.json({ error: 'Selected meeting time overlaps an existing schedule.' }, { status: 400 })
      }
    }

    const uploadedAttachmentUrls: string[] = []
    for (const file of attachments) {
      const baseName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'contact-file'
      const filename = `${baseName}-${randomBytes(3).toString('hex')}`
      const uploaded = await uploadRawToCloudinary(file, {
        folder: 'ProgreX Contact File Upload',
        filename,
      })
      uploadedAttachmentUrls.push(uploaded)
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com'
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'Email transport is not configured.' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await sql(`
      create table if not exists contact_submission_confirmations (
        id text primary key,
        token_hash text unique not null,
        payload jsonb not null,
        created_at timestamptz not null default now(),
        expires_at timestamptz not null,
        consumed_at timestamptz
      )
    `)

    const token = randomBytes(24).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || req.nextUrl.origin
    const confirmUrl = `${baseUrl.replace(/\/$/, '')}/api/contact/confirm?token=${encodeURIComponent(token)}`

    const payload = {
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
      requestMeeting,
      meetingDate,
      meetingStartTime,
      meetingDurationMinutes,
      attachmentUrls: uploadedAttachmentUrls,
    }

    await sql(
      `insert into contact_submission_confirmations(id, token_hash, payload, expires_at)
       values ($1, $2, $3::jsonb, now() + interval '24 hours')`,
      [randomBytes(16).toString('hex'), tokenHash, JSON.stringify(payload)]
    )

    const logoPath = path.join(process.cwd(), 'public', 'ProgreX Logo Black.png')
    const confirmationHtml = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);">
          <h1 style="margin:0;color:#fff;font-size:20px;">Confirm Your Inquiry</h1>
          <p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">One click confirmation is required before we process your message.</p>
        </div>
        <div style="padding:22px 24px;color:#dbeafe;">
          <p style="margin:0 0 12px;font-size:14px;">Hi ${name},</p>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">Please confirm your inquiry by clicking the button below. This link expires in 24 hours.</p>
          <a href="${confirmUrl}" style="display:inline-block;background:#0EA5E9;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;">Confirm and Send Message</a>
          <p style="margin:16px 0 0;font-size:12px;color:#93c5fd;word-break:break-all;">${confirmUrl}</p>
          <p style="margin:16px 0 0;font-size:12px;color:#93c5fd;">If this was not you, ignore this email.</p>
          <div style="margin-top:16px;display:flex;align-items:center;gap:10px;">
            <img src="cid:progrex-logo" alt="ProgreX" style="height:34px;width:auto;background:#fff;border-radius:6px;padding:4px;" />
          </div>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"ProgreX Team" <${smtpUser}>`,
      to: email,
      subject: 'Confirm your inquiry — ProgreX',
      html: confirmationHtml,
      attachments: [
        {
          filename: 'ProgreX Logo Black.png',
          path: logoPath,
          cid: 'progrex-logo',
        },
      ],
    })

    await transporter.sendMail({
      from: `"ProgreX Team" <${smtpUser}>`,
      to: smtpUser,
      subject: `New inquiry (NOT CONFIRMED): ${name}${company ? ` - ${company}` : ''}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;">
          <div style="padding:20px 24px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);">
            <h1 style="margin:0;color:#fff;font-size:20px;">Inquiry Pending Email Confirmation</h1>
            <p style="margin:6px 0 0;color:#ffedd5;font-size:13px;">User submitted the form but has not confirmed email yet.</p>
          </div>
          <div style="padding:22px 24px;color:#fde68a;">
            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;"><strong>Email:</strong> ${email}</p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;"><strong>Service:</strong> ${service || '-'}</p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;"><strong>Budget:</strong> ${budget || '-'}</p>
            <p style="margin:0;font-size:14px;line-height:1.7;"><strong>Status:</strong> Waiting for confirmation link click.</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, pendingConfirmation: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get('mode')
    if (mode !== 'availability') {
      return NextResponse.json({ error: 'Unsupported mode.' }, { status: 400 })
    }

    const events = await sql<{
      event_date: string
      start_time: string | null
      end_time: string | null
    }>(
      `select to_char(event_date, 'YYYY-MM-DD') as event_date, start_time, end_time
       from calendar_events
       order by event_date asc, start_time asc`
    )

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 })
  }
}
