'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/lib/PlayerContext'

export function useKeyboardShortcuts() {
  const {
    currentSong, isPlaying, togglePlayPause, nextSong, prevSong,
    setVolume, volume, toggleMute, playerRef, currentTime, setCurrentTime,
  } = usePlayer()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return

      if (!currentSong) return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'arrowright':
          e.preventDefault()
          if (e.shiftKey) {
            nextSong()
          } else {
            const newTime = Math.min(currentTime + 10, 9999)
            setCurrentTime(newTime)
            playerRef.current?.seekTo(newTime, true)
          }
          break
        case 'arrowleft':
          e.preventDefault()
          if (e.shiftKey) {
            prevSong()
          } else {
            const newTime = Math.max(currentTime - 10, 0)
            setCurrentTime(newTime)
            playerRef.current?.seekTo(newTime, true)
          }
          break
        case 'arrowup':
          e.preventDefault()
          setVolume(Math.min(volume + 5, 100))
          break
        case 'arrowdown':
          e.preventDefault()
          setVolume(Math.max(volume - 5, 0))
          break
        case 'm':
          toggleMute()
          break
        case 'n':
          nextSong()
          break
        case 'p':
          prevSong()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSong, isPlaying, togglePlayPause, nextSong, prevSong, setVolume, volume, toggleMute, currentTime, setCurrentTime, playerRef])
}
