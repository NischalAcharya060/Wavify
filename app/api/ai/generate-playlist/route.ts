import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getModel, parseGeminiJSON, checkRateLimit, recordRequest } from '@/lib/gemini'
import { GeneratedPlaylist } from '@/lib/types'

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

  const { prompt } = await request.json() as { prompt: string }
  const customApiKey = request.headers.get('x-gemini-api-key')?.trim()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Provide a playlist prompt' }, { status: 400 })
  }

  const { data: songs } = await supabase
    .from('songs')
    .select('id, title')
    .eq('user_id', user.id)

  if (!songs?.length) {
    return NextResponse.json({ error: 'Add some songs to your library first' }, { status: 400 })
  }

  const songList = songs.map((s: { id: string; title: string }) => `- ID: "${s.id}" | Title: "${s.title}"`).join('\n')

  const aiPrompt = `The user wants a playlist for: "${prompt}"

Their library contains these songs (with IDs):
${songList}

Instructions:
1. Pick songs from their library that match this vibe. Return their EXACT IDs.
2. Suggest up to 5 new songs (not in their library) that would fit. For each, give title, artist, and a YouTube search query.
3. Generate a creative playlist name and a short description (under 25 words).

Ignore suffixes like [Official Video], (Lyrics), etc. when analyzing songs.

Return ONLY valid JSON with this structure:
{
  "playlistName": "string",
  "description": "string",
  "existingSongs": [{"songId": "exact-uuid", "title": "song title"}],
  "newSuggestions": [{"title": "string", "artist": "string", "searchQuery": "string"}]
}`

  try {
    const model = getModel('gemini-2.5-flash', customApiKey)
    const result = await model.generateContent(aiPrompt)
    recordRequest(user.id)
    const text = result.response.text()
    const playlist = parseGeminiJSON<GeneratedPlaylist>(text)
    return NextResponse.json(playlist)
  } catch (error: unknown) {
    console.error('AI generate-playlist error:', error)
    const isQuotaError = error instanceof Error && error.message.includes('429')
    const isApiKeyError = error instanceof Error && /api key|apikey|credential|permission/i.test(error.message)
    const msg = isQuotaError
      ? 'Gemini API quota exceeded. Please wait or check your API key billing at ai.google.dev'
      : isApiKeyError
        ? 'Gemini API key is invalid or restricted. Update your key in Settings → Gemini API Key.'
        : 'AI processing failed. If the default key is unavailable, add your own key in Settings → Gemini API Key.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
