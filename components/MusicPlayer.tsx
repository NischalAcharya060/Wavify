'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '@/lib/PlayerContext'
import { useAuth } from '@/lib/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Music2, Timer, Zap } from 'lucide-react'

function EqBars() {
  return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
        {[...Array(4)].map((_, i) => (
            <motion.span
                key={i}
                animate={{ height: [4, 16, 8, 14, 6] }}
                transition={{ repeat: Infinity, duration: 0.6 + i * 0.1, ease: "easeInOut" }}
                style={{ width: 3, background: '#fff', borderRadius: 10 }}
            />
        ))}
      </div>
  )
}

function SleepMenu({ onClose }: { onClose: () => void }) {
  const { setSleepTimer, sleepTimer } = usePlayer()
  const opts = [{ l: 'Off', v: null }, { l: '10 min', v: 10 }, { l: '20 min', v: 20 }, { l: '30 min', v: 30 }, { l: '1 hour', v: 60 }]

  return (
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 16px)', right: 0,
                    background: 'rgba(18, 18, 26, 0.95)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 6, minWidth: 160,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 100
                  }}
                  onClick={e => e.stopPropagation()}>
        <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>Timer</div>
        {opts.map(({ l, v }) => {
          const active = sleepTimer === v || (v === null && sleepTimer === null)
          return (
              <button key={l} onClick={() => { setSleepTimer(v); onClose() }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                        padding: '10px 12px', borderRadius: 10, fontSize: 13, background: active ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                        border: 'none', cursor: 'pointer', color: active ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                        fontWeight: active ? 600 : 400, transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
                {l}
                {active && <Zap size={12} fill="#a78bfa" />}
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

  // YouTube API Logic (Unchanged but ensuring stability)
  useEffect(() => {
    if ((window as any).YT?.Player) { setPlayerReady(true); return }
    const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api'
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
    init()
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

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setCurrentTime(t); ytPlayer.current?.seekTo(t, true)
  }, [setCurrentTime])

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
      <div style={{
        height: 96, flexShrink: 0, position: 'relative',
        background: 'rgba(8, 8, 15, 0.8)', backdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '0 24px',
        zIndex: 50, display: 'flex', alignItems: 'center'
      }}>
        <style>{`
        .player-range {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.05);
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          position: relative;
        }
        .player-range::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #7c3aed var(--pct), transparent var(--pct));
          height: 4px;
          border-radius: 2px;
        }
        .player-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #fff;
          margin-top: -4px;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .player-range:hover::-webkit-slider-thumb { opacity: 1; }
      `}</style>

        <div id="yt-player" style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', alignItems: 'center', width: '100%', gap: 24 }}>

          {/* 1. Track Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
              {currentSong?.thumbnail
                  ? <img src={currentSong.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={20} color="rgba(255,255,255,0.2)" /></div>
              }
              <AnimatePresence>
                {isPlaying && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EqBars />
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ minWidth: 0 }}>
              <motion.p key={currentSong?.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        style={{ fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentSong?.title ?? 'No Track Loaded'}
              </motion.p>
              <p style={{ fontSize: 12, color: 'rgba(167, 139, 250, 0.6)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {sleepTimer !== null ? <><Timer size={12} /> Sleep in {sleepTimer}m</> : 'Wavify Engine'}
              </p>
            </div>
          </div>

          {/* 2. Main Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button onClick={toggleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffled ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} title="Shuffle">
                <Shuffle size={18} />
              </button>
              <button onClick={prevSong} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }} title="Previous">
                <SkipBack size={22} fill="currentColor" />
              </button>
              <motion.button
                  onClick={togglePlayPause}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', background: '#fff',
                    color: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                  }}
              >
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: 3 }} />}
              </motion.button>
              <button onClick={nextSong} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }} title="Next">
                <SkipForward size={22} fill="currentColor" />
              </button>
              <button onClick={cycleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeatMode !== 'off' ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} title={`Repeat: ${repeatMode}`}>
                <RepeatIcon size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(currentTime)}</span>
              <input type="range" min={0} max={duration || 100} value={currentTime} step={0.1}
                     onChange={handleSeek} className="player-range"
                     style={{ flex: 1, '--pct': `${pct}%` } as any} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 40, fontVariantNumeric: 'tabular-nums' }}>{fmt(duration)}</span>
            </div>
          </div>

          {/* 3. Extras & Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative' }}>
              <button
                  onClick={() => setShowSleep(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: sleepTimer !== null ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}
              >
                <Timer size={20} />
              </button>
              <AnimatePresence>{showSleep && <SleepMenu onClose={() => setShowSleep(false)} />}</AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
                     onChange={e => setVolume(Number(e.target.value))} className="player-range"
                     style={{ width: 80, '--pct': `${isMuted ? 0 : volume}%` } as any} />
            </div>
          </div>

        </div>
      </div>
  )
}