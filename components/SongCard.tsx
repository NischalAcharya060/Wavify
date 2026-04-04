'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Song, Playlist } from '@/lib/types'
import { usePlayer } from '@/lib/PlayerContext'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { useContextMenu } from '@/lib/useContextMenu'
import toast from 'react-hot-toast'
import { Play, Pause, Heart, MoreHorizontal, Plus, Trash2, Music2, ListMusic } from 'lucide-react'

interface SongCardProps {
  song: Song; queue?: Song[]; isLiked?: boolean; onLikeToggle?: () => void
  onDelete?: () => void; showDelete?: boolean; index?: number
  playlists?: Playlist[]; view?: 'list' | 'grid'
}

function EqBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
      <span className="eq-bar" /><span className="eq-bar" />
      <span className="eq-bar" /><span className="eq-bar" />
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
    if (liked) { await supabase.from('liked_songs').delete().eq('user_id', user.id).eq('song_id', song.id); toast('Removed from Liked Songs', { icon: '💔' }) }
    else { await supabase.from('liked_songs').insert({ user_id: user.id, song_id: song.id }); toast.success('Added to Liked Songs') }
    setLiked(l => !l); onLikeToggle?.()
  }

  const addToPlaylist = async (plId: string, plName: string) => {
    await supabase.from('playlist_songs').upsert({ playlist_id: plId, song_id: song.id })
    toast.success(`Added to ${plName}`); setShowMenu(false); setShowPLPicker(false); closeCtx()
  }

  const handleDelete = () => { onDelete?.(); closeCtx(); toast.success('Song deleted') }

  // GRID VIEW
  if (view === 'grid') {
    return (
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
        onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
        style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg-elevated)', border: isActive ? '1px solid rgba(124,106,247,0.3)' : '1px solid var(--border)', cursor: 'pointer' }}
        onClick={handlePlay} onContextMenu={openCtx}>
        <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
          {song.thumbnail
            ? <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={24} style={{ color: 'var(--text-muted)' }} /></div>
          }
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isActive && isPlaying ? <Pause size={16} fill="white" color="white" /> : <Play size={16} fill="white" color="white" style={{ marginLeft: 2 }} />}
              </div>
            </motion.div>
          )}
          {isActive && isPlaying && !hovered && (
            <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '3px 5px' }}>
              <EqBars />
            </div>
          )}
        </div>
        <div style={{ padding: '8px 10px 10px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>YouTube Music</p>
        </div>
        {ctxMenu.visible && <CtxMenu song={song} playlists={playlists} liked={liked} showDelete={showDelete} onLike={handleLike} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} />}
      </motion.div>
    )
  }

  // LIST VIEW
  return (
    <>
      <div
        className={`song-row ${isActive ? 'active' : ''}`}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onClick={handlePlay} onContextMenu={openCtx}
      >
        {/* Index / eq */}
        <div style={{ width: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && isPlaying ? <EqBars /> : (
            hovered
              ? <Play size={12} fill="currentColor" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }} />
              : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{index !== undefined ? index + 1 : ''}</span>
          )}
        </div>

        {/* Thumb */}
        <div style={{ width: 38, height: 38, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}>
          {song.thumbnail
            ? <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={13} style={{ color: 'var(--text-muted)' }} /></div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>YouTube Music</p>
        </div>

        {/* Actions */}
        <div className="song-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => handleLike()} className="btn-icon" style={{ width: 28, height: 28, color: liked ? 'var(--danger)' : 'var(--text-muted)' }}>
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowMenu(v => !v); setShowPLPicker(false) }} className="btn-icon" style={{ width: 28, height: 28 }}>
              <MoreHorizontal size={14} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowMenu(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -4 }} transition={{ duration: 0.12 }}
                    style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 4px)', zIndex: 40, background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', borderRadius: 10, padding: 5, minWidth: 170, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                    onClick={e => e.stopPropagation()}>
                    {showPLPicker ? (
                      <>
                        <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Add to playlist</div>
                        {playlists.length === 0
                          ? <div style={{ padding: '8px 10px', fontSize: 13, color: 'var(--text-muted)' }}>No playlists yet</div>
                          : playlists.map(pl => (
                            <button key={pl.id} onClick={() => addToPlaylist(pl.id, pl.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13, color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <ListMusic size={12} /> {pl.name}
                            </button>
                          ))
                        }
                      </>
                    ) : (
                      <>
                        <MenuBtn icon={<Plus size={13} />} label="Add to playlist" onClick={() => setShowPLPicker(true)} />
                        <MenuBtn icon={<Heart size={13} fill={liked ? 'currentColor' : 'none'} />} label={liked ? 'Unlike' : 'Like'} onClick={() => handleLike()} danger={liked} />
                        {showDelete && onDelete && (
                          <>
                            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                            <MenuBtn icon={<Trash2 size={13} />} label="Delete" onClick={handleDelete} danger />
                          </>
                        )}
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {ctxMenu.visible && <CtxMenu song={song} playlists={playlists} liked={liked} showDelete={showDelete} onLike={handleLike} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} />}
    </>
  )
}

function MenuBtn({ icon, label, onClick, danger }: any) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13, color: danger ? 'var(--danger)' : 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', textAlign: 'left' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {icon} {label}
    </button>
  )
}

function CtxMenu({ playlists, liked, showDelete, onLike, onAdd, onDelete, x, y }: any) {
  const [showPL, setShowPL] = useState(false)
  return (
    <div className="ctx-menu" style={{ left: x, top: y, position: 'fixed', zIndex: 9999 }} onClick={e => e.stopPropagation()}>
      <button onClick={onLike} style={{ color: liked ? 'var(--danger)' : 'var(--text-secondary)' }}>
        <Heart size={13} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Unlike' : 'Like'}
      </button>
      <button onClick={() => setShowPL(v => !v)}><Plus size={13} /> Add to playlist</button>
      {showPL && playlists.map((pl: Playlist) => (
        <button key={pl.id} onClick={() => onAdd(pl.id, pl.name)} style={{ paddingLeft: 24, fontSize: 12 }}>
          <ListMusic size={11} /> {pl.name}
        </button>
      ))}
      {showDelete && <><div className="divider" /><button className="danger" onClick={onDelete}><Trash2 size={13} /> Delete</button></>}
    </div>
  )
}
