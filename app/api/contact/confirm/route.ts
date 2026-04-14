import path from 'node:path'
import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { sql } from '@/lib/server/db'

type PendingPayload = {
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  budget?: string
  message: string
  requestMeeting: boolean
  meetingDate?: string
  meetingStartTime?: string
  meetingDurationMinutes?: number
  attachmentUrls: string[]
  pendingRecordType?: 'booking' | 'contact'
  pendingRecordId?: string
}

function normalizePhone(value: string | undefined) {
  return String(value || '').replace(/\D+/g, '').slice(0, 20)
}

function buildDetailsRows(payload: PendingPayload) {
  return [
    ['Full Name', payload.name],
    ['Email', payload.email],
    ['Phone', payload.phone || 'Not provided'],
    ['Company', payload.company || 'Not provided'],
    ['Service', payload.service || 'Not specified'],
    ['Budget', payload.budget || 'Not specified'],
    ['Meeting Request', payload.requestMeeting ? `${payload.meetingDate || '-'} ${payload.meetingStartTime || '-'} (${payload.meetingDurationMinutes || 0} mins)` : 'No'],
    ['Attachments', payload.attachmentUrls.length ? String(payload.attachmentUrls.length) : '0'],
  ]
}

function detailsTable(payload: PendingPayload) {
  return `<table style="width:100%;border-collapse:collapse;">${buildDetailsRows(payload)
    .map(([label, value]) => `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:150px;">${label}</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${value}</td></tr>`)
    .join('')}</table>`
}

function receivedEmailHtml(payload: PendingPayload) {
  const attachmentList = payload.attachmentUrls.length
    ? `<ul style="margin:8px 0 0;padding-left:18px;">${payload.attachmentUrls.map((url) => `<li><a href="${url}" style="color:#7dd3fc;">${url}</a></li>`).join('')}</ul>`
    : '<p style="margin:8px 0 0;color:#93c5fd;font-size:12px;">No attachment uploaded.</p>'

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;">
      <div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);">
        <h1 style="margin:0;color:#fff;font-size:20px;">Message Received</h1>
        <p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">ProgreX Team has received your inquiry.</p>
      </div>
      <div style="padding:22px 24px;color:#dbeafe;">
        <p style="margin:0 0 12px;font-size:14px;">Hi ${payload.name},</p>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">Thank you for contacting ProgreX. Here are the complete details we received:</p>
        ${detailsTable(payload)}
        <p style="margin:16px 0 8px;color:#94a3b8;font-size:13px;">Message</p>
        <p style="color:#f1f5f9;font-size:14px;line-height:1.7;white-space:pre-line;background:#050510;padding:16px;border-radius:8px;border:1px solid #1e1b4b;">${payload.message}</p>
        <p style="margin:16px 0 4px;color:#94a3b8;font-size:13px;">Attachments</p>
        ${attachmentList}
      </div>
    </div>
  `
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim() || ''
  const redirectBase = new URL('/contact', req.url)

  if (!token) {
    redirectBase.searchParams.set('confirm', 'invalid')
    return NextResponse.redirect(redirectBase)
  }

  try {
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

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const pending = await sql<{ id: string; payload: PendingPayload }>(
      `select id, payload
         from contact_submission_confirmations
        where token_hash = $1
          and consumed_at is null
          and expires_at > now()
        limit 1`,
      [tokenHash]
    )

    if (!pending.length) {
      redirectBase.searchParams.set('confirm', 'expired')
      return NextResponse.redirect(redirectBase)
    }

    const payload = pending[0].payload
    const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com'
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

    if (!smtpUser || !smtpPass) {
      redirectBase.searchParams.set('confirm', 'error')
      return NextResponse.redirect(redirectBase)
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })

    const logoPath = path.join(process.cwd(), 'public', 'ProgreX Logo Black.png')
    const receivedHtml = receivedEmailHtml(payload)

    await transporter.sendMail({
      from: `"ProgreX Team" <${smtpUser}>`,
      to: payload.email,
      subject: 'We received your message — ProgreX',
      html: receivedHtml,
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
      to: 'progrex.tech@gmail.com, shekaigarcia@gmail.com',
      replyTo: payload.email,
      subject: `[PROGREX] New Inquiry from ${payload.name}${payload.service ? ` — ${payload.service}` : ''}`,
      html: receivedHtml,
    })

    if (payload.requestMeeting) {
      const pendingId = String(payload.pendingRecordId || '').trim()
      const updated = pendingId
        ? await sql<{ id: string }>(
            `update bookings
                set status = 'new',
                    updated_at = now()
              where id = $1::uuid
                and email = $2
                and status = 'pending'
              returning id::text`,
            [pendingId, payload.email]
          )
        : []

      if (!updated.length) {
        await sql(
          `insert into bookings(name, email, phone, company, service, source, status, requested_date, requested_start_time, requested_duration_minutes, budget, project_details, attachment_urls, is_active, is_approved)
           values ($1, $2, $3, $4, $5, 'contact-form', 'new', $6::date, $7, $8, $9, $10, $11::text[], true, false)`,
          [
            payload.name,
            payload.email,
            normalizePhone(payload.phone) || null,
            payload.company || null,
            payload.service || null,
            payload.meetingDate || null,
            payload.meetingStartTime || null,
            payload.meetingDurationMinutes || 0,
            payload.budget || null,
            payload.message,
            payload.attachmentUrls,
          ]
        )
      }
    } else {
      const pendingId = String(payload.pendingRecordId || '').trim()
      const updated = pendingId
        ? await sql<{ id: string }>(
            `update contact_submissions
                set status = 'new',
                    updated_at = now()
              where id = $1::uuid
                and email = $2
                and status = 'pending'
              returning id::text`,
            [pendingId, payload.email]
          )
        : []

      if (!updated.length) {
        await sql(
          `insert into contact_submissions(name, email, phone, company, service, budget, message, attachment_urls, status, request_meeting)
           values ($1, $2, $3, $4, $5, $6, $7, $8::text[], 'new', false)`,
          [payload.name, payload.email, normalizePhone(payload.phone) || null, payload.company || null, payload.service || null, payload.budget || null, payload.message, payload.attachmentUrls]
        )
      }
    }

    await sql('update contact_submission_confirmations set consumed_at = now() where id = $1', [pending[0].id])
    redirectBase.searchParams.set('confirm', 'success')
    return NextResponse.redirect(redirectBase)
  } catch (error) {
    console.error('contact confirm error', error)
    redirectBase.searchParams.set('confirm', 'error')
    return NextResponse.redirect(redirectBase)
  }
}
