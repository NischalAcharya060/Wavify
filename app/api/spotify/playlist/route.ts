import { NextRequest, NextResponse } from 'next/server'

interface PlaylistItem {
  videoId: string
  title: string
  thumbnail: string
  author?: string
}

interface SpotifyOEmbedResponse {
  title?: string
}

interface SimplifiedSpotifyTrack {
  name: string
  artist: string
}

class RouteError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
  }
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\\u0026/g, '&')
    .replace(/\\"/g, '"')
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '')
}

function cleanText(s: string): string {
  return decodeHtml(stripTags(s)).replace(/\s+/g, ' ').trim()
}

function getYouTubeSearchResult(html: string): { videoId: string; title: string } | null {
  const match = html.match(/var ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)
  if (match) {
    try {
      const data = JSON.parse(match[1])
      const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents
      if (Array.isArray(sections)) {
        for (const section of sections) {
          const contents = section?.itemSectionRenderer?.contents
          if (!Array.isArray(contents)) continue
          for (const content of contents) {
            const renderer = content?.videoRenderer
            const videoId = renderer?.videoId
            if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue
            const title =
              renderer?.title?.runs?.[0]?.text ||
              renderer?.title?.simpleText ||
              'Unknown Title'
            return { videoId, title }
          }
        }
      }
    } catch {
      // Fall back to regex parser.
    }
  }

  const idMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
  if (!idMatch) return null

  const titleMatch =
    html.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]/) ||
    html.match(/"title":\{"simpleText":"([^"]+)"\}/)

  return {
    videoId: idMatch[1],
    title: decodeHtml(titleMatch?.[1] || 'Unknown Title'),
  }
}

async function searchYouTubeTrack(query: string): Promise<{ videoId: string; title: string } | null> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const html = await res.text()
  return getYouTubeSearchResult(html)
}

async function fetchSpotifyPlaylistName(playlistId: string): Promise<string> {
  const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`
  const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(playlistUrl)}`
  const res = await fetch(oEmbedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (res.status === 404) throw new RouteError(404, 'Spotify playlist not found or is private')
  if (!res.ok) throw new RouteError(502, 'Could not load Spotify playlist metadata')

  const data = (await res.json()) as SpotifyOEmbedResponse
  return data.title || 'Spotify Playlist'
}

function parseSpotifyTracksFromEmbedHtml(html: string): SimplifiedSpotifyTrack[] {
  const tracks: SimplifiedSpotifyTrack[] = []
  const rowRegex = /<li[^>]*data-testid="tracklist-row-\d+"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>/g
  let match: RegExpExecArray | null

  while ((match = rowRegex.exec(html)) !== null) {
    const titleMarkup = match[1]
    const artistMarkup = match[2].replace(/<span[^>]*data-testid="tag"[^>]*>[\s\S]*?<\/span>/gi, '')

    const name = cleanText(titleMarkup)
    const artist = cleanText(artistMarkup)

    if (!name) continue
    tracks.push({
      name,
      artist: artist || 'Unknown Artist',
    })
  }

  return tracks
}

async function fetchSpotifyPlaylistTracks(playlistId: string): Promise<SimplifiedSpotifyTrack[]> {
  const url = `https://open.spotify.com/embed/playlist/${playlistId}`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
  })

  if (res.status === 404) throw new RouteError(404, 'Spotify playlist not found or is private')
  if (!res.ok) throw new RouteError(502, 'Could not load Spotify playlist tracks')

  const html = await res.text()
  return parseSpotifyTracksFromEmbedHtml(html)
}

async function resolveSpotifyTracksToYouTube(tracks: SimplifiedSpotifyTrack[]): Promise<{ items: PlaylistItem[]; unmatched: number }> {
  if (tracks.length === 0) return { items: [], unmatched: 0 }

  const results: Array<PlaylistItem | null> = new Array(tracks.length).fill(null)
  const workerCount = Math.min(4, tracks.length)
  let cursor = 0

  const worker = async () => {
    while (cursor < tracks.length) {
      const index = cursor
      cursor += 1
      const track = tracks[index]
      const query = `${track.name} ${track.artist} official audio`
      const yt = await searchYouTubeTrack(query)
      if (!yt) continue

      results[index] = {
        videoId: yt.videoId,
        title: track.name,
        thumbnail: `https://i.ytimg.com/vi/${yt.videoId}/hqdefault.jpg`,
        author: track.artist,
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  const items = results.filter((item): item is PlaylistItem => item !== null)
  return { items, unmatched: tracks.length - items.length }
}

export async function POST(request: NextRequest) {
  try {
    const { playlistId } = (await request.json()) as { playlistId?: string }
    if (!playlistId || !/^[A-Za-z0-9]+$/.test(playlistId)) {
      return NextResponse.json({ error: 'Invalid Spotify playlist ID' }, { status: 400 })
    }

    const [name, spotifyTracks] = await Promise.all([
      fetchSpotifyPlaylistName(playlistId),
      fetchSpotifyPlaylistTracks(playlistId),
    ])

    if (spotifyTracks.length === 0) {
      return NextResponse.json(
        { error: 'No playable tracks found. The playlist may be private or unavailable.' },
        { status: 404 }
      )
    }

    const { items, unmatched } = await resolveSpotifyTracksToYouTube(spotifyTracks)
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Could not match Spotify tracks to YouTube videos.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ title: name, items, unmatched })
  } catch (e) {
    if (e instanceof RouteError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: 'Failed to fetch Spotify playlist' }, { status: 500 })
  }
}
