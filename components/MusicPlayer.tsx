'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '@/lib/PlayerContext'
import { useAuth } from '@/lib/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Music2, Timer } from 'lucide-react'

function EqBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
      <span className="eq-bar" /><span className="eq-bar" />
      <span className="eq-bar" /><span className="eq-bar" />
    </div>
  )
}

function SleepMenu({ onClose }: { onClose: () => void }) {
  const { setSleepTimer, sleepTimer } = usePlayer()
  const opts = [{ l: 'Off', v: null }, { l: '10 min', v: 10 }, { l: '20 min', v: 20 }, { l: '30 min', v: 30 }, { l: '1 hour', v: 60 }]
  return (
    <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }} transition={{ duration: 0.14 }}
      style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', borderRadius: 10, padding: 5, minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100 }}
      onClick={e => e.stopPropagation()}>
      <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Sleep Timer</div>
      {opts.map(({ l, v }) => {
        const active = sleepTimer === v || (v === null && sleepTimer === null)
        return (
          <button key={l} onClick={() => { setSleepTimer(v); onClose() }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', color: active ? 'var(--accent)' : 'var(--text-secondary)', fontFamily: 'DM Sans,sans-serif', transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {l}
            {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />}
          </button>
        )
      })}
    </motion.div>
  )
}

export default function MusicPlayer() {
  const { currentSong, isPlaying, volume, isMuted, togglePlayPause, nextSong, prevSong, setVolume, toggleMute, currentTime, setCurrentTime, duration, setDuration, isShuffled, repeatMode, toggleShuffle, cycleRepeat, sleepTimer, playerRef } = usePlayer()
  const { user } = useAuth()
  const supabase = createClient()
  const [playerReady, setPlayerReady] = useState(false)
  const [showSleep, setShowSleep] = useState(false)
  const ytPlayer = useRef<any>(null)
  const progressInterval = useRef<any>(null)
  const recordedRef = useRef<string | null>(null)
  const prevPlayRef = useRef(false)

  useEffect(() => {
    if ((window as any).YT?.Player) { setPlayerReady(true); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    ;(window as any).onYouTubeIframeAPIReady = () => setPlayerReady(true)
  }, [])

  useEffect(() => {
    if (!currentSong || !playerReady) return
    const init = () => {
      if (ytPlayer.current?.loadVideoById) { ytPlayer.current.loadVideoById(currentSong.video_id); return }
      ytPlayer.current = new (window as any).YT.Player('yt-player', {
        videoId: currentSong.video_id,
        playerVars: { autoplay: 1, controls: 0, playsinline: 1 },
        events: {
          onReady(e: any) {
            playerRef.current = e.target
            e.target.setVolume(isMuted ? 0 : volume)
            if (isPlaying) e.target.playVideo()
          },
          onStateChange(e: any) {
            if (e.data === 0) nextSong()
            if (e.data === 1) {
              setDuration(e.target.getDuration())
              clearInterval(progressInterval.current)
              progressInterval.current = setInterval(() => { if (e.target.getCurrentTime) setCurrentTime(e.target.getCurrentTime()) }, 500)
            }
          }
        }
      })
    }
    if ((window as any).YT?.Player) init()
    else (window as any).onYouTubeIframeAPIReady = () => { setPlayerReady(true); init() }
    if (user && recordedRef.current !== currentSong.id) {
      recordedRef.current = currentSong.id
      supabase.from('recently_played').insert({ user_id: user.id, song_id: currentSong.id })
    }
    return () => clearInterval(progressInterval.current)
  }, [currentSong?.id, playerReady])

  useEffect(() => {
    if (!ytPlayer.current?.playVideo || isPlaying === prevPlayRef.current) return
    prevPlayRef.current = isPlaying
    if (isPlaying) ytPlayer.current.playVideo(); else ytPlayer.current.pauseVideo()
  }, [isPlaying])

  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(isMuted ? 0 : volume)
  }, [volume, isMuted])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); togglePlayPause() }
      if (e.code === 'ArrowRight') { e.preventDefault(); const t = Math.min(currentTime + 10, duration); setCurrentTime(t); ytPlayer.current?.seekTo(t, true) }
      if (e.code === 'ArrowLeft') { e.preventDefault(); const t = Math.max(currentTime - 10, 0); setCurrentTime(t); ytPlayer.current?.seekTo(t, true) }
      if (e.code === 'ArrowUp') { e.preventDefault(); setVolume(Math.min(volume + 10, 100)) }
      if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(Math.max(volume - 10, 0)) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [togglePlayPause, currentTime, duration, volume, setVolume, setCurrentTime])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setCurrentTime(t); ytPlayer.current?.seekTo(t, true)
  }, [])

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <div className="glass-player" style={{ height: 80, flexShrink: 0, position: 'relative' }}>
      <div id="yt-player" style={{ display: 'none', position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 16px', gap: 12 }}>

        {/* Song info — 220px */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 220, flexShrink: 0, minWidth: 0 }}>
          <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            {currentSong?.thumbnail
              ? <img src={currentSong.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={16} style={{ color: 'var(--text-muted)' }} /></div>
            }
            {isPlaying && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EqBars />
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.p key={currentSong?.id} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: currentSong ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {currentSong?.title ?? 'Nothing playing'}
              </motion.p>
            </AnimatePresence>
            {sleepTimer !== null
              ? <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}><Timer size={10} /> Sleep in {sleepTimer}m</p>
              : <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>YouTube Music</p>
            }
          </div>
        </div>

        {/* Center controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleShuffle} className="btn-icon" style={{ width: 30, height: 30, color: isShuffled ? 'var(--accent)' : 'var(--text-muted)' }} title="Shuffle">
              <Shuffle size={14} />
            </button>
            <button onClick={prevSong} className="btn-icon" style={{ width: 30, height: 30, color: 'var(--text-secondary)' }} title="Previous">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <motion.button onClick={togglePlayPause} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.06 }}
              style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />}
            </motion.button>
            <button onClick={nextSong} className="btn-icon" style={{ width: 30, height: 30, color: 'var(--text-secondary)' }} title="Next">
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button onClick={cycleRepeat} className="btn-icon" style={{ width: 30, height: 30, color: repeatMode !== 'off' ? 'var(--accent)' : 'var(--text-muted)' }} title={`Repeat: ${repeatMode}`}>
              <RepeatIcon size={14} />
            </button>
          </div>

          {/* Seek bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 480 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmt(currentTime)}</span>
            <input type="range" min={0} max={duration || 100} value={currentTime} step={0.5}
              onChange={handleSeek} className="range-input"
              style={{ '--pct': `${pct}%` } as any} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 32, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmt(duration)}</span>
          </div>
        </div>

        {/* Right: sleep + volume — 180px */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 180, flexShrink: 0, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSleep(v => !v)} className="btn-icon" style={{ width: 28, height: 28, color: sleepTimer !== null ? 'var(--accent)' : 'var(--text-muted)' }} title="Sleep timer">
              <Timer size={14} />
            </button>
            <AnimatePresence>{showSleep && <SleepMenu onClose={() => setShowSleep(false)} />}</AnimatePresence>
          </div>
          <button onClick={toggleMute} className="btn-icon" style={{ width: 28, height: 28 }}>
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
            onChange={e => setVolume(Number(e.target.value))} className="range-input"
            style={{ width: 80, '--pct': `${isMuted ? 0 : volume}%` } as any} />
        </div>
      </div>
    </div>
  )
}
