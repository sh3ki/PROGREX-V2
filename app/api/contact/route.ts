import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
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
    await sql('alter table contact_submissions add column if not exists attachment_urls text[] default array[]::text[]')

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

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0a1e;color:#e2e8f0;padding:32px;border-radius:12px;border:1px solid #1e1b4b;">
        <h2 style="color:#a78bfa;margin-bottom:4px;">New Contact Form Submission</h2>
        <p style="color:#64748b;font-size:13px;margin-top:0;">via PROGREX website contact form</p>
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:20px 0;" />
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:140px;">Full Name</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Phone</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${phone}</td></tr>` : ''}
          ${company ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Company</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${company}</td></tr>` : ''}
          ${service ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Service</td><td style="padding:8px 0;color:#a78bfa;font-size:14px;font-weight:600;">${service}</td></tr>` : ''}
          ${requestMeeting ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Meeting Request</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${meetingDate} ${meetingStartTime} (${meetingDurationMinutes} mins)</td></tr>` : ''}
          ${budget ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Budget</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${budget}</td></tr>` : ''}
        </table>
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:20px 0;" />
        <p style="color:#94a3b8;font-size:13px;margin-bottom:8px;">Message</p>
        <p style="color:#f1f5f9;font-size:14px;line-height:1.7;white-space:pre-line;background:#050510;padding:16px;border-radius:8px;border:1px solid #1e1b4b;">${message}</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px;">Uploaded files: ${uploadedAttachmentUrls.length}</p>
        <p style="color:#475569;font-size:11px;margin-top:24px;">Sent from PROGREX Contact Form — ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</p>
      </div>
    `

    await sql(
      `insert into contact_submissions(name, email, phone, company, service, budget, message, attachment_urls, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8::text[], 'new')`,
      [name, email, phone || null, company || null, service || null, budget || null, message, uploadedAttachmentUrls]
    )

    if (requestMeeting) {
      await sql(
        `insert into bookings(name, email, phone, company, service, budget, message, source, status, is_approved, requested_date, requested_start_time, requested_duration_minutes)
         values ($1, $2, $3, $4, $5, $6, $7, 'contact-form', 'new', false, $8::date, $9, $10)`,
        [
          name,
          email,
          phone || null,
          company || null,
          service || null,
          budget || null,
          message,
          meetingDate,
          meetingStartTime,
          meetingDurationMinutes,
        ]
      )
    }

    await transporter.sendMail({
      from: `"PROGREX Contact Form" <${process.env.SMTP_USER}>`,
      to: 'progrex.tech@gmail.com, shekaigarcia@gmail.com',
      replyTo: email,
      subject: `[PROGREX] New Inquiry from ${name}${service ? ` — ${service}` : ''}`,
      html,
    })

    return NextResponse.json({ success: true })
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
       where event_date >= current_date - interval '1 day'
       order by event_date asc, start_time asc`
    )

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 })
  }
}
