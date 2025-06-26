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
      <div className="max-w-6xl mx-auto px-6 py-4 relative">
        <div className="flex justify-between items-center gap-6 relative">
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img 
              src={logo}
              alt="RIA Facile Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Menu horizontal desktop (xl+) */}
          <div className="flex-1 justify-center hidden xl:flex">
            <div className="flex flex-wrap gap-1 md:gap-3 lg:gap-4 items-center whitespace-nowrap">
              <Link to="/" className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isActive('/') ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-lg' : 'text-gray-700'}`}>Accueil</Link>
              <Link to="/consulter" className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isActive('/consulter') ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-lg' : 'text-gray-700'}`}>Consulter le RIA</Link>
              <Link to="/documentation" className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isActive('/documentation') ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-lg' : 'text-gray-700'}`}>Documentation utile</Link>
              <Link to="/doctrine" className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isActive('/doctrine') ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-lg' : 'text-gray-700'}`}>Doctrine</Link>
              <Link to="/quiz" className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isActive('/quiz') ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-lg' : 'text-gray-700'}`}>Quiz</Link>
              <Link to="/contact" className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isActive('/contact') ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-lg' : 'text-gray-700'}`}>Nous contacter</Link>
            </div>
          </div>

          {/* Menu burger mobile/tablette (en dessous de xl) */}
          <div className="flex-1 flex xl:hidden justify-end">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2.5 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Overlay menu mobile */}
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

          {/* Loupe/recherche desktop uniquement (xl+) */}
          <div className="hidden xl:flex items-center gap-2 ml-2 flex-shrink-0 relative">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              aria-label="Ouvrir la recherche"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              </svg>
            </button>
            {/* Overlay recherche aligné (desktop) */}
            {showSearch && (
              <div className="absolute right-0 top-1/2 z-50 -translate-y-1/2" style={{minWidth:320, maxWidth:400}}>
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex items-center gap-2 animate-fade-in">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center gap-2 w-full"
                    role="search"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Rechercher sur le site…"
                      className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm px-2"
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
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 focus:outline-none p-1 transition-colors"
                      aria-label="Fermer la recherche"
                      onClick={() => setShowSearch(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                        <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 