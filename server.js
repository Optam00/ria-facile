import express from 'express'
import { renderPage } from 'vite-plugin-ssr/server'
import compression from 'compression'

const isProduction = process.env.NODE_ENV === 'production'
const root = process.cwd()
const port = process.env.PORT || 3000

startServer()

async function startServer() {
  const app = express()
  app.use(compression())

  if (isProduction) {
    app.use(express.static(`${root}/dist/client`))
  }

  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl
    }

    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext

    if (!httpResponse) {
      return next()
    }

    const { body, statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType).send(body)
  })

  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
} 