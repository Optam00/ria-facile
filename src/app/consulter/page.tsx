import React from 'react'
import type { Metadata } from 'next'
import { ConsulterPage } from '../../pages/ConsulterPage'

export const metadata: Metadata = {
  title: "Consulter le règlement IA de façon simple et interactive (RIA, IA Act, AI Act)",
  description: "Plus besoin de se battre avec le pdf officiel, vous pouvez désormais consulter le règlement grâce à un sommaire interactif",
  openGraph: {
    title: "Consulter le règlement IA de façon simple et interactive (RIA, IA Act, AI Act)",
    description: "Plus besoin de se battre avec le pdf officiel, vous pouvez désormais consulter le règlement grâce à un sommaire interactif"
  }
}

export default function ConsulterPageWrapper() {
  return <ConsulterPage />
} 