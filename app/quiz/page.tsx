import type { Metadata } from 'next'
import { QuizIntroPage } from '@/pages/QuizIntroPage'

export const metadata: Metadata = {
  title: 'Testez vos connaissances sur le Règlement IA (RIA, AI act, IA act)',
  description: 'Plongez dans notre quiz interactif sur le Règlement européen sur l'Intelligence Artificielle (RIA) pour tester vos connaissances',
  openGraph: {
    title: 'Testez vos connaissances sur le Règlement IA (RIA, AI act, IA act)',
    description: 'Plongez dans notre quiz interactif sur le Règlement européen sur l'Intelligence Artificielle (RIA) pour tester vos connaissances',
  },
}

export default function QuizPage() {
  return <QuizIntroPage />
} 