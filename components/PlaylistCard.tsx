'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Playlist } from '@/lib/types'
import { ListMusic, MoreHorizontal, Trash2, Play } from 'lucide-react'
import { useState } from 'react'

const themes = [
  { primary: '#7c3aed', secondary: '#4c1d95', glow: 'rgba(124,58,237,0.3)' },
  { primary: '#10b981', secondary: '#065f46', glow: 'rgba(16,185,129,0.3)' },
  { primary: '#f43f5e', secondary: '#9f1239', glow: 'rgba(244,63,94,0.3)'  },
  { primary: '#f59e0b', secondary: '#92400e', glow: 'rgba(245,158,11,0.3)' },
  { primary: '#0ea5e9', secondary: '#075985', glow: 'rgba(14,165,233,0.3)' },
]

interface PlaylistCardProps {
  playlist: Playlist
  songCount?: number
  thumbnail?: string
  onDelete?: () => void
}

export default function PlaylistCard({ playlist, songCount = 0, thumbnail, onDelete }: PlaylistCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [hovered, setHovered] = useState(false)
  const theme = themes[playlist.name.charCodeAt(0) % themes.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.03)',
        border: hovered ? `1px solid ${theme.primary}35` : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 24px ${theme.glow}` : '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <Link href={`/playlist/${playlist.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Cover Art */}
        <div style={{
          aspectRatio: '1', position: 'relative', margin: 10,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          background: '#0e0e1a',
        }}>
          {thumbnail ? (
            <img src={thumbnail} alt={playlist.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.33,1,0.68,1)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(145deg, ${theme.primary}, ${theme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* decorative ring */}
              <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', top: '-15%', right: '-15%' }} />
              <ListMusic size={30} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
            </div>
          )}

          {/* Play overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,15,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 16px ${theme.glow}` }}
                >
                  <Play size={18} fill="#08080f" color="#08080f" style={{ marginLeft: 2 }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Track count badge on thumbnail */}
          {songCount > 0 && (
            <div style={{
              position: 'absolute', bottom: 7, left: 7,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '3px 8px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
                {songCount} {songCount === 1 ? 'track' : 'tracks'}
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div style={{ padding: '6px 14px 14px' }}>
          <h3 style={{
            fontFamily: 'Instrument Serif, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 17,
            color: '#f0ecff',
            margin: 0, lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {playlist.name}
          </h3>

        </div>
      </Link>

      {/* Options button */}
      {onDelete && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowMenu(v => !v) }}
            style={{
              width: 30, height: 30, borderRadius: 9,
              background: hovered || showMenu ? 'rgba(0,0,0,0.55)' : 'transparent',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              opacity: hovered || showMenu ? 1 : 0,
              transition: 'all 0.2s',
            }}
          >
            <MoreHorizontal size={16} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 30 }}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setShowMenu(false) }} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 6 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                    zIndex: 40,
                    background: 'rgba(16,14,28,0.97)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, padding: 5, minWidth: 155,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  }}
                >
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(); setShowMenu(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      fontSize: 13.5, fontWeight: 600,
                      color: '#fb7185', background: 'transparent',
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'Geist, sans-serif',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,113,133,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Trash2 size={15} /> Delete Playlist
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
