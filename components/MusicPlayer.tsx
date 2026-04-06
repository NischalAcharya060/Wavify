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
            <motion.span key={i} animate={{ height: [4, 16, 8, 14, 6] }}
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
                    background: 'rgba(18, 18, 26, 0.98)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 6, minWidth: 160,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 100
                  }} onClick={e => e.stopPropagation()}>
        {opts.map(({ l, v }) => {
          const active = sleepTimer === v || (v === null && sleepTimer === null)
          return (
              <button key={l} onClick={() => { setSleepTimer(v); onClose() }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                        padding: '10px 12px', borderRadius: 10, fontSize: 13, background: active ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                        border: 'none', cursor: 'pointer', color: active ? '#a78bfa' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s'
                      }}>{l}{active && <Zap size={12} fill="#a78bfa" />}</button>
          )
        })}
      </motion.div>
  )
}

export default function MusicPlayer({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { currentSong, isPlaying, volume, isMuted, togglePlayPause, nextSong, prevSong, setVolume, toggleMute, currentTime, setCurrentTime, duration, setDuration, isShuffled, repeatMode, toggleShuffle, cycleRepeat, sleepTimer, playerRef } = usePlayer()
  const { user } = useAuth()
  const supabase = createClient()
  const [playerReady, setPlayerReady] = useState(false)
  const [showSleep, setShowSleep] = useState(false)
  const ytPlayer = useRef<any>(null)
  const progressInterval = useRef<any>(null)

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
          onReady(e: any) { playerRef.current = e.target; e.target.setVolume(isMuted ? 0 : volume); if (isPlaying) e.target.playVideo() },
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
    if (user) supabase.from('recently_played').insert({ user_id: user.id, song_id: currentSong.id })
    return () => clearInterval(progressInterval.current)
  }, [currentSong?.id, playerReady])

  useEffect(() => {
    if (!ytPlayer.current?.playVideo) return
    if (isPlaying) ytPlayer.current.playVideo(); else ytPlayer.current.pauseVideo()
  }, [isPlaying])

  const fmt = (s: number) => (!s || isNaN(s)) ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  if (!currentSong) return null;

  return (
      <div className="player-wrapper" style={{
        height: 96, position: 'fixed', bottom: 0,
        left: isCollapsed ? '80px' : '260px',
        right: 0, background: 'rgba(8, 8, 15, 0.95)', backdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '0 24px',
        zIndex: 40, display: 'flex', alignItems: 'center',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <style>{`
        .player-range { -webkit-appearance: none; background: rgba(255,255,255,0.05); height: 4px; border-radius: 2px; outline: none; cursor: pointer; width: 100%; position: relative; }
        .player-range::-webkit-slider-runnable-track { background: linear-gradient(to right, #7c3aed var(--pct), rgba(255,255,255,0.1) var(--pct)); height: 4px; border-radius: 2px; }
        .player-range::-webkit-slider-thumb { -webkit-appearance: none; height: 12px; width: 12px; border-radius: 50%; background: #fff; margin-top: -4px; opacity: 0; transition: opacity 0.2s; box-shadow: 0 0 10px rgba(124, 58, 237, 0.5); }
        .player-range:hover::-webkit-slider-thumb { opacity: 1; }
        @media (max-width: 1024px) { .player-wrapper { left: 0 !important; width: 100% !important; z-index: 110 !important; } }
        @media (max-width: 768px) {
          .player-wrapper { height: 80px !important; bottom: 0px !important; left: 0 !important; right: 0 !important; border-radius: 0; border: none; border-top: 1px solid rgba(255,255,255,0.1); }
          .desktop-only { display: none !important; }
          .player-grid { grid-template-columns: 1fr auto !important; }
          .progress-container { position: absolute; top: 0; left: 0; right: 0; }
        }
      `}</style>

        <div id="yt-player" style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

        <div className="player-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 2fr minmax(180px, 1fr)', alignItems: 'center', width: '100%', gap: 16 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <img src={currentSong.thumbnail || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {isPlaying && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><EqBars /></div>}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</p>
              <p className="desktop-only" style={{ fontSize: 11, color: 'rgba(167, 139, 250, 0.7)' }}>{sleepTimer ? `Timer: ${sleepTimer}m` : 'Wavify Engine'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 44 }}>
              <button className="desktop-only" onClick={toggleShuffle} style={{ background: 'none', border: 'none', color: isShuffled ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}><Shuffle size={16} /></button>
              <button onClick={prevSong} style={{ background: 'none', border: 'none', color: '#fff' }}><SkipBack size={22} fill="currentColor" /></button>
              <button onClick={togglePlayPause} style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', color: '#08080f', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: 3 }} />}
              </button>
              <button onClick={nextSong} style={{ background: 'none', border: 'none', color: '#fff' }}><SkipForward size={22} fill="currentColor" /></button>
              <button className="desktop-only" onClick={cycleRepeat} style={{ background: 'none', border: 'none', color: repeatMode !== 'off' ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}><RepeatIcon size={16} /></button>
            </div>
            <div className="progress-container" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <span className="desktop-only" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 35, textAlign: 'right' }}>{fmt(currentTime)}</span>
              <input type="range" min={0} max={duration || 100} value={currentTime} step={0.1} onChange={(e) => {
                const t = Number(e.target.value); setCurrentTime(t); playerRef.current?.seekTo(t, true);
              }} className="player-range" style={{ '--pct': `${pct}%` } as any} />
              <span className="desktop-only" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 35 }}>{fmt(duration)}</span>
            </div>
          </div>

          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowSleep(!showSleep)} style={{ background: 'none', border: 'none', color: sleepTimer ? '#a78bfa' : 'rgba(255,255,255,0.4)', position: 'relative' }}>
              <Timer size={18} />
              <AnimatePresence>{showSleep && <SleepMenu onClose={() => setShowSleep(false)} />}</AnimatePresence>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 10 }}>
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)' }}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
              <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={e => setVolume(Number(e.target.value))} className="player-range" style={{ width: 60, '--pct': `${isMuted ? 0 : volume}%` } as any} />
            </div>
          </div>
        </div>
      </div>
  )
}