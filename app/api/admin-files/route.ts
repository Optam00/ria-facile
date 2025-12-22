import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client Supabase côté serveur (API route)
const supabaseUrl = process.env.VITE_SUPABASE_URL
// Idéalement, utiliser une service role key (non exposée au client)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  // On loggue côté serveur; la route renverra une erreur explicite
  console.error(
    '❌ Variables VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes pour la route /api/admin-files'
  )
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function POST(req: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Configuration Supabase manquante côté serveur.' },
      { status: 500 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni.' },
        { status: 400 }
      )
    }

    // Nom de fichier unique
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('admin-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('❌ Erreur upload admin-files (API route):', error)
      return NextResponse.json(
        { error: error.message || 'Erreur lors de l’upload du fichier.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        path: data?.path ?? fileName,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ Exception dans /api/admin-files:', err)
    return NextResponse.json(
      { error: err?.message || 'Erreur interne lors de l’upload.' },
      { status: 500 }
    )
  }
}


