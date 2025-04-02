import { QuizIntroPage } from '../QuizIntroPage'

export { Page }

function Page() {
  return <QuizIntroPage />
}

// Métadonnées exportées pour le SSR
export const documentProps = {
  title: 'Testez vos connaissances sur le Règlement IA (RIA, AI act, IA act)',
  description: 'Plongez dans notre quiz interactif sur le Règlement européen sur l\'Intelligence Artificielle (RIA) pour tester vos connaissances',
  url: 'https://www.ria-facile.com/quiz',
  image: 'https://www.ria-facile.com/og-image.png'
} 