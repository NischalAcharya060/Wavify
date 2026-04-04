'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import { usePlayer } from '@/lib/PlayerContext'
import { Heart, Play, Shuffle } from 'lucide-react'

export default function LikedSongsPage() {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const { playSong } = usePlayer()
  const supabase = createClient()

  useEffect(() => { if (user) fetchAll() }, [user])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: liked }, { data: pls }] = await Promise.all([
      supabase.from('liked_songs').select('*, songs(*)')
        .eq('user_id', user!.id).order('liked_at', { ascending: false }),
      supabase.from('playlists').select('*').eq('user_id', user!.id)
    ])
    setSongs((liked || []).map((l: any) => l.songs).filter(Boolean))
    setPlaylists(pls || [])
    setLoading(false)
  }

  const shufflePlay = () => {
    if (!songs.length) return
    const s = [...songs].sort(() => Math.random() - 0.5)
    playSong(s[0], s)
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#4c1d95 0%,#1e1b4b 50%,var(--bg-base) 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%,rgba(124,106,247,0.25),transparent 60%)' }} />
        <div className="relative px-8 pt-10 pb-8 flex items-end gap-7">
          <motion.div
            initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.4 }}
            className="w-44 h-44 rounded-2xl flex items-center justify-center shadow-2xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', boxShadow: '0 20px 60px rgba(124,106,247,0.4)' }}>
            <Heart size={64} fill="white" color="white" />
          </motion.div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Playlist</p>
            <h1 className="text-5xl font-black mb-2">Liked Songs</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>{songs.length} songs</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {songs.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => playSong(songs[0], songs)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-2))' }}>
              <Play size={22} fill="white" color="white" />
            </motion.button>
            <button onClick={shufflePlay} className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
              <Shuffle size={15} /> Shuffle
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3.5 rounded w-3/5" />
                  <div className="skeleton h-3 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{ color: 'var(--text-muted)' }}>
            <Heart size={48} className="mb-4 opacity-30" />
            <p className="font-semibold text-lg mb-1">No liked songs yet</p>
            <p className="text-sm">Heart a song to save it here</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {songs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={songs}
                isLiked onLikeToggle={fetchAll} playlists={playlists} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
