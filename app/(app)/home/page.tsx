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
import { Plus, Music2, Disc3, Clock, Heart, Play, LayoutGrid, List, SortAsc, SortDesc, Sparkles } from 'lucide-react'

type SortKey = 'created_at' | 'title'
type SortDir = 'asc' | 'desc'
type ViewMode = 'list' | 'grid'

function SkelRow() {
  return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 8 }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
          <div className="skeleton" style={{ height: 10, width: '20%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
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
    { icon: Music2,  label: 'Tracks',    value: songs.length,        color: '#a78bfa' },
    { icon: Disc3,   label: 'Playlists', value: playlists.length,   color: '#34d399' },
    { icon: Heart,   label: 'Favorites', value: likedIds.size,       color: '#fb7185' },
    { icon: Clock,   label: 'Recents',   value: recentSongs.length,  color: '#fbbf24' },
  ]

  return (
      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        
        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .section-title {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 28px;
          font-weight: 400;
          color: #f5f0ff;
        }

        .control-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          display: flex;
          overflow: hidden;
        }

        .control-btn {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          background: transparent;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', marginBottom: 8 }}>
              <Sparkles size={14} />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome back</span>
            </div>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 48, fontWeight: 400, color: '#fff', lineHeight: 1 }}>
              {greeting()}, {user?.email?.split('@')[0]}
            </h1>
          </div>
          <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: 'white', border: 'none', padding: '12px 20px',
                borderRadius: 14, fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 15px rgba(109, 40, 217, 0.3)'
              }}>
            <Plus size={18} /> Add Song
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {statItems.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 12, color: 'rgba(160,145,200,0.5)', marginTop: 4, fontWeight: 500 }}>{label}</p>
                </div>
              </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
          {/* Left Column: Main Library */}
          <main>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="section-title">Your Collection</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="control-pill">
                  {(['created_at', 'title'] as SortKey[]).map(k => (
                      <button key={k}
                              onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc') } }}
                              className="control-btn"
                              style={{
                                color: sortKey === k ? '#c4a7ff' : 'rgba(255,255,255,0.4)',
                                background: sortKey === k ? 'rgba(167,139,250,0.1)' : 'transparent'
                              }}>
                        {k === 'created_at' ? 'Recent' : 'A–Z'}
                        {sortKey === k && (sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                      </button>
                  ))}
                </div>
                <div className="control-pill">
                  {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                      <button key={mode} onClick={() => setViewMode(mode)}
                              className="control-btn"
                              style={{
                                padding: '8px 12px',
                                color: viewMode === mode ? '#c4a7ff' : 'rgba(255,255,255,0.4)',
                                background: viewMode === mode ? 'rgba(167,139,250,0.1)' : 'transparent'
                              }}>
                        <Icon size={16} />
                      </button>
                  ))}
                </div>
              </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[...Array(6)].map((_, i) => <SkelRow key={i} />)}
                </div>
            ) : songs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Music2 size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Your library is currently empty.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                  {sortedSongs.map((song, i) => (
                      <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} view="grid" />
                  ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sortedSongs.map((song, i) => (
                      <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} />
                  ))}
                </div>
            )}
          </main>

          {/* Right Column: Playlists & Recents */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {playlists.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 className="section-title" style={{ fontSize: 24 }}>Playlists</h2>
                    <a href="/library" style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>All</a>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {playlists.slice(0, 4).map((pl) => (
                        <PlaylistCard key={pl.id} playlist={pl} />
                    ))}
                  </div>
                </section>
            )}

            {recentSongs.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 className="section-title" style={{ fontSize: 24 }}>Recently Played</h2>
                    <button
                        onClick={() => playSong(recentSongs[0], recentSongs)}
                        style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Play All
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {recentSongs.slice(0, 5).map((song, i) => (
                        <SongCard key={song.id} song={song} queue={recentSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} playlists={playlists} index={i} />
                    ))}
                  </div>
                </section>
            )}
          </aside>
        </div>

        <AnimatePresence>
          {showAddModal && <AddSongModal onClose={() => setShowAddModal(false)} onAdded={fetchAll} />}
        </AnimatePresence>
      </div>
  )
}