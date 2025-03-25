import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import logo from '../assets/logo.jpeg'
import consulterImage from '../assets/consulter.jpeg'
import quizImage from '../assets/quiz.jpeg'
import accueilImage from '../assets/accueil.jpeg'
import { Button } from '@/components/Button'

interface SectionProps {
  children: ReactNode
  isReversed?: boolean
  className?: string
}

const Section = ({ children, isReversed = false, className = '' }: SectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className={`py-24 ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
        {children}
      </div>
    </motion.div>
  )
}

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-blue-50 via-white/80 to-white mt-4 rounded-[3rem] min-h-[400px] flex items-center">
        <div className="lg:px-8 py-4 lg:max-w-[520px] mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bold mb-6 leading-tight text-[#774792]"
          >
            Comprenez et appliquez le Règlement IA en toute simplicité
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            RIA Facile a été créé pour vous aider dans votre mise en conformité au règlement européen sur l'intelligence artificielle (RIA, AI act, IA act).
          </motion.p>
        </div>
        <div className="relative h-full lg:h-[400px] bg-white rounded-3xl overflow-hidden flex items-center justify-center shadow-lg shadow-purple-100/50">
          <img src={accueilImage} alt="Intelligence Artificielle et Réglementation" className="object-contain w-full h-full p-8" />
        </div>
      </Section>

      {/* Consulter Section */}
      <Section className="bg-white/80 backdrop-blur-sm rounded-[3rem]">
        <div className="relative h-[400px] bg-white rounded-3xl overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-100/50 lg:ml-12">
          <img src={consulterImage} alt="Consultation du RIA" className="object-contain w-full h-full p-8" />
        </div>
        <div className="lg:pl-12">
          <h2 className="text-4xl font-bold mb-6 text-[#774792]">Consultez le RIA en détail</h2>
          <p className="text-lg text-gray-600 mb-10">
            Une consultation intuitive du texte officiel du règlement IA, et bientôt des options supplémentaires !
          </p>
          <button 
            onClick={() => navigate('/consulter')}
            className="w-full lg:w-auto bg-gradient-to-r from-[#6366F1] to-[#774792] text-white text-xl px-12 py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 shadow-lg group"
          >
            Explorer le règlement
            <span className="text-2xl transform transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </Section>

      {/* Quiz Section */}
      <Section className="bg-white/80 backdrop-blur-sm rounded-[3rem]">
        <div className="lg:pl-12">
          <h2 className="text-4xl font-bold mb-6 text-[#774792]">Testez vos connaissances</h2>
          <p className="text-lg text-gray-600 mb-10">
            Plus de 150 questions interactives, des explications détaillées et un système de badges pour évaluer et améliorer votre maîtrise du RIA.
          </p>
          <button 
            onClick={() => navigate('/quiz')}
            className="w-full lg:w-auto bg-gradient-to-r from-[#6366F1] to-[#774792] text-white text-xl px-12 py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 shadow-lg group"
          >
            Démarrer le quiz
            <span className="text-2xl transform transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
        <div className="relative h-[400px] bg-white rounded-3xl overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-100/50 lg:mr-12">
          <img src={quizImage} alt="Quiz RIA" className="object-contain w-full h-full p-8" />
        </div>
      </Section>
    </div>
  )
} 