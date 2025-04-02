import React from 'react'

export interface PageContext {
  Page: (props: any) => React.ReactElement
  pageProps: any
  documentProps: {
    title: string
    description: string
    url: string
    image: string
  }
} 