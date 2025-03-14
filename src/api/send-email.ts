import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const { email, subject, message } = await request.json()

    if (!email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Email, subject, and message are required' }),
        { status: 400 }
      )
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'matthieu.polaina@gmail.com',
      replyTo: email,
      subject: `[RIA Facile] ${subject}`,
      text: `Message de : ${email}\n\n${message}`,
      html: `
        <h2>Nouveau message de RIA Facile</h2>
        <p><strong>De :</strong> ${email}</p>
        <p><strong>Objet :</strong> ${subject}</p>
        <hr>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500 }
    )
  }
} 