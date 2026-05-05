import { NextResponse } from 'next/server'

type ContactPayload = {
  name?: unknown
  email?: unknown
  subject?: unknown
  message?: unknown
  gotcha?: unknown
  recaptchaToken?: unknown
}

const isNonEmptyString = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const hasCloudflareSockets = () =>
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'

const sendEmail = async ({
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPass,
  contactToEmail,
  replyToEmail,
  subject,
  text,
  html,
}: {
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPass: string
  contactToEmail: string
  replyToEmail: string
  subject: string
  text: string
  html: string
}) => {
  if (hasCloudflareSockets()) {
    const { createMailer } = await import('@tolbel/cf-mailer')
    const mailer = createMailer({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await mailer.send({
      from: smtpUser,
      to: contactToEmail,
      subject,
      text,
      html,
    })
    return
  }

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  await transporter.sendMail({
    from: smtpUser,
    to: contactToEmail,
    replyTo: replyToEmail,
    subject,
    text,
    html,
  })
}

const verifyRecaptcha = async (token: string, ipAddress?: string) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  if (!secret) {
    throw new Error('Missing RECAPTCHA_SECRET_KEY')
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  })

  if (ipAddress) {
    body.set('remoteip', ipAddress)
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    return false
  }

  const data = (await response.json()) as { success?: boolean }
  return Boolean(data.success)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload

    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const email = typeof payload.email === 'string' ? payload.email.trim() : ''
    const subject = typeof payload.subject === 'string' ? payload.subject.trim() : ''
    const message = typeof payload.message === 'string' ? payload.message.trim() : ''
    const gotcha = typeof payload.gotcha === 'string' ? payload.gotcha.trim() : ''
    const recaptchaToken = typeof payload.recaptchaToken === 'string' ? payload.recaptchaToken.trim() : ''

    if (gotcha) {
      return NextResponse.json({ ok: true })
    }

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(subject) ||
      !isNonEmptyString(message)
    ) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (subject.length > 150 || message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'reCAPTCHA verification is required.' }, { status: 400 })
    }

    const ipAddress =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      undefined

    const recaptchaPassed = await verifyRecaptcha(recaptchaToken, ipAddress)

    if (!recaptchaPassed) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 })
    }

    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpHost = process.env.SMTP_HOST ?? 'smtp.gmail.com'
    const smtpPort = Number(process.env.SMTP_PORT ?? '465')
    const smtpSecure = (process.env.SMTP_SECURE ?? 'true') !== 'false'
    const contactToEmail = process.env.CONTACT_TO_EMAIL ?? smtpUser

    if (!smtpUser || !smtpPass || !contactToEmail) {
      throw new Error('Missing SMTP configuration')
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br />')

    await sendEmail({
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      contactToEmail,
      replyToEmail: email,
      subject: `Portfolio Contact: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 16px;">New Portfolio Contact</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact form error', error)
    return NextResponse.json(
      { error: 'Unable to send your message right now. Please try again later.' },
      { status: 500 }
    )
  }
}
