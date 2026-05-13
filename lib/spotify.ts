export function extractSpotifyPlaylistId(url: string): string | null {
  if (!url) return null

  const trimmed = url.trim()
  const uriMatch = trimmed.match(/^spotify:playlist:([A-Za-z0-9]+)$/)
  if (uriMatch?.[1]) return uriMatch[1]

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname === 'open.spotify.com' || parsed.hostname === 'play.spotify.com') {
      const parts = parsed.pathname.split('/').filter(Boolean)
      const playlistIndex = parts.findIndex(part => part === 'playlist')
      const playlistId = playlistIndex >= 0 ? parts[playlistIndex + 1] : null
      if (playlistId) return playlistId
    }
  } catch {
    // Ignore URL parsing errors and continue with regex fallback.
  }

  const webMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?playlist\/([A-Za-z0-9]+)/i)
  return webMatch?.[1] ?? null
}
