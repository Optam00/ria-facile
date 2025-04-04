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

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizIntroPage />} />
            <Route path="/quiz/questions" element={<QuizPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/consulter" element={<ConsulterPage />} />
            <Route path="/mentions-legales" element={<LegalNoticePage />} />
            <Route path="/politique-de-confidentialite" element={<PrivacyPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App