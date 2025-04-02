import React from 'react'
import ReactDOM from 'react-dom/client'
import { PageContext } from './types'
import '../index.css'

export { render }

let root: ReactDOM.Root

function render(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const page = <Page {...pageProps} />

  const container = document.getElementById('root')
  if (!container) throw new Error('DOM element #root not found')

  if (root) {
    // Hydratation pour la navigation client
    root.render(page)
  } else {
    // Premier rendu
    root = ReactDOM.createRoot(container)
    root.render(page)
  }
} 