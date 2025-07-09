import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import emailjs from '@emailjs/browser'

export const ContactForm = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    try {
      // Remplace ces valeurs par tes vrais IDs EmailJS
      const serviceId = 'service_xxxxx' // Ton Service ID
      const templateId = 'template_xxxxx' // Ton Template ID
      const publicKey = 'znsgayj6DKP360rJ2' // Ta clé publique
      const templateParams = {
        name: name,
        email: email,
        title: subject,
        message: message
      }
      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey)
      if (result.status === 200) {
        setSubmitStatus('success')
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      } else {
        throw new Error('Erreur lors de l\'envoi')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi du message.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-medium">Message envoyé avec succès !</p>
          <p className="text-sm">Nous vous répondrons dans les plus brefs délais.</p>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">Erreur lors de l'envoi</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ria-light mb-2">
            Votre nom*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light disabled:opacity-50"
            placeholder="Votre nom"
          />
        </div>
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
            disabled={isLoading}
            className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light disabled:opacity-50"
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
            disabled={isLoading}
            className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light disabled:opacity-50"
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
            disabled={isLoading}
            rows={8}
            className="w-full bg-white bg-opacity-10 px-4 py-3 rounded-xl text-ria-light placeholder-ria-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-ria-light resize-none disabled:opacity-50"
            placeholder="Votre message..."
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-ria-light text-ria-blue font-semibold py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-ria-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            'Envoyer le message'
          )}
        </button>
      </form>
      <p className="mt-4 text-sm text-ria-light opacity-70">
        * indique les champs obligatoires
      </p>
    </div>
  )
} 