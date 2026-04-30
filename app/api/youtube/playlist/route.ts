import { NextRequest, NextResponse } from 'next/server'

interface PlaylistItem {
  videoId: string
  title: string
  thumbnail: string
  author?: string
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\u0026/g, '&')
    .replace(/\\"/g, '"')
}

function parsePlaylistFromHtml(html: string): { title: string; items: PlaylistItem[] } {
  const items: PlaylistItem[] = []
  const seen = new Set<string>()

  const match = html.match(/var ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)
  let playlistTitle = 'YouTube Playlist'

  if (match) {
    try {
      const data = JSON.parse(match[1])
      const titleNode =
        data?.metadata?.playlistMetadataRenderer?.title ||
        data?.header?.playlistHeaderRenderer?.title?.simpleText
      if (typeof titleNode === 'string') playlistTitle = titleNode

      const contents =
        data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
          ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]
          ?.playlistVideoListRenderer?.contents

      if (Array.isArray(contents)) {
        for (const c of contents) {
          const v = c?.playlistVideoRenderer
          if (!v?.videoId) continue
          const videoId = v.videoId
          if (seen.has(videoId)) continue
          seen.add(videoId)
          const title =
            v.title?.runs?.[0]?.text ||
            v.title?.simpleText ||
            'Unknown Title'
          const author = v.shortBylineText?.runs?.[0]?.text
          items.push({
            videoId,
            title,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            author,
          })
        }
      }
    } catch {
      // fall through to regex fallback
    }
  }

  if (items.length === 0) {
    const regex = /"playlistVideoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"[^}]*?"title":\{(?:"runs":\[\{"text":"([^"]+)"\}\]|"simpleText":"([^"]+)")/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(html)) !== null) {
      const videoId = m[1]
      if (seen.has(videoId)) continue
      seen.add(videoId)
      const title = decodeHtml(m[2] || m[3] || 'Unknown Title')
      items.push({
        videoId,
        title,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      })
    }
  }

  return { title: playlistTitle, items }
}

export async function POST(request: NextRequest) {
  try {
    const { playlistId } = (await request.json()) as { playlistId?: string }
    if (!playlistId || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
      return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 })
    }

    const url = `https://www.youtube.com/playlist?list=${playlistId}&hl=en`
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not load playlist' }, { status: 502 })
    }

    const html = await res.text()
    const { title, items } = parsePlaylistFromHtml(html)

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No videos found. The playlist may be private or unavailable.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ title, items })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 })
  }
}
