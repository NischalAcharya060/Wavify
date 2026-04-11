export interface Song {
  id: string
  title: string
  youtube_url: string
  video_id: string
  thumbnail: string | null
  user_id: string
  created_at: string
}

export interface Playlist {
  id: string
  name: string
  user_id: string
  created_at: string
  song_count?: number
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  added_at: string
  songs?: Song
}

export interface LikedSong {
  id: string
  user_id: string
  song_id: string
  liked_at: string
  songs?: Song
}

export interface RecentlyPlayed {
  id: string
  user_id: string
  song_id: string
  played_at: string
  songs?: Song
}

export interface User {
  id: string
  email?: string
  avatar_url?: string
}

export type NewSong = Omit<Song, 'id' | 'created_at'>
export type NewPlaylist = Omit<Playlist, 'id' | 'created_at'>

export interface SongAnalysis {
  songId: string
  mood: string
  energy: number
  genres: string[]
  vibe: string
}

export interface AIRecommendation {
  title: string
  artist: string
  searchQuery: string
  reason: string
}

export interface GeneratedPlaylist {
  playlistName: string
  description: string
  existingSongs: Array<{ songId: string; title: string }>
  newSuggestions: Array<{ title: string; artist: string; searchQuery: string }>
}