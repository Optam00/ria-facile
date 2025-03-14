import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as Blob

    if (!image) {
      return new Response(JSON.stringify({ error: 'Aucune image fournie' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Générer un nom de fichier unique
    const fileName = `share-${Date.now()}.png`
    const filePath = `share-images/${fileName}`

    // Upload l'image vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('share-images')
      .upload(filePath, image, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (error) throw error

    // Obtenir l'URL publique de l'image
    const { data: { publicUrl } } = supabase.storage
      .from('share-images')
      .getPublicUrl(filePath)

    return new Response(JSON.stringify({ imageUrl: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return new Response(JSON.stringify({ error: 'Erreur lors de l\'upload' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 