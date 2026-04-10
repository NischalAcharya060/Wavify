'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '@/lib/PlayerContext'
import { X, Music2, Trash2, ListMusic } from 'lucide-react'

interface QueuePanelProps {
  open: boolean
  onClose: () => void
}

export default function QueuePanel({ open, onClose }: QueuePanelProps) {
  const { queue, currentSong, playSong, isPlaying } = usePlayer()

  const currentIdx = queue.findIndex(s => s.id === currentSong?.id)
  const upNext = queue.slice(currentIdx + 1)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 360, maxWidth: '90vw',
              background: 'rgba(12,12,20,0.98)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              zIndex: 999, display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ListMusic size={18} color="#a78bfa" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Queue</h3>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: 'rgba(167,139,250,0.7)',
                  background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 6,
                }}>
                  {queue.length}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close queue"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10,
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Now Playing */}
            {currentSong && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#a78bfa', marginBottom: 10 }}>
                  Now Playing
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    {currentSong.thumbnail ? (
                      <img src={currentSong.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Music2 size={18} color="#a78bfa" />
                      </div>
                    )}
                    {isPlaying && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} className="eq-bar" style={{ width: 2, height: 4 + Math.random() * 8 }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentSong.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>YouTube Music</p>
                  </div>
                </div>
              </div>
            )}

            {/* Up Next */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
              {upNext.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.25)' }}>
                  <ListMusic size={32} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <p style={{ fontSize: 13, fontWeight: 500 }}>No upcoming tracks</p>
                  <p style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>Play a song to fill the queue</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.25)', padding: '4px 8px', marginBottom: 4 }}>
                    Up Next · {upNext.length} tracks
                  </p>
                  {upNext.map((song, i) => (
                    <button
                      key={song.id}
                      onClick={() => playSong(song, queue)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '8px', borderRadius: 10,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ width: 22, fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {song.thumbnail ? (
                          <img src={song.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Music2 size={14} color="rgba(255,255,255,0.2)" />
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        {song.title}
                      </p>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
