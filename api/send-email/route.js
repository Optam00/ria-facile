import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { email, subject, message } = await request.json();

    if (!email || !subject || !message) {
      return Response.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: 'Resend <onboarding@resend.dev>',
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
    });

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
} 