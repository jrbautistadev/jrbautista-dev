import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { LRUCache } from 'lru-cache';

export const runtime = 'edge';

// Rate limiter: 3 requests per hour per IP
const rateLimit = new LRUCache<string, number>({
  max: 500, // Keep track of 500 unique IPs
  ttl: 1000 * 60 * 60, // 1 hour window
});

export async function POST(request: Request) {
  try {
    // Check for environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error: Missing email credentials' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting check
    const currentCount = rateLimit.get(ip) || 0;
    if (currentCount >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    rateLimit.set(ip, currentCount + 1);

    const { name, email, subject, message, gotcha } = await request.json();

    // Honeypot check
    if (gotcha) {
      // Silently fail for bots
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      );
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email via Resend
    // Note: 'from' must be a verified domain or the default 'onboarding@resend.dev' if testing
    // For production, verify your domain in Resend dashboard
    const { error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Update this after verifying domain
      to: 'jrbautista.dev@gmail.com', // Replace with your verified email
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to send email: ${errorMessage}` },
      { status: 500 }
    );
  }
}
