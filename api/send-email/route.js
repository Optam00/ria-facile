import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('Starting email send process...');
    
    const body = await request.json();
    const { email, subject, message } = body;

    console.log('Received request data:', { email, subject, messageLength: message?.length });

    if (!email || !subject || !message) {
      console.log('Missing required fields:', { email: !!email, subject: !!subject, message: !!message });
      return NextResponse.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      );
    }

    console.log('Checking Resend API key:', !!process.env.RESEND_API_KEY);
    console.log('Sending email with Resend...');

    const emailData = {
      from: 'onboarding@resend.dev',
      to: 'matthieu.polaina@gmail.com',
      reply_to: email,
      subject: `[RIA Facile] ${subject}`,
      html: `
        <h2>Nouveau message de RIA Facile</h2>
        <p><strong>De :</strong> ${email}</p>
        <p><strong>Objet :</strong> ${subject}</p>
        <hr>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    console.log('Email configuration:', emailData);

    const data = await resend.emails.send(emailData);

    console.log('Email sent successfully:', data);

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
} 