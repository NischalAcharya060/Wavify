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
import { Plus, Music2, Disc3, Clock, Heart, LayoutGrid, List, SortAsc, SortDesc, Sparkles } from 'lucide-react'

type SortKey = 'created_at' | 'title'
type SortDir = 'asc' | 'desc'
type ViewMode = 'list' | 'grid'

function SkelRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 4 }}>
      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div className="skeleton" style={{ height: 12, width: '55%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 10, width: '25%', borderRadius: 4 }} />
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
  const [playlistCounts, setPlaylistCounts] = useState<Record<string, number>>({})
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const supabase = createClient()

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'there'

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
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    setSongs(data || [])
  }

  const fetchRecent = async () => {
    const { data } = await supabase.from('recently_played')
      .select('*, songs(*)').eq('user_id', user!.id)
      .order('played_at', { ascending: false }).limit(8)
    const seen = new Set<string>(); const unique: Song[] = []
    ;(data || []).forEach((r: any) => {
      if (r.songs && !seen.has(r.songs.id)) { seen.add(r.songs.id); unique.push(r.songs) }
    })
    setRecentSongs(unique)
  }

  const fetchPlaylists = async () => {
    const { data: pls } = await supabase.from('playlists').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(8)
    setPlaylists(pls || [])

    // Fetch song counts for each playlist
    if (pls && pls.length > 0) {
      const { data: counts } = await supabase
        .from('playlist_songs')
        .select('playlist_id')
        .in('playlist_id', pls.map(p => p.id))

      const countMap: Record<string, number> = {}
      pls.forEach(p => { countMap[p.id] = 0 })
      ;(counts || []).forEach((row: any) => {
        countMap[row.playlist_id] = (countMap[row.playlist_id] || 0) + 1
      })
      setPlaylistCounts(countMap)
    }
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

  const statItems = [
    { icon: Music2, label: 'Tracks',    value: songs.length,       color: '#a78bfa' },
    { icon: Disc3,  label: 'Playlists', value: playlists.length,   color: '#34d399' },
    { icon: Heart,  label: 'Favorites', value: likedIds.size,      color: '#fb7185' },
    { icon: Clock,  label: 'Recents',   value: recentSongs.length, color: '#fbbf24' },
  ]

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Geist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

        .stat-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 16px;
          border-radius: 18px;
          display: flex; align-items: center; gap: 14px;
          cursor: default;
          transition: all 0.22s ease;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .section-title {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 26px;
          font-weight: 400;
          color: #f0ecff;
          line-height: 1;
        }

        .control-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          display: flex; overflow: hidden;
        }
        .control-btn {
          padding: 7px 13px;
          font-size: 12px; font-weight: 500;
          border: none; background: transparent;
          cursor: pointer; color: rgba(255,255,255,0.4);
          display: flex; align-items: center; gap: 5px;
          transition: all 0.15s; font-family: 'Geist', sans-serif;
        }
        .control-btn:hover { color: rgba(255,255,255,0.75); }

        .main-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 36px;
        }

        .empty-state {
          text-align: center; padding: 60px 20px;
          background: rgba(255,255,255,0.018);
          border-radius: 20px;
          border: 1px dashed rgba(255,255,255,0.08);
        }

        @media (max-width: 1024px) {
          .main-layout { grid-template-columns: 1fr !important; gap: 40px; }
        }
        @media (max-width: 640px) {
          .home-wrap { padding: 20px 14px !important; }
          .home-header { flex-direction: column; align-items: flex-start !important; }
          .home-greeting { font-size: 36px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .section-header { flex-direction: column; align-items: flex-start !important; gap: 10px; }
          .controls-row { width: 100%; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="home-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <Sparkles size={13} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#a78bfa' }}>
              Personal Collection
            </span>
          </div>
          <h1 className="home-greeting" style={{
            fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
            fontSize: 46, fontWeight: 400, color: '#fff', lineHeight: 1,
          }}>
            {greeting()}, {displayName}
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: 'white', border: 'none', padding: '11px 20px',
            borderRadius: 14, fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 4px 18px rgba(109,40,217,0.35)',
            fontFamily: 'Geist, sans-serif',
          }}>
          <Plus size={16} /> Add Song
        </motion.button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 44 }}>
        {statItems.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="stat-card">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={19} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1, fontFamily: 'Geist, sans-serif' }}>{value}</p>
              <p style={{ fontSize: 11, color: 'rgba(160,145,200,0.55)', marginTop: 4, fontWeight: 500, letterSpacing: '0.02em' }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main two-column grid ── */}
      <div className="main-layout">

        {/* Left: All Songs */}
        <main>
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 className="section-title">Your Collection</h2>
            <div className="controls-row" style={{ display: 'flex', gap: 8 }}>
              {/* Sort */}
              <div className="control-pill">
                {(['created_at', 'title'] as SortKey[]).map(k => (
                  <button key={k}
                    onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc') } }}
                    className="control-btn"
                    style={{ color: sortKey === k ? '#c4a7ff' : 'rgba(255,255,255,0.4)', background: sortKey === k ? 'rgba(167,139,250,0.1)' : 'transparent' }}>
                    {k === 'created_at' ? 'Recent' : 'A–Z'}
                    {sortKey === k && (sortDir === 'asc' ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                  </button>
                ))}
              </div>
              {/* View */}
              <div className="control-pill">
                {([['list', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className="control-btn"
                    style={{ padding: '7px 11px', color: viewMode === mode ? '#c4a7ff' : 'rgba(255,255,255,0.4)', background: viewMode === mode ? 'rgba(167,139,250,0.1)' : 'transparent' }}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div>{[...Array(6)].map((_, i) => <SkelRow key={i} />)}</div>
          ) : sortedSongs.length === 0 ? (
            <div className="empty-state">
              <Music2 size={38} style={{ color: 'rgba(167,139,250,0.2)', marginBottom: 14 }} strokeWidth={1.5} />
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Your library is empty</p>
              <p style={{ color: 'rgba(160,145,200,0.35)', fontSize: 13 }}>Add a YouTube song to get started</p>
              <button onClick={() => setShowAddModal(true)}
                style={{ marginTop: 20, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'Geist, sans-serif' }}>
                <Plus size={15} /> Add your first song
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 14 }}>
              {sortedSongs.map((song, i) => (
                <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} view="grid" />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sortedSongs.map((song, i) => (
                <SongCard key={song.id} song={song} queue={sortedSongs} isLiked={likedIds.has(song.id)} onLikeToggle={fetchLiked} showDelete onDelete={() => deleteSong(song.id)} playlists={playlists} index={i} />
              ))}
            </div>
          )}
        </main>

        {/* Right: Playlists + Recent */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 36, minWidth: 0 }}>
          {playlists.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="section-title" style={{ fontSize: 22 }}>Playlists</h2>
                <a href="/library" style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.01em' }}>See all →</a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {playlists.slice(0, 4).map(pl => (
                  <PlaylistCard key={pl.id} playlist={pl} songCount={playlistCounts[pl.id] ?? 0} />
                ))}
              </div>
            </section>
          )}

          {recentSongs.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 className="section-title" style={{ fontSize: 22 }}>Recently Played</h2>
                <button onClick={() => playSong(recentSongs[0], recentSongs)}
                  style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em', fontFamily: 'Geist, sans-serif' }}>
                  Play All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
