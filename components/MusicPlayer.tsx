'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '@/lib/PlayerContext'
import { useAuth } from '@/lib/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1,
  Music2, Timer, ChevronDown, X
} from 'lucide-react'

function EqBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
    </div>
  )
}

function SleepTimerMenu({ onClose }: { onClose: () => void }) {
  const { setSleepTimer, sleepTimer } = usePlayer()
  const options = [
    { label: 'Off', value: null },
    { label: '10 min', value: 10 },
    { label: '20 min', value: 20 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full right-0 mb-2 rounded-xl shadow-2xl overflow-hidden"
      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-hover)', minWidth: 160 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-3 pt-3 pb-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        SLEEP TIMER
      </div>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => { setSleepTimer(opt.value); onClose() }}
          className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5 flex items-center justify-between"
          style={{ color: sleepTimer === opt.value || (opt.value === null && sleepTimer === null) ? 'var(--accent)' : 'var(--text-secondary)' }}
        >
          {opt.label}
          {(sleepTimer === opt.value || (opt.value === null && sleepTimer === null)) && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          )}
        </button>
      ))}
    </motion.div>
  )
}

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, volume, isMuted,
    togglePlayPause, nextSong, prevSong, setVolume, toggleMute,
    currentTime, setCurrentTime, duration, setDuration,
    isShuffled, repeatMode, toggleShuffle, cycleRepeat,
    sleepTimer, playerRef,
  } = usePlayer()

  const { user } = useAuth()
  const supabase = createClient()
  const [playerReady, setPlayerReady] = useState(false)
  const [showSleepMenu, setShowSleepMenu] = useState(false)
  const ytPlayer = useRef<any>(null)
  const progressInterval = useRef<any>(null)
  const recordedRef = useRef<string | null>(null)
  const prevPlayingRef = useRef(false)

  // Load YT API once
  useEffect(() => {
    if ((window as any).YT?.Player) { setPlayerReady(true); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    ;(window as any).onYouTubeIframeAPIReady = () => setPlayerReady(true)
  }, [])

  // Init / load video when song changes
  useEffect(() => {
    if (!currentSong || !playerReady) return
    const containerId = 'yt-hidden-player'

    const init = () => {
      if (ytPlayer.current?.loadVideoById) {
        ytPlayer.current.loadVideoById(currentSong.video_id)
        return
      }
      ytPlayer.current = new (window as any).YT.Player(containerId, {
        videoId: currentSong.video_id,
        playerVars: { autoplay: 1, controls: 0, playsinline: 1, origin: window.location.origin },
        events: {
          onReady(e: any) {
            playerRef.current = e.target
            e.target.setVolume(isMuted ? 0 : volume)
            if (isPlaying) e.target.playVideo()
          },
          onStateChange(e: any) {
            if (e.data === 0) nextSong()  // ended
            if (e.data === 1) {           // playing
              setDuration(e.target.getDuration())
              startProgress(e.target)
            }
          }
        }
      })
    }

    if ((window as any).YT?.Player) init()
    else (window as any).onYouTubeIframeAPIReady = () => { setPlayerReady(true); init() }

    // Record recently played
    if (user && recordedRef.current !== currentSong.id) {
      recordedRef.current = currentSong.id
      supabase.from('recently_played').insert({ user_id: user.id, song_id: currentSong.id })
    }

    return () => { if (progressInterval.current) clearInterval(progressInterval.current) }
  }, [currentSong?.id, playerReady])

  // Sync play/pause
  useEffect(() => {
    if (!ytPlayer.current?.playVideo) return
    if (isPlaying === prevPlayingRef.current) return
    prevPlayingRef.current = isPlaying
    if (isPlaying) ytPlayer.current.playVideo()
    else ytPlayer.current.pauseVideo()
  }, [isPlaying])

  // Sync volume
  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(isMuted ? 0 : volume)
  }, [volume, isMuted])

  const startProgress = (player: any) => {
    clearInterval(progressInterval.current)
    progressInterval.current = setInterval(() => {
      if (player.getCurrentTime) setCurrentTime(player.getCurrentTime())
    }, 500)
  }

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setCurrentTime(t)
    ytPlayer.current?.seekTo(t, true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); togglePlayPause() }
      if (e.code === 'ArrowRight') { e.preventDefault(); ytPlayer.current?.seekTo(Math.min(currentTime + 10, duration), true); setCurrentTime(Math.min(currentTime + 10, duration)) }
      if (e.code === 'ArrowLeft') { e.preventDefault(); ytPlayer.current?.seekTo(Math.max(currentTime - 10, 0), true); setCurrentTime(Math.max(currentTime - 10, 0)) }
      if (e.code === 'ArrowUp') { e.preventDefault(); setVolume(Math.min(volume + 10, 100)) }
      if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(Math.max(volume - 10, 0)) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePlayPause, currentTime, duration, volume, setVolume, setCurrentTime])

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <div className="glass-player shrink-0 select-none" style={{ height: 88 }}>
      {/* Hidden YT player */}
      <div id="yt-hidden-player" style={{ display: 'none', position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

      <div className="flex items-center h-full px-4 gap-3">

        {/* ── Song info ── */}
        <div className="flex items-center gap-3 w-56 shrink-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
            {currentSong?.thumbnail
              ? <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-overlay)' }}>
                  <Music2 size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
            }
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                <EqBars />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSong?.id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold truncate"
                style={{ color: currentSong ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {currentSong?.title ?? 'Nothing playing'}
              </motion.p>
            </AnimatePresence>
            {sleepTimer !== null && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                <Timer size={10} /> Sleep in {sleepTimer}m
              </p>
            )}
            {!sleepTimer && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>YouTube Music</p>}
          </div>
        </div>

        {/* ── Center controls ── */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">

          {/* Buttons row */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className="btn-icon w-8 h-8"
              style={{ color: isShuffled ? 'var(--accent)' : 'var(--text-muted)' }}
              title="Shuffle (S)"
            >
              <Shuffle size={15} />
            </button>

            <button onClick={prevSong} className="btn-icon w-8 h-8" style={{ color: 'var(--text-secondary)' }} title="Previous">
              <SkipBack size={20} fill="currentColor" />
            </button>

            <motion.button
              onClick={togglePlayPause}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}
              title="Play/Pause (Space)"
            >
              {isPlaying
                ? <Pause size={18} fill="currentColor" />
                : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />}
            </motion.button>

            <button onClick={nextSong} className="btn-icon w-8 h-8" style={{ color: 'var(--text-secondary)' }} title="Next">
              <SkipForward size={20} fill="currentColor" />
            </button>

            <button
              onClick={cycleRepeat}
              className="btn-icon w-8 h-8"
              style={{ color: repeatMode !== 'off' ? 'var(--accent)' : 'var(--text-muted)' }}
              title={`Repeat: ${repeatMode}`}
            >
              <RepeatIcon size={15} />
            </button>
          </div>

          {/* Seek bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs tabular-nums w-8 text-right" style={{ color: 'var(--text-muted)' }}>
              {fmt(currentTime)}
            </span>
            <div className="flex-1 relative group flex items-center">
              <input
                type="range" min={0} max={duration || 100} value={currentTime} step={0.5}
                onChange={handleSeek}
                className="range-input w-full"
                style={{ '--pct': `${pct}%` } as any}
              />
            </div>
            <span className="text-xs tabular-nums w-8" style={{ color: 'var(--text-muted)' }}>
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* ── Right: volume + sleep ── */}
        <div className="flex items-center gap-2 w-48 shrink-0 justify-end">
          {/* Sleep timer button */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(v => !v)}
              className="btn-icon w-8 h-8"
              style={{ color: sleepTimer !== null ? 'var(--accent)' : 'var(--text-muted)' }}
              title="Sleep timer"
            >
              <Timer size={15} />
            </button>
            <AnimatePresence>
              {showSleepMenu && (
                <SleepTimerMenu onClose={() => setShowSleepMenu(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* Mute */}
          <button onClick={toggleMute} className="btn-icon w-8 h-8" title="Mute (M)">
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Volume slider */}
          <div style={{ width: 80 }}>
            <input
              type="range" min={0} max={100} value={isMuted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="range-input w-full"
              style={{ '--pct': `${isMuted ? 0 : volume}%` } as any}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
