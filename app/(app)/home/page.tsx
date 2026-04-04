'use client'

import { useEffect, useState } from 'react'
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

function SkelRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px' }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 13, width: '60%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '35%', borderRadius: 4 }} />
      </div>
    </div>
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
    const { data } = await supabase.from('songs').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
    setSongs(data || [])
  }
  const fetchRecent = async () => {
    const { data } = await supabase.from('recently_played').select('*, songs(*)').eq('user_id', user!.id).order('played_at', { ascending: false }).limit(8)
    const seen = new Set<string>(); const unique: Song[] = []
    ;(data || []).forEach((r: any) => { if (r.songs && !seen.has(r.songs.id)) { seen.add(r.songs.id); unique.push(r.songs) } })
    setRecentSongs(unique)
  }
  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(8)
    setPlaylists(data || [])
  }
  const fetchLiked = async () => {
    const { data } = await supabase.from('liked_songs').select('song_id').eq('user_id', user!.id)
    setLikedIds(new Set((data || []).map((l: any) => l.song_id)))
  }

  const sortedSongs = [...songs].sort((a, b) => {
    const v = sortKey === 'title' ? a.title.localeCompare(b.title) : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortDir === 'asc' ? v : -v
  })

  const deleteSong = async (id: string) => {
    await supabase.from('songs').delete().eq('id', id)
    fetchAll()
  }

  const statItems = [
    { icon: Music2,  label: 'Songs',    value: songs.length,        color: '#7c6af7' },
    { icon: Disc3,   label: 'Playlists', value: playlists.length,   color: '#22c55e' },
    { icon: Heart,   label: 'Liked',    value: likedIds.size,       color: '#f43f5e' },
    { icon: Clock,   label: 'Recent',   value: recentSongs.length,  color: '#f59e0b' },
  ]

  return (
    <div style={{ padding: '24px 24px', maxWidth: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Syne,sans-serif', lineHeight: 1.2 }}>{greeting()}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
            {user?.email?.split('@')[0]} · {songs.length} song{songs.length !== 1 ? 's' : ''} in library
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, fontSize: 13, flexShrink: 0 }}>
          <Plus size={14} /> Add Song
        </motion.button>
      </div>

      {/* Stats - compact row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {statItems.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Playlists */}
      {playlists.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>Your Playlists</h2>
            <a href="/library" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>See all →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {playlists.map((pl, i) => (
              <motion.div key={pl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <PlaylistCard playlist={pl} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>Recently Played</h2>
            <button onClick={() => playSong(recentSongs[0], recentSongs)}
              className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, fontSize: 12 }}>
              <Play size={11} fill="currentColor" /> Play all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentSongs.slice(0, 5).map((song, i) => (
              <SongCard key={song.id} song={song} queue={recentSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} playlists={playlists} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All Songs */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>All Songs</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Sort pills */}
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              {(['created_at', 'title'] as SortKey[]).map(k => (
                <button key={k}
                  onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc') } }}
                  style={{ padding: '5px 11px', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, background: sortKey === k ? 'rgba(124,106,247,0.15)' : 'transparent', color: sortKey === k ? 'var(--accent)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.12s' }}>
                  {k === 'created_at' ? 'Date' : 'A–Z'}
                  {sortKey === k && (sortDir === 'asc' ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  style={{ padding: '5px 9px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === mode ? 'rgba(124,106,247,0.15)' : 'transparent', color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div>{[...Array(5)].map((_, i) => <SkelRow key={i} />)}</div>
        ) : sortedSongs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', border: '2px dashed var(--border)', borderRadius: 16 }}>
            <Music2 size={36} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No songs yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Add a YouTube song to get started</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add Song
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {sortedSongs.map((song, i) => (
              <motion.div key={song.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}>
                <SongCard song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} view="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedSongs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {showAddModal && <AddSongModal onClose={() => setShowAddModal(false)} onAdded={fetchAll} />}
      </AnimatePresence>
    </div>
  )
}
