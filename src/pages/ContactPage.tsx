import React, { useState } from 'react'
import { motion } from 'framer-motion'
import contactImage from '../assets/contact.jpeg'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

export const ContactPage = () => {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <>
      <Helmet>
        <title>Contactez-nous | RIA Facile</title>
        <meta name="description" content="Contactez-nous pour toute question sur le Règlement IA, pour être accompagné dans votre mise en conformité ou pour nous signaler un bug." />
      </Helmet>
      <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch h-full">
              {/* Colonne de gauche avec l'image et le texte */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 flex flex-col"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <h1 className="text-4xl font-bold text-[#774792] mb-4">
                    Nous contacter
                  </h1>
                  <p className="text-gray-600 leading-relaxed">
                    Vous souhaitez être accompagné dans votre mise en conformité IA ? Vous souhaitez être formé sur la réglementation IA ? Vous souhaitez nous signaler un bug ? Vous avez des suggestions pour améliorer RIA Facile ? Nous vous répondrons dans les meilleurs délais.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative flex-1 rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={contactImage}
                    alt="Contact"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </motion.div>

              {/* Colonne de droite avec le formulaire */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl shadow-md border border-green-100"
                  >
                    <h2 className="text-xl font-semibold mb-4 text-green-800">Message envoyé !</h2>
                    <p className="text-green-700 mb-6">
                      Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSent(false)}
                      className="bg-white text-green-700 px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-md border border-green-200"
                    >
                      Envoyer un autre message
                    </motion.button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100"
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Votre email*
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100"
                    >
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet*
                      </label>
                      <select
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="Être accompagné dans ma conformité IA">Être accompagné dans ma conformité IA</option>
                        <option value="Être formé au règlement IA">Être formé au règlement IA</option>
                        <option value="Signaler un bug">Signaler un bug</option>
                        <option value="Suggérer une amélioration">Suggérer une amélioration de RIA Facile</option>
                        <option value="Proposer un partenariat">Proposer un partenariat</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100"
                    >
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message*
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={10}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm resize-none"
                        placeholder="Votre message..."
                      />
                    </motion.div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={sending}
                      className={`group w-full bg-gradient-to-r from-blue-600 to-[#774792] text-white py-4 px-8 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                        sending ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      <span>{sending ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                      <svg
                        className="w-5 h-5 transform transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.button>

                    <p className="mt-6 text-xs italic text-gray-500 space-y-2">
                      <span className="block">Le symbole * indique les champs obligatoires.</span>
                      <span className="block">
                        RIA Facile traite vos données pour répondre à votre demande de contact. Pour en savoir plus sur vos droits et la façon dont nous traitons vos données, consultez notre{' '}
                        <Link to="/politique-de-confidentialite" className="text-[#774792] hover:underline">
                          Politique de confidentialité
                        </Link>
                        .
                      </span>
                    </p>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 