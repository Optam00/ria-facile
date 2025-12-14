import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.jpeg'

export const Navigation = () => {
  const { isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showSearchInline, setShowSearchInline] = useState(false)
  const [openMaster, setOpenMaster] = useState(false)
  const [openConformite, setOpenConformite] = useState(false)
  const [mOpenMaster, setMOpenMaster] = useState(false)
  const [mOpenConformite, setMOpenConformite] = useState(false)
  const masterRef = useRef<HTMLDivElement>(null)
  const conformiteRef = useRef<HTMLDivElement>(null)
  const masterCloseTimeout = useRef<number | null>(null)
  const conformiteCloseTimeout = useRef<number | null>(null)
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

  // Fermer les menus au clic extérieur / navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (masterRef.current && !masterRef.current.contains(t) && conformiteRef.current && !conformiteRef.current.contains(t)) {
        setOpenMaster(false)
        setOpenConformite(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const cancelMasterClose = () => {
    if (masterCloseTimeout.current) {
      window.clearTimeout(masterCloseTimeout.current)
      masterCloseTimeout.current = null
    }
  }
  const scheduleMasterClose = () => {
    cancelMasterClose()
    masterCloseTimeout.current = window.setTimeout(() => setOpenMaster(false), 220)
  }
  const cancelConformiteClose = () => {
    if (conformiteCloseTimeout.current) {
      window.clearTimeout(conformiteCloseTimeout.current)
      conformiteCloseTimeout.current = null
    }
  }
  const scheduleConformiteClose = () => {
    cancelConformiteClose()
    conformiteCloseTimeout.current = window.setTimeout(() => setOpenConformite(false), 220)
  }

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
           <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex gap-8 items-center whitespace-nowrap">
               <Link to="/" className={`text-base font-semibold transition-colors hover:text-purple-700 ${isActive('/') ? 'text-purple-700' : 'text-gray-900'}`}>Accueil</Link>
               <Link to="/consulter" className={`text-base font-semibold transition-colors hover:text-purple-700 ${isActive('/consulter') ? 'text-purple-700' : 'text-gray-900'}`}>Consulter le RIA</Link>
              {/* Maîtriser le RIA dropdown */}
              <div
                className="relative"
                ref={masterRef}
                onMouseEnter={() => { cancelMasterClose(); setOpenMaster(true); setOpenConformite(false) }}
                onMouseLeave={() => scheduleMasterClose()}
              >
                <button onClick={() => {
                  setOpenMaster(prev => {
                    const next = !prev
                    if (next) setOpenConformite(false)
                    return next
                  })
                 }} className="text-base font-semibold text-gray-900 hover:text-purple-700 flex items-center gap-1">
                   Maîtriser le RIA
                   <svg className={`w-4 h-4 transition-transform ${openMaster ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                 </button>
                {openMaster && (
                  <div
                    className="absolute mt-2 bg-white shadow-xl rounded-lg border p-2 min-w-[240px] z-50"
                    onMouseEnter={cancelMasterClose}
                    onMouseLeave={scheduleMasterClose}
                  >
                    <Link to="/schemas" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenMaster(false)}>Le RIA en schémas</Link>
                    <Link to="/documentation" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenMaster(false)}>Documentation utile</Link>
                    <Link to="/doctrine" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenMaster(false)}>Doctrine</Link>
                    <Link to="/quiz" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenMaster(false)}>Quiz</Link>
                  </div>
                )}
              </div>
              {/* Se mettre en conformité dropdown */}
              <div
                className="relative"
                ref={conformiteRef}
                onMouseEnter={() => { cancelConformiteClose(); setOpenConformite(true); setOpenMaster(false) }}
                onMouseLeave={() => scheduleConformiteClose()}
              >
                <button onClick={() => {
                  setOpenConformite(prev => {
                    const next = !prev
                    if (next) setOpenMaster(false)
                    return next
                  })
                 }} className="text-base font-semibold text-gray-900 hover:text-purple-700 flex items-center gap-1">
                   Se mettre en conformité au RIA
                   <svg className={`w-4 h-4 transition-transform ${openConformite ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                 </button>
                {openConformite && (
                  <div
                    className="absolute mt-2 bg-white shadow-xl rounded-lg border p-2 min-w-[260px] z-50"
                    onMouseEnter={cancelConformiteClose}
                    onMouseLeave={scheduleConformiteClose}
                  >
                    <Link to="/assistant-ria" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenConformite(false)}>Assistant RIA</Link>
                    <Link to="/verificateur" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenConformite(false)}>Vérificateur de conformité</Link>
                    <Link to="/matrice-des-obligations" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenConformite(false)}>Matrice des obligations</Link>
                    <Link to="/fiches-pratiques" className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => setOpenConformite(false)}>Fiches pratiques</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Zone droite : recherche, bouton contact */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Champ de recherche compact (desktop uniquement) */}
          {!showSearchInline && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:border-purple-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-200 transition-all"
              style={{ minWidth: 220 }}
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-xs placeholder:text-gray-400"
                aria-label="Rechercher sur le site"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Effacer la recherche"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
              </svg>
            </button>
          )}
            </form>
          )}
          {/* Bouton console admin (si admin) */}
          {isAdmin() && (
            <Link
              to="/admin/console"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-none hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Console Admin
            </Link>
          )}
          {/* Bouton contact */}
          <Link
            to="/contact"
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-none hover:from-purple-700 hover:to-blue-700 transition-all text-sm"
            style={{ minWidth: 120, justifyContent: 'center' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Nous contacter
          </Link>
        </div>

        {/* Menu burger mobile/tablette (en dessous de xl) */}
        <div className="flex lg:hidden flex-1 justify-end">
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
                {/* Maîtriser le RIA group (accordéon) */}
                <div className="mt-3 border-t pt-3">
                  <button onClick={() => setMOpenMaster(v => !v)} aria-expanded={mOpenMaster} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left">
                    <span className="text-base font-semibold tracking-wide">Maîtriser le RIA</span>
                    <svg className={`w-5 h-5 transition-transform ${mOpenMaster ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {mOpenMaster && (
                    <div className="ml-1 flex flex-col gap-1 mt-1">
                      <Link to="/schemas" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Le RIA en schémas</Link>
                      <Link to="/documentation" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Documentation utile</Link>
                      <Link to="/doctrine" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Doctrine</Link>
                      <Link to="/quiz" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Quiz</Link>
                    </div>
                  )}
                </div>
                {/* Conformité group (accordéon) */}
                <div className="mt-3 border-t pt-3">
                  <button onClick={() => setMOpenConformite(v => !v)} aria-expanded={mOpenConformite} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left">
                    <span className="text-base font-semibold tracking-wide">Se mettre en conformité au RIA</span>
                    <svg className={`w-5 h-5 transition-transform ${mOpenConformite ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {mOpenConformite && (
                    <div className="ml-1 flex flex-col gap-1 mt-1">
                      <Link to="/assistant-ria" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Assistant RIA</Link>
                      <Link to="/verificateur" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Vérificateur de conformité</Link>
                      <Link to="/fiches-pratiques" className="block text-base leading-6 py-2 px-3 rounded-lg hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Fiches pratiques</Link>
                    </div>
                  )}
                </div>
                {isAdmin() && (
                  <Link to="/admin/console" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition bg-indigo-50 text-indigo-700 font-semibold" onClick={() => setIsOpen(false)}>
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Console d'administration
                    </span>
                  </Link>
                )}
                <Link to="/contact" className="py-2 px-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition" onClick={() => setIsOpen(false)}>Nous contacter</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 