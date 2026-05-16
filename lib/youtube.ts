// Simple in-memory cache for YouTube metadata
const metadataCache = new Map<string, { data: { title: string; author: string }; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:v=|v\/|vi\/|embed\/|shorts\/|e\/|watch\?v=|\/v\/|logout\?continue=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D)([^"&?\/\s]{11})/,
    /(?:music\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function extractYouTubePlaylistId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export async function fetchYouTubeMetadata(videoId: string): Promise<{ title: string; author: string }> {
  // Check cache first
  const cached = metadataCache.get(videoId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const url = encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
    const res = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);

    if (!res.ok) throw new Error('Failed');

    const data = await res.json();
    const result = {
      title: data.title || 'Unknown Title',
      author: data.author_name || 'Unknown Artist'
    };

    // Cache the result
    metadataCache.set(videoId, { data: result, timestamp: Date.now() });

    return result;
  } catch {
    return { title: 'Unknown Title', author: 'Unknown Artist' };
  }
}

export async function fetchYouTubeTitle(videoId: string): Promise<string> {
  const metadata = await fetchYouTubeMetadata(videoId);
  return metadata.title;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseYouTubeDuration(duration: string): number {
  if (!duration) return 0;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getVideoIdFromPlaylistUrl(url: string): string | null {
  const patterns = [
    /[?&]v=([^"&?\/\s]{11})/,
    /(?:embed\/|v\/|shorts\/|watch\?v=)([^"&?\/\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}