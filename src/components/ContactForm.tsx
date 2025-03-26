import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const ContactForm = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message')
      }

      setSent(true)
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      console.error('Erreur détaillée:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {sent ? (
        <div className="text-center py-12 bg-white bg-opacity-10 rounded-2xl">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-ria-light text-xl mb-8">Message envoyé avec succès !</p>
          <button
            onClick={() => navigate('/')}
            className="bg-ria-light text-ria-blue px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-medium"
          >
            Retourner à l'accueil
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ria-light mb-2">
              Votre email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light"
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-ria-light mb-2">
              Objet
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light"
              placeholder="Sujet de votre message"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-ria-light mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light resize-none"
              placeholder="Votre message..."
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-500 bg-opacity-10 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-ria-light text-ria-blue font-semibold py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {sending ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>
        </form>
      )}
    </div>
  )
} 