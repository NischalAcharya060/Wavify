'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Song, Playlist } from '@/lib/types'
import SongCard from '@/components/SongCard'
import PlaylistCard from '@/components/PlaylistCard'
import AddSongModal from '@/components/AddSongModal'
import { usePlayer } from '@/lib/PlayerContext'
import { Plus, Music2, Disc3, Clock, Heart, Play, LayoutGrid, List, SortAsc, SortDesc } from 'lucide-react'

type SortKey = 'created_at' | 'title'
type SortDir = 'asc' | 'desc'
type ViewMode = 'list' | 'grid'

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="skeleton w-6 h-4 rounded" />
      <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3.5 rounded w-2/3" />
        <div className="skeleton h-3 rounded w-1/3" />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const { playSong } = usePlayer()
  const [songs, setSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const supabase = createClient()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchSongs(), fetchRecent(), fetchPlaylists(), fetchLiked()])
    setLoading(false)
  }

  const fetchSongs = async () => {
    const { data } = await supabase.from('songs').select('*')
      .eq('user_id', user!.id)
      .order(sortKey, { ascending: sortDir === 'asc' })
    setSongs(data || [])
  }

  const fetchRecent = async () => {
    const { data } = await supabase.from('recently_played')
      .select('*, songs(*)').eq('user_id', user!.id)
      .order('played_at', { ascending: false }).limit(8)
    const seen = new Set<string>()
    const unique: Song[] = []
    ;(data || []).forEach((r: any) => {
      if (r.songs && !seen.has(r.songs.id)) { seen.add(r.songs.id); unique.push(r.songs) }
    })
    setRecentSongs(unique)
  }

  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(6)
    setPlaylists(data || [])
  }

  const fetchLiked = async () => {
    const { data } = await supabase.from('liked_songs').select('song_id').eq('user_id', user!.id)
    setLikedIds(new Set((data || []).map((l: any) => l.song_id)))
  }

  const sortedSongs = [...songs].sort((a, b) => {
    const v = sortKey === 'title'
      ? a.title.localeCompare(b.title)
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortDir === 'asc' ? v : -v
  })

  const deleteSong = async (id: string) => {
    await supabase.from('songs').delete().eq('id', id)
    fetchAll()
  }

  return (
    <div className="p-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">{greeting()}</h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            {user?.email?.split('@')[0]} · {songs.length} songs in library
          </p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={15} /> Add Song
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Music2}  label="Songs"    value={songs.length}        color="#7c6af7" delay={0.05} />
        <StatCard icon={Disc3}   label="Playlists" value={playlists.length}   color="#22c55e" delay={0.1}  />
        <StatCard icon={Heart}   label="Liked"     value={likedIds.size}      color="#f43f5e" delay={0.15} />
        <StatCard icon={Clock}   label="Recent"    value={recentSongs.length} color="#f59e0b" delay={0.2}  />
      </div>

      {/* Playlists */}
      {playlists.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Your Playlists</h2>
            <a href="/library" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>See all →</a>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {playlists.map((pl, i) => (
              <motion.div key={pl.id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i*0.06 }}>
                <PlaylistCard playlist={pl} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recently played */}
      {recentSongs.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Recently Played</h2>
            {recentSongs.length > 0 && (
              <button onClick={() => playSong(recentSongs[0], recentSongs)}
                className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs">
                <Play size={12} fill="currentColor" /> Play all
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {recentSongs.slice(0, 5).map((song, i) => (
              <SongCard key={song.id} song={song} queue={recentSongs}
                isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked}
                playlists={playlists} index={i} view="list" />
            ))}
          </div>
        </section>
      )}

      {/* Songs library */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-lg font-bold">All Songs</h2>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {(['created_at','title'] as SortKey[]).map(k => (
                <button key={k} onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else setSortKey(k) }}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ color: sortKey === k ? 'var(--accent)' : 'var(--text-muted)', background: sortKey === k ? 'rgba(124,106,247,0.12)' : 'transparent' }}>
                  {k === 'created_at' ? 'Date' : 'A–Z'}
                  {sortKey === k && (sortDir === 'asc' ? <SortAsc size={10} className="inline ml-1" /> : <SortDesc size={10} className="inline ml-1" />)}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex items-center rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-2 transition-colors"
                  style={{ color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)', background: viewMode === mode ? 'rgba(124,106,247,0.12)' : 'transparent' }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : sortedSongs.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex flex-col items-center justify-center py-16 rounded-2xl"
            style={{ border: '2px dashed var(--border)' }}>
            <Music2 size={40} style={{ color: 'var(--text-muted)' }} className="mb-3" />
            <p className="font-semibold mb-1">No songs yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Add your first YouTube song to get started</p>
            <button onClick={() => setShowAddModal(true)}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <Plus size={15} /> Add Song
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedSongs.map((song, i) => (
              <motion.div key={song.id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.03 }}>
                <SongCard song={song} queue={sortedSongs}
                  isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked}
                  showDelete onDelete={() => deleteSong(song.id)}
                  playlists={playlists} index={i} view="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {sortedSongs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={sortedSongs}
                isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked}
                showDelete onDelete={() => deleteSong(song.id)}
                playlists={playlists} index={i} view="list" />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {showAddModal && (
          <AddSongModal onClose={() => setShowAddModal(false)} onAdded={fetchAll} />
        )}
      </AnimatePresence>
    </div>
  )
}
