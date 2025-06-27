import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showSearchInline, setShowSearchInline] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isActive = (path: string) => location.pathname === path

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setShowSearch(false)
      setIsOpen(false)
      setShowSearchInline(false)
    }
  }

  // Focus sur l'input quand la recherche s'ouvre
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  return (
    <nav className="bg-white sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo à gauche */}
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <img 
            src={logo}
            alt="RIA Facile Logo" 
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Recherche inline (xl+) */}
        {showSearchInline && (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center justify-center gap-2 animate-fade-in"
            style={{ minWidth: 0 }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher sur le site…"
              className="w-full max-w-xl px-6 py-3 rounded-full border border-gray-300 bg-gray-50 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors placeholder:text-gray-400 text-center"
              aria-label="Rechercher sur le site"
              autoFocus
            />
            <button
              type="button"
              className="ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Fermer la recherche"
              onClick={() => setShowSearchInline(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
              </svg>
            </button>
          </form>
        )}

        {/* Menu horizontal centré (xl+) */}
        {!showSearchInline && (
          <div className="hidden xl:flex flex-1 justify-center">
            <div className="flex gap-8 items-center whitespace-nowrap">
              <Link to="/" className={`text-lg font-semibold transition-colors hover:text-purple-700 ${isActive('/') ? 'text-purple-700' : 'text-gray-900'}`}>Accueil</Link>
              <Link to="/consulter" className={`text-lg font-semibold transition-colors hover:text-purple-700 ${isActive('/consulter') ? 'text-purple-700' : 'text-gray-900'}`}>Consulter le RIA</Link>
              <Link to="/documentation" className={`text-lg font-semibold transition-colors hover:text-purple-700 ${isActive('/documentation') ? 'text-purple-700' : 'text-gray-900'}`}>Documentation utile</Link>
              <Link to="/doctrine" className={`text-lg font-semibold transition-colors hover:text-purple-700 ${isActive('/doctrine') ? 'text-purple-700' : 'text-gray-900'}`}>Doctrine</Link>
              <Link to="/quiz" className={`text-lg font-semibold transition-colors hover:text-purple-700 ${isActive('/quiz') ? 'text-purple-700' : 'text-gray-900'}`}>Quiz</Link>
            </div>
          </div>
        )}

        {/* Zone droite : bouton contact, loupe */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Bouton contact */}
          <Link
            to="/contact"
            className="hidden xl:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-none hover:from-purple-700 hover:to-blue-700 transition-all text-base"
            style={{ minWidth: 140, justifyContent: 'center' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Nous contacter
          </Link>
          {/* Loupe/recherche desktop uniquement (xl+) */}
          {!showSearchInline && (
            <button
              onClick={() => setShowSearchInline(true)}
              className="hidden xl:flex p-2.5 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              aria-label="Ouvrir la recherche"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>

        {/* Menu burger mobile/tablette (en dessous de xl) */}
        <div className="flex xl:hidden flex-1 justify-end">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2.5 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {isOpen && (
            <div className="fixed inset-0 z-50 bg-black/20 flex justify-end" onClick={() => setIsOpen(false)}>
              <div className="w-72 max-w-full bg-white h-full shadow-2xl p-6 flex flex-col gap-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="self-end mb-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500"
                  aria-label="Fermer le menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                  </svg>
                </button>
                {/* Champ de recherche mobile dans le menu burger */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 mb-4 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                  role="search"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher sur le site…"
                    className="flex-1 bg-transparent border-none outline-none text-gray-800 text-base"
                    aria-label="Rechercher sur le site"
                  />
                  <button
                    type="submit"
                    className="text-gray-400 hover:text-blue-600 focus:outline-none p-1 transition-colors"
                    aria-label="Lancer la recherche"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                    </svg>
                  </button>
                </form>
                <Link to="/" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Accueil</Link>
                <Link to="/consulter" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Consulter le RIA</Link>
                <Link to="/documentation" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Documentation utile</Link>
                <Link to="/doctrine" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Doctrine</Link>
                <Link to="/quiz" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Quiz</Link>
                <Link to="/contact" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Nous contacter</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 