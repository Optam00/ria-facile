import React, { useState } from 'react'

export const ContactPage = () => {
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
        body: JSON.stringify({ email, subject, message }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message")
      }

      setSent(true)
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm inline-block">
            Nous contacter
          </h1>
          
          {sent ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl shadow-md border border-green-100">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Message envoyé !</h2>
              <p className="text-green-700 mb-6">
                Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={() => setSent(false)}
                className="bg-white text-green-700 px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-md border border-green-200 hover:scale-105 transform"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm"
                  placeholder="exemple@email.com"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm"
                  placeholder="Votre message..."
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 p-6 rounded-xl shadow-md border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-gray-800 font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {sending ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 