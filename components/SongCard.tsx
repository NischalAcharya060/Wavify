'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Song, Playlist } from '@/lib/types'
import { usePlayer } from '@/lib/PlayerContext'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { useContextMenu } from '@/lib/useContextMenu'
import toast from 'react-hot-toast'
import { Play, Pause, Heart, MoreHorizontal, Plus, Trash2, Music2, ListMusic } from 'lucide-react'

interface SongCardProps {
  song: Song
  queue?: Song[]
  isLiked?: boolean
  onLikeToggle?: () => void
  onDelete?: () => void
  showDelete?: boolean
  index?: number
  playlists?: Playlist[]
  view?: 'list' | 'grid'
}

function EqBars() {
  return (
    <div className="flex items-end gap-0.5" style={{ height: 16 }}>
      <span className="eq-bar" /><span className="eq-bar" />
      <span className="eq-bar" /><span className="eq-bar" />
    </div>
  )
}

export default function SongCard({
  song, queue, isLiked = false, onLikeToggle,
  onDelete, showDelete, index, playlists = [], view = 'list'
}: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer()
  const { user } = useAuth()
  const [liked, setLiked] = useState(isLiked)
  const [showMenu, setShowMenu] = useState(false)
  const [showPLPicker, setShowPLPicker] = useState(false)
  const { menu: ctxMenu, open: openCtx, close: closeCtx } = useContextMenu()
  const supabase = createClient()
  const isActive = currentSong?.id === song.id

  const handlePlay = () => {
    if (isActive) togglePlayPause()
    else playSong(song, queue || [song])
  }

  const handleLike = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!user) return
    if (liked) {
      await supabase.from('liked_songs').delete().eq('user_id', user.id).eq('song_id', song.id)
      toast('Removed from Liked Songs', { icon: '💔' })
    } else {
      await supabase.from('liked_songs').insert({ user_id: user.id, song_id: song.id })
      toast.success('Added to Liked Songs')
    }
    setLiked(l => !l)
    onLikeToggle?.()
  }

  const addToPlaylist = async (plId: string, plName: string) => {
    await supabase.from('playlist_songs').upsert({ playlist_id: plId, song_id: song.id })
    toast.success(`Added to ${plName}`)
    setShowMenu(false)
    setShowPLPicker(false)
    closeCtx()
  }

  const handleDelete = () => {
    onDelete?.()
    closeCtx()
    toast.success('Song deleted')
  }

  if (view === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="group relative rounded-xl overflow-hidden cursor-pointer"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        onClick={handlePlay}
        onContextMenu={openCtx}
      >
        <div className="aspect-square relative overflow-hidden">
          {song.thumbnail
            ? <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-overlay)' }}>
                <Music2 size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
          }
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'var(--accent)' }}>
              {isActive && isPlaying ? <Pause size={20} fill="white" color="white" /> : <Play size={20} fill="white" color="white" />}
            </motion.div>
          </div>
          {isActive && isPlaying && (
            <div className="absolute top-2 right-2 p-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <EqBars />
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold truncate" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>YouTube Music</p>
        </div>
        {ctxMenu.visible && <ContextMenuPortal song={song} playlists={playlists} liked={liked} showDelete={showDelete} onLike={() => handleLike()} onAdd={addToPlaylist} onDelete={handleDelete} x={ctxMenu.x} y={ctxMenu.y} />}
      </motion.div>
    )
  }

  // List view
  return (
    <>
      <motion.div
        layout
        className={`song-row group ${isActive ? 'active' : ''}`}
        onClick={handlePlay}
        onContextMenu={openCtx}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.1 }}
      >
        {/* Index / eq */}
        <div className="w-6 flex items-center justify-center shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
          {isActive && isPlaying
            ? <EqBars />
            : <span className="group-hover:hidden">{index !== undefined ? index + 1 : ''}</span>
          }
          {(!isActive || !isPlaying) && (
            <Play size={13} fill="currentColor" className="hidden group-hover:block" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }} />
          )}
        </div>

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-md">
          {song.thumbnail
            ? <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-overlay)' }}>
                <Music2 size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
            {song.title}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>YouTube Music</p>
        </div>

        {/* Actions */}
        <div className="song-actions flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleLike()}
            className="btn-icon w-7 h-7"
            style={{ color: liked ? 'var(--danger)' : 'var(--text-muted)' }}>
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </motion.button>

          <div className="relative">
            <button onClick={() => { setShowMenu(v => !v); setShowPLPicker(false) }}
              className="btn-icon w-7 h-7">
              <MoreHorizontal size={14} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 bottom-full mb-1 z-40 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', minWidth: 180 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {showPLPicker
                      ? <>
                          <div className="px-3 pt-2.5 pb-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>ADD TO PLAYLIST</div>
                          {playlists.length === 0
                            ? <div className="px-3 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>No playlists yet</div>
                            : playlists.map(pl => (
                                <button key={pl.id} onClick={() => addToPlaylist(pl.id, pl.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 text-left"
                                  style={{ color: 'var(--text-primary)' }}>
                                  <ListMusic size={13} /> {pl.name}
                                </button>
                              ))
                          }
                        </>
                      : <>
                          <button onClick={() => setShowPLPicker(true)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 text-left"
                            style={{ color: 'var(--text-primary)' }}>
                            <Plus size={14} /> Add to Playlist
                          </button>
                          <button onClick={() => handleLike()}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 text-left"
                            style={{ color: liked ? 'var(--danger)' : 'var(--text-primary)' }}>
                            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                            {liked ? 'Unlike' : 'Like'}
                          </button>
                          {showDelete && onDelete && (
                            <>
                              <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }} />
                              <button onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-red-500/10 text-left"
                                style={{ color: 'var(--danger)' }}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </>
                          )}
                        </>
                    }
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Right-click context menu */}
      {ctxMenu.visible && (
        <ContextMenuPortal song={song} playlists={playlists} liked={liked} showDelete={showDelete}
          onLike={() => handleLike()} onAdd={addToPlaylist} onDelete={handleDelete}
          x={ctxMenu.x} y={ctxMenu.y} />
      )}
    </>
  )
}

function ContextMenuPortal({ song, playlists, liked, showDelete, onLike, onAdd, onDelete, x, y }: any) {
  const [showPL, setShowPL] = useState(false)
  return (
    <div className="ctx-menu" style={{ left: x, top: y, position: 'fixed', zIndex: 9999 }} onClick={e => e.stopPropagation()}>
      <button onClick={onLike} style={{ color: liked ? 'var(--danger)' : 'var(--text-secondary)' }}>
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Unlike' : 'Like'}
      </button>
      <button onClick={() => setShowPL(v => !v)}>
        <Plus size={14} /> Add to playlist
      </button>
      {showPL && playlists.map((pl: Playlist) => (
        <button key={pl.id} onClick={() => onAdd(pl.id, pl.name)} style={{ paddingLeft: 28 }}>
          <ListMusic size={13} /> {pl.name}
        </button>
      ))}
      {showDelete && (
        <>
          <div className="divider" />
          <button className="danger" onClick={onDelete}>
            <Trash2 size={14} /> Delete song
          </button>
        </>
      )}
    </div>
  )
}
