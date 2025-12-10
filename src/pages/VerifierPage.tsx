import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

type CardProps = {
  title: string
  color: 'violet' | 'blue' | 'gradient'
  to?: string
  disabled?: boolean
  subtitle?: string
}

const Card: React.FC<CardProps> = ({ title, color, to, disabled, subtitle }) => {
  // Mobile et desktop: fond blanc avec bordures colorées
  const baseMobile = 'md:hidden rounded-[18px] text-center px-4 py-6 shadow-lg select-none max-w-[240px] h-[140px] w-full mx-auto flex flex-col items-center justify-center'
  const baseDesktop = 'hidden md:flex rounded-2xl text-center md:px-4 md:py-5 shadow-lg select-none md:max-w-[260px] min-h-[140px] w-full mx-auto flex-col items-center justify-center'
  
  const borderColor = color === 'violet'
    ? '#842cd2'
    : color === 'blue'
      ? '#2963e8'
      : undefined
  
  const textColor = color === 'violet'
    ? '#842cd2'
    : color === 'blue'
      ? '#2963e8'
      : '#000'
  
  // Mobile: wrapper gradient ou bordure simple
  const baseMobileGradientOuter = 'md:hidden rounded-[18px] p-[3px] shadow-lg max-w-[240px] h-[140px] w-full mx-auto'
  const baseMobileGradientInner = 'flex rounded-[18px] text-center px-4 py-6 bg-white w-full h-full flex-col items-center justify-center'
  
  const contentMobile = color === 'gradient' ? (
    <div
      className={`${baseMobileGradientOuter} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transition'}`}
      style={{ background: 'linear-gradient(90deg, #842cd2 0%, #2963e8 100%)' }}
    >
      <div className={baseMobileGradientInner}>
        <div className="text-base leading-snug font-medium text-gray-900">{title}</div>
        {disabled ? (
          <div className="mt-2 text-xs text-gray-600">En cours de construction</div>
        ) : subtitle ? (
          <div className="mt-2 text-xs text-gray-600">{subtitle}</div>
        ) : null}
      </div>
    </div>
  ) : (
    <div
      className={`${baseMobile} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transition'}`}
      style={{
        backgroundColor: '#ffffff',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: borderColor,
      }}
    >
      <div className="text-base leading-snug font-medium" style={{ color: textColor }}>{title}</div>
      {disabled ? (
        <div className="mt-2 text-xs" style={{ color: `${textColor}CC` }}>En cours de construction</div>
      ) : subtitle ? (
        <div className="mt-2 text-xs" style={{ color: `${textColor}CC` }}>{subtitle}</div>
      ) : null}
    </div>
  )
  
  // Pour desktop: wrapper avec bordure gradient ou simple bordure
  const baseDesktopInner = 'flex rounded-2xl text-center md:px-4 md:py-5 shadow-lg select-none md:max-w-[260px] min-h-[140px] w-full mx-auto flex-col items-center justify-center bg-white'
  const baseDesktopGradientOuter = 'hidden md:block rounded-2xl p-[3px] shadow-lg md:max-w-[540px] min-h-[140px] w-full mx-auto'
  const baseDesktopGradientInner = 'flex rounded-2xl text-center md:px-4 md:py-5 bg-white w-full h-full flex-col items-center justify-center min-h-[calc(140px-6px)]'
  const contentDesktop = color === 'gradient' ? (
    <div
      className={`${baseDesktopGradientOuter} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transition'}`}
      style={{ background: 'linear-gradient(90deg, #842cd2 0%, #2963e8 100%)' }}
    >
      <div className={baseDesktopGradientInner}>
        <div className="text-sm md:text-base leading-snug font-medium text-gray-900">{title}</div>
        {disabled ? (
          <div className="mt-2 text-xs text-gray-600">En cours de construction</div>
        ) : subtitle ? (
          <div className="mt-2 text-xs text-gray-600">{subtitle}</div>
        ) : null}
      </div>
    </div>
  ) : (
    <div
      className={`${baseDesktop} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transition'}`}
      style={{
        backgroundColor: '#ffffff',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: borderColor,
      }}
    >
      <div className="text-sm md:text-base leading-snug font-medium" style={{ color: textColor }}>{title}</div>
      {disabled ? (
        <div className="mt-2 text-xs" style={{ color: `${textColor}CC` }}>En cours de construction</div>
      ) : subtitle ? (
        <div className="mt-2 text-xs" style={{ color: `${textColor}CC` }}>{subtitle}</div>
      ) : null}
    </div>
  )
  
  if (disabled || !to) {
    return (
      <>
        {contentMobile}
        {contentDesktop}
      </>
    )
  }
  return (
    <Link to={to} aria-disabled={false} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 rounded-2xl">
      {contentMobile}
      {contentDesktop}
    </Link>
  )
}

