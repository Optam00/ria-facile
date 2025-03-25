import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

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

          <div className="relative">
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
              className={`absolute right-0 top-14 w-64 bg-white rounded-xl shadow-lg transform origin-top-right transition-all duration-200 ${
                isOpen
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="py-2">
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