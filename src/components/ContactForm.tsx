import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const ContactForm = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Création de l'URL mailto avec les données du formulaire
    const mailtoUrl = `mailto:ria-facile@outlook.fr?subject=${encodeURIComponent(`[RIA Facile] ${subject}`)}&body=${encodeURIComponent(`${message}\n\nDe: ${email}`)}`
    
    // Ouvre le client email
    window.location.href = mailtoUrl
    
    // Réinitialise le formulaire
    setEmail('')
    setSubject('')
    setMessage('')
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ria-light mb-2">
            Votre email*
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
            Objet*
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
            Message*
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

        <button
          type="submit"
          className="w-full bg-ria-light text-ria-blue font-semibold py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 text-base"
        >
          Envoyer le message
        </button>
      </form>

      <p className="mt-4 text-sm text-ria-light opacity-70">
        * indique les champs obligatoires
      </p>
    </div>
  )
} 