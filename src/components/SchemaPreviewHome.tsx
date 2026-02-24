import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabasePublic } from '../lib/supabasePublic'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RiaSchema {
  id: number
  title: string
  image_url: string
  position: number
}

export const SchemaPreviewHome: React.FC = () => {
  const [schemas, setSchemas] = useState<RiaSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [randomIndex, setRandomIndex] = useState<number | null>(null)
  const { user, loading: authLoading, isAdherent, isAdmin } = useAuth()
  const isMember = isAdherent() || isAdmin()

  useEffect(() => {
    setLoading(true)
    const fetchSchemas = async () => {
      try {
        const client = !authLoading && user ? supabase : supabasePublic
        const { data, err } = await client
          .from('ria_schemas')
          .select('id, title, image_url, position')
          .eq('published', true)
          .order('position', { ascending: true })
        if (err) throw err
        const list = data ?? []
        setSchemas(list)
        if (list.length > 0) {
          setRandomIndex(Math.floor(Math.random() * list.length))
        }
      } catch (e) {
        console.error('Erreur chargement schémas (home):', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSchemas()
  }, [user?.id, authLoading])

  const schema = schemas.length > 0 && randomIndex !== null ? schemas[randomIndex] : null
  const schemaAnchor = schema && randomIndex !== null ? `#schema-${randomIndex + 1}` : ''

  if (loading || !schema) {
    if (loading) {
      return (
        <div className="relative py-6">
          <div className="relative max-w-3xl mx-auto px-4 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative py-6">
      <div className="relative max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="inline-block text-2xl md:text-3xl font-bold text-purple-800 mb-2 px-4 py-1 bg-white rounded-lg">
            Le RIA en schémas
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full" />
        </div>
        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden flex flex-col items-center p-8">
          <div className="w-full flex justify-center mb-6">
            <img
              src={schema.image_url}
              alt={`${schema.title} - Schéma explicatif du Règlement IA - RIA Facile`}
              className="w-full max-w-md md:max-w-lg h-auto object-contain rounded-xl shadow-md"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <Link
              to={`/schemas${schemaAnchor}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base"
            >
              Voir ce schéma
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/schemas"
              className="text-purple-600 hover:text-purple-800 text-sm md:text-base flex items-center justify-center"
            >
              Voir tous les schémas
            </Link>
          </div>
          {!isMember && (
            <p className="mt-4 text-xs text-gray-500 text-center max-w-md">
              Certains schémas supplémentaires, plus détaillés, sont réservés aux adhérents.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
