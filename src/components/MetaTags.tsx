import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface MetaTagsProps {
  title: string
  description: string
}

export const MetaTags = ({ title, description }: MetaTagsProps) => {
  const location = useLocation()
  const baseUrl = 'https://www.ria-facile.com'

  useEffect(() => {
    // Mise à jour du titre et de la description
    document.title = title
    document.querySelector('meta[name="title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)

    // Mise à jour des balises Open Graph
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${baseUrl}${location.pathname}`)

    // Mise à jour des balises Twitter
    document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="twitter:url"]')?.setAttribute('content', `${baseUrl}${location.pathname}`)
  }, [title, description, location])

  return null
} 