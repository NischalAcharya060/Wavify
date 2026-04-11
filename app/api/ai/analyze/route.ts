import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getModel, parseGeminiJSON, checkRateLimit, recordRequest } from '@/lib/gemini'
import { SongAnalysis } from '@/lib/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateCheck = checkRateLimit(user.id)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.message },
      { status: 429, headers: rateCheck.retryAfterSeconds ? { 'Retry-After': String(rateCheck.retryAfterSeconds) } : {} }
    )
  }

  const { songIds } = await request.json() as { songIds: string[] }
  if (!songIds?.length || songIds.length > 20) {
    return NextResponse.json({ error: 'Provide 1-20 song IDs' }, { status: 400 })
  }

  const { data: songs } = await supabase
    .from('songs')
    .select('id, title')
    .in('id', songIds)

  if (!songs?.length) {
    return NextResponse.json({ error: 'No songs found' }, { status: 404 })
  }

  const songList = songs.map(s => `- ID: "${s.id}" | Title: "${s.title}"`).join('\n')

  const prompt = `Analyze these songs based on their titles. For each song, provide:
- mood: one word (e.g. "happy", "melancholic", "energetic", "chill", "dark", "romantic")
- energy: number from 1-10
- genres: array of up to 3 genre tags
- vibe: a short description under 15 words

Ignore suffixes like [Official Video], (Lyrics), (Official Audio), etc. in titles.

Songs:
${songList}

Return ONLY a valid JSON array with objects containing: songId, mood, energy, genres, vibe.`

  try {
    const model = getModel()
    const result = await model.generateContent(prompt)
    recordRequest(user.id)
    const text = result.response.text()
    const analyses = parseGeminiJSON<SongAnalysis[]>(text)
    return NextResponse.json({ results: analyses })
  } catch (error: unknown) {
    console.error('AI analyze error:', error)
    const msg = error instanceof Error && error.message.includes('429')
      ? 'Gemini API quota exceeded. Please wait or check your API key billing at ai.google.dev'
      : 'AI processing failed. Please try again.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
