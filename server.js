import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
app.use(cors())
app.use(express.json())

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

app.post('/api/send-email', async (req, res) => {
  try {
    const { email, subject, message } = req.body

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Email, subject, and message are required' })
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

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 