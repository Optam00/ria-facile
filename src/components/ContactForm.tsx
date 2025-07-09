import { useState } from 'react';

export const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Votre message a bien été envoyé. Merci !');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || "Une erreur est survenue lors de l'envoi du message.");
      }
    } catch (err) {
      setError("Impossible d'envoyer le message. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-2xl shadow-md p-8">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Votre email*
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm text-gray-900 placeholder-gray-400"
          placeholder="exemple@email.com"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Sujet*
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm text-gray-900 placeholder-gray-400"
          placeholder="Sujet de votre message"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message*
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={8}
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors shadow-sm text-gray-900 placeholder-gray-400 resize-none"
          placeholder="Votre message..."
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-[#774792] text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-[#5e3570] transition-all duration-300 text-base disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
      {success && <p className="mt-4 text-green-600 text-sm bg-green-50 border border-green-100 rounded-lg p-3">{success}</p>}
      {error && <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
      <p className="mt-4 text-xs italic text-gray-500">
        Le symbole * indique les champs obligatoires.<br />
        RIA Facile traite vos données pour répondre à votre demande de contact. Pour en savoir plus sur vos droits et la façon dont nous traitons vos données, consultez notre <a href="/politique-de-confidentialite" className="text-[#774792] hover:underline">Politique de confidentialité</a>.
      </p>
    </form>
  );
}; 