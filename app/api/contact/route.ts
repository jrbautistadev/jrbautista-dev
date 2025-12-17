import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { LRUCache } from 'lru-cache';

// Rate limiter: 3 requests per hour per IP
const rateLimit = new LRUCache<string, number>({
  max: 500, // Keep track of 500 unique IPs
  ttl: 1000 * 60 * 60, // 1 hour window
});

export async function POST(request: Request) {
  try {
    // Check for environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing email credentials' },
        { status: 500 }
      );
    }

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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to yourself
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
    };

    await transporter.sendMail(mailOptions);

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
