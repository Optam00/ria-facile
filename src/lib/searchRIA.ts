import type { SupabaseClient } from '@supabase/supabase-js'

export interface SearchFilters {
  reglement: boolean
  documentation: boolean
  doctrine: boolean
  actualites: boolean
  considerants?: boolean
  annexes?: boolean
  fichesPratiques: boolean
}

export interface SearchResults {
  reglement: any[]
  documentation: any[]
  doctrine: any[]
  actualites: any[]
  considerants: any[]
  annexes: any[]
  fichesPratiques: any[]
}

export const defaultSearchFilters: SearchFilters = {
  reglement: true,
  documentation: true,
  doctrine: true,
  actualites: true,
  considerants: true,
  annexes: true,
  fichesPratiques: true,
}

export function removeDiacritics(str: string) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export function highlight(text: string, keyword: string) {
  if (!keyword) return text
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

export function getExcerpt(text: string, keyword: string, contextLength = 40) {
  if (!keyword) return text.slice(0, 200) + (text.length > 200 ? '…' : '')
  const normalizedText = removeDiacritics(text.toLowerCase())
  const normalizedKeyword = removeDiacritics(keyword.toLowerCase())
  const index = normalizedText.indexOf(normalizedKeyword)
  if (index === -1) return text.slice(0, 200) + (text.length > 200 ? '…' : '')
  let realIndex = index
  for (let i = 0, j = 0; i < text.length && j < index; i++) {
    if (removeDiacritics(text[i].toLowerCase()) === normalizedText[j]) j++
    realIndex = i
  }
  const start = Math.max(0, realIndex - contextLength)
  const end = Math.min(text.length, realIndex + keyword.length + contextLength)
  let excerpt = text.slice(start, end)
  if (start > 0) excerpt = '…' + excerpt
  if (end < text.length) excerpt = excerpt + '…'
  return excerpt
}

const FICHES_PRATIQUES = [
  { id: 'exactitude', titre: "Gérer l'exactitude (Accuracy) dans les systèmes IA", description: "Guide pratique pour la mise en conformité opérationnelle du principe d'exactitude. Croisement RGPD et AI Act.", articlesRIA: ['10', '15'] },
  { id: 'explicabilite', titre: "Explicabilité & Interprétabilité dans les systèmes IA", description: "Guide pratique pour la mise en conformité opérationnelle de l'explicabilité et l'interprétabilité. Croisement RGPD et AI Act.", articlesRIA: ['13', '14', '86'] },
  { id: 'droits-rgpd', titre: "Gestion des droits RGPD dans les systèmes d'IA", description: "Guide pratique pour organiser l'exercice des droits RGPD (accès, rectification, effacement, opposition) dans les systèmes d'IA, en articulation avec le Règlement IA.", articlesRIA: ['10', '13', '86'] },
  { id: 'rms', titre: "Le système de gestion des risques (RMS)", description: "Guide pratique pour la mise en place et la gestion du système de gestion des risques (RMS) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act.", articlesRIA: ['9', '16', '26', '27'] },
  { id: 'fria', titre: "Analyse d'impact sur les droits fondamentaux (FRIA)", description: "Guide pratique pour réaliser une analyse d'impact sur les droits fondamentaux (FRIA) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act.", articlesRIA: ['13', '26', '27'] },
  { id: 'transparence', titre: "Transparence et information des utilisateurs", description: "Guide pratique pour la transparence et l'information des utilisateurs dans les systèmes d'IA. Croisement RGPD et AI Act.", articlesRIA: ['13', '26', '50', '53'] },
  { id: 'controle-humain', titre: "Le contrôle humain", description: "Guide pratique pour la mise en place du contrôle humain dans les systèmes d'IA à haut risque. Croisement RGPD et AI Act.", articlesRIA: ['14', '26'] },
  { id: 'secteur-bancaire', titre: "L'AI Act dans le secteur bancaire & financier", description: "Guide pratique pour l'application de l'AI Act dans le secteur bancaire et financier (scoring crédit, assurance, biais, FRIA et intégration dans le cadre prudentiel).", articlesRIA: ['6', '17', '27'] },
  { id: 'exception-haut-risque', titre: "L'exception de qualification \"Haut Risque\" (Article 6.3)", description: "Guide pratique sur l'exception de qualification Haut Risque (Art. 6.3 AI Act) : conditions, documentation, enregistrement et articulation avec le RGPD.", articlesRIA: ['6', '51'] },
  { id: 'maitrise-ia', titre: "La maîtrise de l'IA (Article 4)", description: "Guide pratique sur l'obligation de maîtrise de l'IA (Art. 4 AI Act) : formation du personnel, approche contextuelle et plan d'actions pour la conformité.", articlesRIA: ['4'] },
]

export async function performSearch(
  supabase: SupabaseClient,
  searchQuery: string,
  searchFilters: SearchFilters
): Promise<SearchResults> {
  const searchResults: SearchResults = {
    reglement: [],
    documentation: [],
    doctrine: [],
    actualites: [],
    considerants: [],
    annexes: [],
    fichesPratiques: [],
  }

  if (!searchQuery.trim()) return searchResults

  if (searchFilters.reglement) {
    const { data } = await supabase
      .from('article')
      .select('id_article, titre, numero, contenu')
      .or(`titre.ilike.%${searchQuery}%,contenu.ilike.%${searchQuery}%`)
    searchResults.reglement = data || []
  }

  if (searchFilters.documentation) {
    const { data } = await supabase
      .from('documentation')
      .select('id, titre, resume, themes')
      .or(`titre.ilike.%${searchQuery}%,resume.ilike.%${searchQuery}%,themes.ilike.%${searchQuery}%`)
    searchResults.documentation = data || []
  }

  if (searchFilters.doctrine) {
    const { data } = await supabase
      .from('doctrine')
      .select('id, titre, abstract, auteur')
      .eq('published', true)
      .or(`titre.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,auteur.ilike.%${searchQuery}%`)
    searchResults.doctrine = data || []
  }

  if (searchFilters.actualites) {
    const { data } = await supabase
      .from('Actu')
      .select('id, Titre, Date, media, lien')
      .ilike('Titre', `%${searchQuery}%`)
    searchResults.actualites = data || []
  }

  const { data: considerants } = await supabase
    .from('considerant')
    .select('id_considerant, numero, contenu')
    .ilike('contenu', `%${searchQuery}%`)
  searchResults.considerants = considerants || []

  if (searchFilters.annexes) {
    const { data: annexesData } = await supabase
      .from('annexes')
      .select('id_annexe, titre_section, contenu')
      .ilike('contenu', `%${searchQuery}%`)
    let annexesResults: any[] = []
    if (annexesData?.length) {
      const ids = annexesData.map(a => a.id_annexe)
      const { data: listeAnnexes } = await supabase
        .from('liste_annexes')
        .select('id_annexe, titre, numero')
        .in('id_annexe', ids)
      annexesResults = annexesData.map(a => {
        const annexeInfo = listeAnnexes?.find(l => l.id_annexe === a.id_annexe)
        return {
          id_annexe: a.id_annexe,
          numero: annexeInfo?.numero ?? a.id_annexe,
          titre_annexe: annexeInfo?.titre ?? `Annexe ${a.id_annexe}`,
          titre_section: a.titre_section,
          contenu: a.contenu,
        }
      })
    }
    searchResults.annexes = annexesResults
  }

  if (searchFilters.fichesPratiques) {
    const q = removeDiacritics(searchQuery.toLowerCase())
    searchResults.fichesPratiques = FICHES_PRATIQUES.filter(fiche => {
      const titreNormalized = removeDiacritics(fiche.titre.toLowerCase())
      const descriptionNormalized = removeDiacritics(fiche.description.toLowerCase())
      return titreNormalized.includes(q) || descriptionNormalized.includes(q)
    })
  }

  return searchResults
}
