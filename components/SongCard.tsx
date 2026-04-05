'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Song, Playlist } from '@/lib/types'
import { usePlayer } from '@/lib/PlayerContext'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { useContextMenu } from '@/lib/useContextMenu'
import toast from 'react-hot-toast'
import { Play, Pause, Heart, MoreHorizontal, Plus, Trash2, Music2, ListMusic, ChevronRight } from 'lucide-react'

interface SongCardProps {
  song: Song; queue?: Song[]; isLiked?: boolean; onLikeToggle?: () => void
  onDelete?: () => void; showDelete?: boolean; index?: number
  playlists?: Playlist[]; view?: 'list' | 'grid'
}

function EqBars({ color = '#7c3aed' }: { color?: string }) {
  return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
        {[...Array(4)].map((_, i) => (
            <motion.span
                key={i}
                animate={{ height: [4, 14, 6, 12, 4] }}
                transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
                style={{ width: 2.5, background: color, borderRadius: 10 }}
            />
        ))}
      </div>
  )
}

export default function SongCard({ song, queue, isLiked = false, onLikeToggle, onDelete, showDelete, index, playlists = [], view = 'list' }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer()
  const { user } = useAuth()
  const [liked, setLiked] = useState(isLiked)
  const [showMenu, setShowMenu] = useState(false)
  const [showPLPicker, setShowPLPicker] = useState(false)
  const { menu: ctxMenu, open: openCtx, close: closeCtx } = useContextMenu()
  const supabase = createClient()
  const isActive = currentSong?.id === song.id
  const [hovered, setHovered] = useState(false)

  const handlePlay = () => { if (isActive) togglePlayPause(); else playSong(song, queue || [song]) }

  const handleLike = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!user) return
    const newStatus = !liked
    setLiked(newStatus)
    if (!newStatus) {
      await supabase.from('liked_songs').delete().eq('user_id', user.id).eq('song_id', song.id)
      toast('Removed from Liked Songs', { icon: '💔' })
    } else {
      await supabase.from('liked_songs').insert({ user_id: user.id, song_id: song.id })
      toast.success('Added to Liked Songs')
    }
    onLikeToggle?.()
  }

  const addToPlaylist = async (plId: string, plName: string) => {
    await supabase.from('playlist_songs').upsert({ playlist_id: plId, song_id: song.id })
    toast.success(`Added to ${plName}`)
    setShowMenu(false); setShowPLPicker(false); closeCtx()
  }

  const handleDelete = () => { onDelete?.(); closeCtx(); toast.success('Song deleted') }

  // ---------------------------------------------------------
  // GRID VIEW
  // ---------------------------------------------------------
  if (view === 'grid') {
    return (
        <motion.div
            whileHover={{ y: -6 }}
            onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
            style={{
              borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)',
              border: isActive ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.4)' : 'none'
            }}
            onClick={handlePlay} onContextMenu={openCtx}>
          <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', margin: 10, borderRadius: 14 }}>
            {song.thumbnail
                ? <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)' }} />
                : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={24} color="rgba(255,255,255,0.2)" /></div>
            }
            <AnimatePresence>
              {hovered && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,15,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
                      {isActive && isPlaying ? <Pause size={20} fill="#08080f" color="#08080f" /> : <Play size={20} fill="#08080f" color="#08080f" style={{ marginLeft: 3 }} />}
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>
            {isActive && isPlaying && !hovered && (
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(8,8,15,0.7)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 8px' }}>
                  <EqBars color="#a78bfa" />
                </div>
            )}
          </div>
          <div style={{ padding: '4px 14px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? '#a78bfa' : '#fff' }}>{song.title}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>YouTube Music</p>
          </div>
          {ctxMenu.visible && <CtxMenu playlists={playlists} liked={liked} showDelete={showDelete} onLike={handleLike} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} onClose={closeCtx} />}
        </motion.div>
    )
  }

  // ---------------------------------------------------------
  // LIST VIEW
  // ---------------------------------------------------------
  return (
      <>
        <style>{`
        .song-row {
          display: flex; align-items: center; gap: 16px; padding: 8px 12px;
          border-radius: 12px; cursor: pointer; transition: all 0.2s;
          border: 1px solid transparent; margin-bottom: 4px;
        }
        .song-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.05); }
        .song-row.active { background: rgba(124, 58, 237, 0.08); border-color: rgba(124, 58, 237, 0.2); }
        .song-actions { display: flex; align-items: center; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .song-row:hover .song-actions { opacity: 1; }
      `}</style>

        <div
            className={`song-row ${isActive ? 'active' : ''}`}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            onClick={handlePlay} onContextMenu={openCtx}
        >
          <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isActive && isPlaying ? <EqBars color="#a78bfa" /> : (
                hovered
                    ? <Play size={14} fill="currentColor" style={{ color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.6)' }} />
                    : <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.2)' }}>{index !== undefined ? String(index + 1).padStart(2, '0') : ''}</span>
            )}
          </div>

          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            {song.thumbnail
                ? <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={16} color="rgba(255,255,255,0.2)" /></div>
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? '#a78bfa' : '#fff' }}>{song.title}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>YouTube Music</p>
          </div>

          <div className="song-actions" onClick={e => e.stopPropagation()}>
            <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: liked ? '#fb7185' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s' }}>
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowMenu(v => !v); setShowPLPicker(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'rgba(255,255,255,0.3)' }}>
                <MoreHorizontal size={18} />
              </button>
              <AnimatePresence>
                {showMenu && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowMenu(false)} />
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 8px)', zIndex: 40, background: 'rgba(18,18,26,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 6, minWidth: 190, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        {showPLPicker ? (
                            <div className="p-1">
                              <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.3)' }}>Add to Playlist</div>
                              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {playlists.length === 0
                                    ? <div style={{ padding: '12px', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No playlists found</div>
                                    : playlists.map(pl => (
                                        <button key={pl.id} onClick={() => addToPlaylist(pl.id, pl.name)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                          <ListMusic size={14} color="rgba(255,255,255,0.4)" /> {pl.name}
                                        </button>
                                    ))
                                }
                              </div>
                            </div>
                        ) : (
                            <div className="p-1">
                              <MenuBtn icon={<Plus size={16} />} label="Add to Playlist" onClick={() => setShowPLPicker(true)} />
                              <MenuBtn icon={<Heart size={16} fill={liked ? 'currentColor' : 'none'} />} label={liked ? 'Unlike' : 'Like'} onClick={handleLike} danger={liked} />
                              {showDelete && onDelete && (
                                  <>
                                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />
                                    <MenuBtn icon={<Trash2 size={16} />} label="Delete from Library" onClick={handleDelete} danger />
                                  </>
                              )}
                            </div>
                        )}
                      </motion.div>
                    </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {ctxMenu.visible && <CtxMenu playlists={playlists} liked={liked} showDelete={showDelete} onLike={handleLike} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} onClose={closeCtx} />}
      </>
  )
}

