'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Playlist } from '@/lib/types'
import { ListMusic, MoreHorizontal, Trash2, Play } from 'lucide-react'
import { useState } from 'react'

const gradients = [
  ['#7c6af7','#a78bfa'], ['#22c55e','#4ade80'], ['#f43f5e','#fb7185'],
  ['#f59e0b','#fcd34d'], ['#0ea5e9','#38bdf8'], ['#8b5cf6','#c084fc'],
]

export default function PlaylistCard({ playlist, songCount = 0, thumbnail, onDelete }: {
  playlist: Playlist; songCount?: number; thumbnail?: string; onDelete?: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [hovered, setHovered] = useState(false)
  const colorSet = gradients[playlist.name.charCodeAt(0) % gradients.length]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer' }}
    >
      <Link href={`/playlist/${playlist.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Cover */}
        <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
          {thumbnail ? (
            <img src={thumbnail} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${colorSet[0]},${colorSet[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)', top: -20, right: -20 }} />
              <div style={{ position: 'absolute', width: 50, height: 50, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.1)', bottom: -15, left: -15 }} />
              <ListMusic size={28} color="rgba(255,255,255,0.8)" />
            </div>
          )}
          {/* Play overlay */}
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                <Play size={16} fill="black" color="black" style={{ marginLeft: 2 }} />
              </div>
            </motion.div>
          )}
        </div>
        <div style={{ padding: '9px 10px 10px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playlist.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{songCount} {songCount === 1 ? 'song' : 'songs'}</p>
        </div>
      </Link>

      {/* More button */}
      {onDelete && hovered && (
        <div style={{ position: 'absolute', top: 6, right: 6 }} onClick={e => e.preventDefault()}>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setShowMenu(v => !v) }}
            style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <MoreHorizontal size={13} />
          </button>
          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowMenu(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.12 }}
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 40, background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', borderRadius: 10, padding: 5, minWidth: 130, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <button onClick={() => { onDelete(); setShowMenu(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <Trash2 size={13} /> Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
