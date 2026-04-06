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

export function getYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export async function fetchYouTubeMetadata(videoId: string): Promise<{ title: string; author: string }> {
  try {
    const url = encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
    const res = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);

    if (!res.ok) throw new Error('Failed');

    const data = await res.json();
    return {
      title: data.title || 'Unknown Title',
      author: data.author_name || 'Unknown Artist'
    };
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

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}