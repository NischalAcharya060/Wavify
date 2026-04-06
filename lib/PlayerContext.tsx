'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Song } from '@/lib/types'

export type RepeatMode = 'off' | 'all' | 'one'

interface PlayerContextType {
  currentSong: Song | null
  queue: Song[]
  originalQueue: Song[]
  isPlaying: boolean
  volume: number
  isMuted: boolean
  currentTime: number
  duration: number
  isShuffled: boolean
  repeatMode: RepeatMode
  sleepTimer: number | null
  sleepTimerEnd: number | null
  playSong: (song: Song, queue?: Song[]) => void
  togglePlayPause: () => void
  nextSong: () => void
  prevSong: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setSleepTimer: (minutes: number | null) => void
  playerRef: React.MutableRefObject<any>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [originalQueue, setOriginalQueue] = useState<Song[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null)
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null)

  const playerRef = useRef<any>(null)
  const sleepIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sleep timer countdown - Improved cleanup and frequency
  useEffect(() => {
    if (sleepTimerEnd === null) {
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current)
      setSleepTimerState(null)
      return
    }

    sleepIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const remainingMs = sleepTimerEnd - now
      const remainingMinutes = Math.ceil(remainingMs / 60000)

      if (remainingMs <= 0) {
        setIsPlaying(false)
        setSleepTimerEnd(null)
        setSleepTimerState(null)
        if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current)
      } else {
        setSleepTimerState(remainingMinutes)
      }
    }, 1000) // Check every second for better accuracy, UI only updates on minute change

    return () => {
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current)
    }
  }, [sleepTimerEnd])

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    setCurrentSong(song)
    setCurrentTime(0)
    setIsPlaying(true)
    if (newQueue) {
      setOriginalQueue(newQueue)
      setQueue(isShuffled ? [...newQueue].sort(() => Math.random() - 0.5) : newQueue)
    }
  }, [isShuffled])

  const togglePlayPause = useCallback(() => setIsPlaying(p => !p), [])

  const nextSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return
    const idx = queue.findIndex(s => s.id === currentSong.id)

    if (repeatMode === 'one') {
      setCurrentTime(0)
      if (playerRef.current?.seekTo) playerRef.current.seekTo(0)
      setIsPlaying(true)
      return
    }

    if (idx < queue.length - 1) {
      setCurrentSong(queue[idx + 1])
      setCurrentTime(0)
      setIsPlaying(true)
    } else if (repeatMode === 'all') {
      setCurrentSong(queue[0])
      setCurrentTime(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(false) // End of queue
    }
  }, [currentSong, queue, repeatMode])

  const prevSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return

    // If more than 3 seconds in, restart the song instead of going back
    if (currentTime > 3) {
      setCurrentTime(0)
      if (playerRef.current?.seekTo) playerRef.current.seekTo(0)
      return
    }

    const idx = queue.findIndex(s => s.id === currentSong.id)
    if (idx > 0) {
      setCurrentSong(queue[idx - 1])
      setCurrentTime(0)
      setIsPlaying(true)
    }
  }, [currentSong, queue, currentTime])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    setIsMuted(v === 0)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(m => !m)
  }, [])

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const next = !prev
      if (next) {
        // Shuffling: Keep current song at the top if possible, shuffle the rest
        const otherSongs = originalQueue.filter(s => s.id !== currentSong?.id)
        const shuffled = [...otherSongs].sort(() => Math.random() - 0.5)
        if (currentSong) shuffled.unshift(currentSong)
        setQueue(shuffled)
      } else {
        // Unshuffling: Restore original order
        setQueue(originalQueue)
      }
      return next
    })
  }, [currentSong, originalQueue])

  const cycleRepeat = useCallback(() => {
    setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')
  }, [])

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerEnd(null)
      setSleepTimerState(null)
    } else {
      setSleepTimerEnd(Date.now() + minutes * 60 * 1000)
      setSleepTimerState(minutes)
    }
  }, [])

  return (
      <PlayerContext.Provider value={{
        currentSong, queue, originalQueue,
        isPlaying, volume, isMuted,
        currentTime, duration,
        isShuffled, repeatMode,
        sleepTimer, sleepTimerEnd,
        playSong, togglePlayPause, nextSong, prevSong,
        setVolume, toggleMute,
        setCurrentTime, setDuration,
        toggleShuffle, cycleRepeat, setSleepTimer,
        playerRef,
      }}>
        {children}
      </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}