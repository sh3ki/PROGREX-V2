import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, service, budget, message, attachment } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Validate attachment size (base64 is ~1.37x the original; cap at ~4.1 MB base64 ≈ 3 MB file, under Vercel's 4.5 MB body limit)
    if (attachment && attachment.data && attachment.data.length > 4.2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Attached file is too large (max 3 MB).' }, { status: 400 })
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
          ${budget ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Budget</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;">${budget}</td></tr>` : ''}
        </table>
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:20px 0;" />
        <p style="color:#94a3b8;font-size:13px;margin-bottom:8px;">Message</p>
        <p style="color:#f1f5f9;font-size:14px;line-height:1.7;white-space:pre-line;background:#050510;padding:16px;border-radius:8px;border:1px solid #1e1b4b;">${message}</p>
        ${attachment ? `<p style="color:#94a3b8;font-size:12px;margin-top:16px;">📎 Attachment: <strong style="color:#a78bfa;">${attachment.name}</strong></p>` : ''}
        <p style="color:#475569;font-size:11px;margin-top:24px;">Sent from PROGREX Contact Form — ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</p>
      </div>
    `

    await transporter.sendMail({
      from: `"PROGREX Contact Form" <${process.env.SMTP_USER}>`,
      to: 'progrex.tech@gmail.com, shekaigarcia@gmail.com',
      replyTo: email,
      subject: `[PROGREX] New Inquiry from ${name}${service ? ` — ${service}` : ''}`,
      html,
      attachments: attachment
        ? [{ filename: attachment.name, content: attachment.data, encoding: 'base64', contentType: attachment.contentType }]
        : [],
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
