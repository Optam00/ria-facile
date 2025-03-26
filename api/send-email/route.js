import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: 'RESEND_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const { email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
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
      `
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 