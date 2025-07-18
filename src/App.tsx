import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { QuizPage } from './pages/QuizPage'
import { ContactPage } from './pages/ContactPage'
import { QuizIntroPage } from './pages/QuizIntroPage'
import { LegalNoticePage } from './pages/LegalNoticePage'
import { PrivacyPage } from './pages/PrivacyPage'
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

function App() {
  return (
    <HelmetProvider>
      <Router>
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
              <Route path="/politique-de-confidentialite" element={<PrivacyPage />} />
              <Route path="/actualites" element={<ActualitesPage />} />
              <Route path="/doctrine" element={<DoctrinePage />} />
              <Route path="/doctrine/:id" element={<DoctrineArticlePage />} />
              <Route path="/recherche" element={<SearchResultsPage />} />
              <Route path="/lexique" element={<Lexique />} />
              <Route path="/assistant-ria" element={<AssistantRIAPage />} />
            </Routes>
          </div>
          <Footer />
          <CookieConsentBanner />
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App