const Arrow: React.FC = () => (
  <div className="flex items-center justify-center" aria-hidden>
    <svg className="w-7 h-7 md:w-6 md:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
)

const VerifierPage: React.FC = () => {
  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Vérificateurs de conformité au Règlement IA — RIA Facile</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        {/* Bandeau blanc */}
        <div className="bg-white rounded-3xl shadow-md p-6 text-center mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#774792' }}>Vérificateurs de conformité au Règlement IA</h1>
          <p className="text-gray-600">Qualifier votre solution d'IA, votre rôle et votre niveau de risque grâce aux questionnaires ci-dessous.</p>
        </div>
        {/* Grille inspirée du schéma fourni */}
        <div className="flex justify-center">
          <div className="grid grid-cols-2 md:[grid-template-columns:1fr_1.5rem_1fr] gap-3 items-center md:max-w-[700px]">
          {/* Ligne 1 */}
          <div className="col-start-1">
            <Card
              title="Déterminer si une solution est un système d’IA"
              color="violet"
              to="/verificateur/systeme-ia"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>
          <div className="col-start-2 md:hidden">
            <Card
              title="Déterminer si une solution est un modèle d'IA à usage général"
              color="blue"
              to="/verificateur/modele-ia"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>
          <div className="hidden md:block" />
          <div className="hidden md:block col-start-3">
            <Card
              title="Déterminer si une solution est un modèle d'IA à usage général"
              color="blue"
              to="/verificateur/modele-ia"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>

          {/* Flèches vers la carte centrale */}
          {/* Mobile: deux flèches sous chaque colonne */}
          <div className="block md:hidden col-start-1"><Arrow /></div>
          <div className="block md:hidden col-start-2"><Arrow /></div>
          {/* Desktop: flèche, espace, flèche */}
          <div className="hidden md:block"><Arrow /></div>
          <div className="hidden md:block" />
          <div className="hidden md:block"><Arrow /></div>

          {/* Carte centrale */}
          <div className="col-span-2 md:col-span-3">
            <Card
              title="Déterminer si je suis dans le champ d'application du règlement"
              color="gradient"
              to="/verificateur/champ-application"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>

          {/* Flèches vers le niveau de risque */}
          <div className="block md:hidden col-start-1"><Arrow /></div>
          <div className="block md:hidden col-start-2"><Arrow /></div>
          <div className="hidden md:block"><Arrow /></div>
          <div className="hidden md:block" />
          <div className="hidden md:block"><Arrow /></div>

          {/* Ligne niveau de risque */}
          <div className="col-start-1">
            <Card
              title="Déterminer le niveau de risque d'un système d'IA"
              color="violet"
              to="/verificateur/niveau-risque"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>
          <div className="col-start-2 md:hidden">
            <Card
              title="Déterminer le niveau de risque d'un modèle d'IA"
              color="blue"
              to="/verificateur/niveau-risque-modele"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>
          <div className="hidden md:block" />
          <div className="hidden md:block col-start-3">
            <Card
              title="Déterminer le niveau de risque d'un modèle d'IA"
              color="blue"
              to="/verificateur/niveau-risque-modele"
              subtitle="Cliquer pour accéder au questionnaire"
            />
          </div>

          {/* Flèches vers le rôle de l’organisation */}
          <div className="block md:hidden col-start-1"><Arrow /></div>
          <div className="block md:hidden col-start-2"><Arrow /></div>
          <div className="hidden md:block"><Arrow /></div>
          <div className="hidden md:block" />
          <div className="hidden md:block"><Arrow /></div>

          {/* Ligne rôle organisation */}
          <div className="col-start-1">
            <Card
              title="Déterminer le rôle de mon organisation concernant un système d’IA"
              color="violet"
              disabled
            />
          </div>
          <div className="col-start-2 md:hidden">
            <Card
              title="Déterminer le rôle de mon organisation concernant un modèle d’IA"
              color="blue"
              disabled
            />
          </div>
          <div className="hidden md:block" />
          <div className="hidden md:block col-start-3">
            <Card
              title="Déterminer le rôle de mon organisation concernant un modèle d’IA"
              color="blue"
              disabled
            />
          </div>
          </div>
        </div>
        {/* Bloc d'information contact */}
        <div className="bg-white rounded-2xl shadow-md p-5 mt-8 text-center">
          <p className="text-gray-700">
            Ces questionnaires ne constituent pas un conseil juridique et ne remplacent pas
            un accompagnement par des experts de la conformité au Règlement IA.
            <span className="block mt-2">
              <Link to="/contact" className="text-indigo-600 font-semibold hover:underline">
                Contactez-nous via le formulaire pour être accompagné
              </Link>
              .
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifierPage


