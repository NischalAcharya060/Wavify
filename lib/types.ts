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
}
