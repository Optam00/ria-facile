import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
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
    }
  }

  // Focus sur l'input quand la recherche s'ouvre
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo}
              alt="RIA Facile Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Recherche desktop - expansion de l'icône */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {showSearch ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm transition-all duration-300 ease-in-out"
                style={{ minWidth: '300px' }}
                role="search"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher sur le site…"
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm"
                  aria-label="Rechercher sur le site"
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-blue-600 focus:outline-none p-1"
                  aria-label="Lancer la recherche"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 focus:outline-none p-1"
                  aria-label="Fermer la recherche"
                  onClick={() => {
                    setShowSearch(false)
                    setSearch('')
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 focus:outline-none"
                aria-label="Ouvrir la recherche"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative md:ml-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div
              className={`absolute right-0 top-14 w-80 bg-white rounded-xl shadow-lg transform origin-top-right transition-all duration-200 ${
                isOpen
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="py-2">
                {/* Champ de recherche sur mobile */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex md:hidden items-center relative px-4 py-3 border-b border-gray-100"
                  role="search"
                >
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher sur le site…"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-800 bg-gray-50"
                    aria-label="Rechercher sur le site"
                  />
                  <button
                    type="submit"
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
                    aria-label="Lancer la recherche"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                    </svg>
                  </button>
                </form>
                
                <Link
                  to="/"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/consulter"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/consulter') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Consulter le RIA
                </Link>
                <Link
                  to="/documentation"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/documentation') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Documentation utile
                </Link>
                <Link
                  to="/doctrine"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/doctrine') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Doctrine
                </Link>
                <Link
                  to="/actualites"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/actualites') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Actualités
                </Link>
                <Link
                  to="/quiz"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/quiz') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Quiz
                </Link>
                <Link
                  to="/contact"
                  className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors ${
                    isActive('/contact') ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 