function MenuBtn({ icon, label, onClick, danger }: any) {
  return (
      <button onClick={onClick}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, color: danger && label !== 'Like' ? '#fb7185' : 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.background = danger && label !== 'Like' ? 'rgba(251,113,133,0.1)' : 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <span style={{ color: danger && label !== 'Like' ? '#fb7185' : 'rgba(255,255,255,0.4)' }}>{icon}</span> {label}
      </button>
  )
}

function CtxMenu({ playlists, liked, showDelete, onLike, onAdd, onDelete, x, y, onClose }: any) {
  const [showPL, setShowPL] = useState(false)
  return (
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
        <div style={{ left: x, top: y, position: 'fixed', zIndex: 9999, background: 'rgba(18,18,26,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 6, minWidth: 180, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
          <MenuBtn icon={<Heart size={16} fill={liked ? 'currentColor' : 'none'} />} label={liked ? 'Unlike' : 'Like'} onClick={onLike} danger={liked} />
          <button
              onClick={() => setShowPL(!showPL)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Plus size={16} color="rgba(255,255,255,0.4)" /> Add to Playlist
            </div>
            <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
          </button>

          {showPL && (
              <div style={{ padding: '4px 0 4px 12px', borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: 20, marginTop: 4 }}>
                {playlists.map((pl: Playlist) => (
                    <button key={pl.id} onClick={() => onAdd(pl.id, pl.name)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                      <ListMusic size={13} /> {pl.name}
                    </button>
                ))}
              </div>
          )}

          {showDelete && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />
                <MenuBtn icon={<Trash2 size={16} />} label="Delete" onClick={onDelete} danger />
              </>
          )}
        </div>
      </>
  )
}