import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { QuizPage } from './pages/QuizPage'
import { ContactPage } from './pages/ContactPage'
import { QuizIntroPage } from './pages/QuizIntroPage'
import { LegalNoticePage } from './pages/LegalNoticePage'
import { PrivacyPage } from './pages/PrivacyPage'
import ConnexionPage from './pages/ConnexionPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import InscriptionPage from './pages/InscriptionPage'
import MonEspacePage from './pages/MonEspacePage'
import { HomePage } from './pages/HomePage'
import { ConsulterPage } from './pages/ConsulterPage'
import { DocumentationPage } from './pages/DocumentationPage'
import { ActualitesPage } from './pages/ActualitesPage'
import { CookieConsentBanner } from './components/CookieConsent'
import Popup from './components/Popup'
import DoctrinePage from './pages/DoctrinePage'
import DoctrineArticlePage from './pages/DoctrineArticlePage'
import { HelmetProvider } from 'react-helmet-async'
import SearchResultsPage from './pages/SearchResultsPage'
import { SchemasPage } from './pages/SchemasPage'
import Lexique from './pages/Lexique'
import AssistantRIAPage from './pages/AssistantRIAPage'
import AssistantRIAConversationPage from './pages/AssistantRIAConversationPage';
import VerifierPage from './pages/VerifierPage'
import FichesPratiquesPage from './pages/FichesPratiquesPage'
import FichePratiquePage from './pages/FichePratiquePage'
import VerifierSystemePage from './pages/VerifierSystemePage'
import VerifierModelePage from './pages/VerifierModelePage'
import VerifierChampApplicationPage from './pages/VerifierChampApplicationPage'
import VerifierNiveauRisquePage from './pages/VerifierNiveauRisquePage'
import VerifierNiveauRisqueModelePage from './pages/VerifierNiveauRisqueModelePage'
import VerifierRoleOrganisationPage from './pages/VerifierRoleOrganisationPage'
import VerifierRoleOrganisationModelePage from './pages/VerifierRoleOrganisationModelePage'
import MatriceDesObligationsPage from './pages/MatriceDesObligationsPage'
import FichePratiqueExactitudePage from './pages/FichePratiqueExactitudePage'
import FichePratiqueExplicabilitePage from './pages/FichePratiqueExplicabilitePage'
import FichePratiqueRMSPage from './pages/FichePratiqueRMSPage'
import FichePratiqueFRIAPage from './pages/FichePratiqueFRIAPage'
// import FichePratiqueTransparencePage from './pages/FichePratiqueTransparencePage' // Supprimé - maintenant géré par la route dynamique
import FichePratiqueControleHumainPage from './pages/FichePratiqueControleHumainPage'
import FichePratiqueDroitsRGPDPage from './pages/FichePratiqueDroitsRGPDPage'
import FichePratiqueSecteurBancairePage from './pages/FichePratiqueSecteurBancairePage'
import FichePratiqueExceptionHautRisquePage from './pages/FichePratiqueExceptionHautRisquePage'
import FichePratiqueMaitriseIAPage from './pages/FichePratiqueMaitriseIAPage'
import AdminConsolePage from './pages/AdminConsolePage'
import { RIAEn5MinutesPage } from './pages/RIAEn5MinutesPage'
import RAGTestPage from './pages/RAGTestPage'
import { AuthProvider } from './contexts/AuthContext'
import { InactivityWarning } from './components/InactivityWarning'
import { LinkedInPostsPage } from './pages/LinkedInPostsPage'

// Composant pour scroller vers le haut à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RouteErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Une erreur s&apos;est produite</h2>
            <p className="text-gray-600 text-sm mb-4">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen">
            <InactivityWarning />
            <Navigation />
            <Popup />
            <div className="container mx-auto px-4 py-8 flex-grow">
              <RouteErrorBoundary>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quiz" element={<QuizIntroPage />} />
              <Route path="/quiz/questions" element={<QuizPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/consulter" element={<ConsulterPage />} />
              <Route path="/schemas" element={<SchemasPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/mentions-legales" element={<LegalNoticePage />} />
              <Route path="/connexion" element={<ConnexionPage />} />
              <Route path="/definir-mot-de-passe" element={<ResetPasswordPage />} />
              <Route path="/inscription" element={<InscriptionPage />} />
              <Route path="/mon-espace" element={<MonEspacePage />} />
              <Route path="/admin/console" element={<AdminConsolePage />} />
              <Route path="/politique-de-confidentialite" element={<PrivacyPage />} />
              <Route path="/actualites" element={<ActualitesPage />} />
              <Route path="/doctrine" element={<DoctrinePage />} />
              <Route path="/doctrine/:id" element={<DoctrineArticlePage />} />
              <Route path="/recherche" element={<SearchResultsPage />} />
              <Route path="/lexique" element={<Lexique />} />
              <Route path="/assistant-ria" element={<AssistantRIAPage />} />
              <Route path="/assistant-ria/conversation" element={<AssistantRIAConversationPage />} />
              <Route path="/verificateur" element={<VerifierPage />} />
              <Route path="/verificateur/systeme-ia" element={<VerifierSystemePage />} />
              <Route path="/verificateur/modele-ia" element={<VerifierModelePage />} />
              <Route path="/verificateur/champ-application" element={<VerifierChampApplicationPage />} />
              <Route path="/verificateur/niveau-risque" element={<VerifierNiveauRisquePage />} />
              <Route path="/verificateur/niveau-risque-modele" element={<VerifierNiveauRisqueModelePage />} />
              <Route path="/verificateur/role-organisation-systeme" element={<VerifierRoleOrganisationPage />} />
              <Route path="/verificateur/role-organisation-modele" element={<VerifierRoleOrganisationModelePage />} />
              <Route path="/matrice-des-obligations" element={<MatriceDesObligationsPage />} />
              <Route path="/fiches-pratiques" element={<FichesPratiquesPage />} />
              <Route path="/fiches-pratiques/:slug" element={<FichePratiquePage />} />
              {/* Routes statiques en fallback pour les anciennes fiches (à supprimer progressivement) */}
              <Route path="/fiches-pratiques/exactitude" element={<FichePratiqueExactitudePage />} />
              <Route path="/fiches-pratiques/explicabilite" element={<FichePratiqueExplicabilitePage />} />
              <Route path="/fiches-pratiques/rms" element={<FichePratiqueRMSPage />} />
              <Route path="/fiches-pratiques/fria" element={<FichePratiqueFRIAPage />} />
              {/* Route transparence supprimée - maintenant gérée par la route dynamique /fiches-pratiques/:slug */}
              <Route path="/fiches-pratiques/controle-humain" element={<FichePratiqueControleHumainPage />} />
              <Route path="/fiches-pratiques/droits-rgpd" element={<FichePratiqueDroitsRGPDPage />} />
              <Route path="/fiches-pratiques/secteur-bancaire" element={<FichePratiqueSecteurBancairePage />} />
              <Route path="/fiches-pratiques/exception-haut-risque" element={<FichePratiqueExceptionHautRisquePage />} />
              <Route path="/fiches-pratiques/maitrise-ia" element={<FichePratiqueMaitriseIAPage />} />
              <Route path="/ria-en-5-minutes" element={<RIAEn5MinutesPage />} />
              <Route path="/rag" element={<RAGTestPage />} />
              <Route path="/linkedin-posts" element={<LinkedInPostsPage />} />
              </Routes>
              </RouteErrorBoundary>
            </div>
            <Footer />
            <CookieConsentBanner />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App