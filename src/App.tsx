import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { QuizPage } from './pages/QuizPage'
import { ContactPage } from './pages/ContactPage'
import { QuizIntroPage } from './pages/QuizIntroPage'
import { LegalNoticePage } from './pages/LegalNoticePage'
import { PrivacyPage } from './pages/PrivacyPage'
import ConnexionPage from './pages/ConnexionPage'
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
import FichePratiqueTransparencePage from './pages/FichePratiqueTransparencePage'
import FichePratiqueControleHumainPage from './pages/FichePratiqueControleHumainPage'
import FichePratiqueDroitsRGPDPage from './pages/FichePratiqueDroitsRGPDPage'
import FichePratiqueSecteurBancairePage from './pages/FichePratiqueSecteurBancairePage'
import FichePratiqueExceptionHautRisquePage from './pages/FichePratiqueExceptionHautRisquePage'
import FichePratiqueMaitriseIAPage from './pages/FichePratiqueMaitriseIAPage'
import { AuthProvider } from './contexts/AuthContext'

// Composant pour scroller vers le haut à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen">
            <Navigation />
            <Popup />
            <div className="container mx-auto px-4 py-8 flex-grow">
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
              <Route path="/fiches-pratiques/exactitude" element={<FichePratiqueExactitudePage />} />
              <Route path="/fiches-pratiques/explicabilite" element={<FichePratiqueExplicabilitePage />} />
              <Route path="/fiches-pratiques/rms" element={<FichePratiqueRMSPage />} />
              <Route path="/fiches-pratiques/fria" element={<FichePratiqueFRIAPage />} />
              <Route path="/fiches-pratiques/transparence" element={<FichePratiqueTransparencePage />} />
              <Route path="/fiches-pratiques/controle-humain" element={<FichePratiqueControleHumainPage />} />
              <Route path="/fiches-pratiques/droits-rgpd" element={<FichePratiqueDroitsRGPDPage />} />
              <Route path="/fiches-pratiques/secteur-bancaire" element={<FichePratiqueSecteurBancairePage />} />
              <Route path="/fiches-pratiques/exception-haut-risque" element={<FichePratiqueExceptionHautRisquePage />} />
              <Route path="/fiches-pratiques/maitrise-ia" element={<FichePratiqueMaitriseIAPage />} />
              </Routes>
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