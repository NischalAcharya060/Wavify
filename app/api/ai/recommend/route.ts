import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getModel, parseGeminiJSON, checkRateLimit, recordRequest } from '@/lib/gemini'
import { AIRecommendation } from '@/lib/types'

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

  const { limit = 10 } = await request.json().catch(() => ({})) as { limit?: number }
  const customApiKey = request.headers.get('x-gemini-api-key')?.trim()

  const [songsRes, likedRes, recentRes] = await Promise.all([
    supabase.from('songs').select('title').eq('user_id', user.id),
    supabase.from('liked_songs').select('songs(title)').eq('user_id', user.id).limit(20),
    supabase.from('recently_played').select('songs(title)').eq('user_id', user.id).order('played_at', { ascending: false }).limit(20),
  ])

  const allSongs = songsRes.data?.map((s: { title: string }) => s.title) || []
  const likedTitles = likedRes.data?.map((l: Record<string, unknown>) => (l.songs as { title: string })?.title).filter(Boolean) || []
  const recentTitles = recentRes.data?.map((r: Record<string, unknown>) => (r.songs as { title: string })?.title).filter(Boolean) || []

  if (!allSongs.length) {
    return NextResponse.json({ error: 'Add some songs to your library first' }, { status: 400 })
  }

  const prompt = `Based on this user's music library, suggest ${limit} songs they'd enjoy that are NOT already in their library.

Their library: ${allSongs.join(', ')}
Most liked: ${likedTitles.join(', ') || 'none yet'}
Recently played: ${recentTitles.join(', ') || 'none yet'}

Ignore suffixes like [Official Video], (Lyrics), etc. when analyzing their taste.

For each suggestion, return:
- title: the song title
- artist: the artist name
- searchQuery: a YouTube search query to find this song (e.g. "Artist - Song Title")
- reason: a brief reason why they'd like it (under 20 words)

Return ONLY a valid JSON array of objects.`

  try {
    const model = getModel('gemini-2.5-flash', customApiKey)
    const result = await model.generateContent(prompt)
    recordRequest(user.id)
    const text = result.response.text()
    const recommendations = parseGeminiJSON<AIRecommendation[]>(text)
    return NextResponse.json({ recommendations })
  } catch (error: unknown) {
    console.error('AI recommend error:', error)
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
