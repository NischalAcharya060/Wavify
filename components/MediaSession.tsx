'use client'

import { useEffect } from 'react'
import { usePlayer } from '@/lib/PlayerContext'

// Hooks Wavify's player state into the browser's Media Session API so the
// OS shows track metadata + playback controls on the lock screen, notification
// shade, bluetooth devices, and media keys.
export default function MediaSession() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        togglePlayPause,
        nextSong,
        prevSong,
        playerRef,
        setCurrentTime,
    } = usePlayer()

    // Metadata
    useEffect(() => {
        if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
        if (!currentSong) {
            navigator.mediaSession.metadata = null
            return
        }

        const artwork = currentSong.thumbnail
            ? [
                { src: currentSong.thumbnail, sizes: '96x96', type: 'image/jpeg' },
                { src: currentSong.thumbnail, sizes: '192x192', type: 'image/jpeg' },
                { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
            ]
            : [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }]

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title || 'Unknown',
            artist: currentSong.artist || 'Wavify',
            album: 'Wavify',
            artwork,
        })
    }, [currentSong])

    // Playback state
    useEffect(() => {
        if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
        navigator.mediaSession.playbackState = currentSong
            ? (isPlaying ? 'playing' : 'paused')
            : 'none'
    }, [isPlaying, currentSong])

    // Action handlers — wire OS-level buttons to the player
    useEffect(() => {
        if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

        const safeSet = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
            try { navigator.mediaSession.setActionHandler(action, handler) } catch { /* unsupported */ }
        }

        safeSet('play', () => { if (!isPlaying) togglePlayPause() })
        safeSet('pause', () => { if (isPlaying) togglePlayPause() })
        safeSet('previoustrack', () => prevSong())
        safeSet('nexttrack', () => nextSong())
        safeSet('seekbackward', (details) => {
            const step = details.seekOffset ?? 10
            const target = Math.max(0, currentTime - step)
            playerRef.current?.seekTo?.(target, true)
            setCurrentTime(target)
        })
        safeSet('seekforward', (details) => {
            const step = details.seekOffset ?? 10
            const maxTime = duration || currentTime + step
            const target = Math.min(maxTime, currentTime + step)
            playerRef.current?.seekTo?.(target, true)
            setCurrentTime(target)
        })
        safeSet('seekto', (details) => {
            if (typeof details.seekTime !== 'number') return
            playerRef.current?.seekTo?.(details.seekTime, true)
            setCurrentTime(details.seekTime)
        })
        safeSet('stop', () => { if (isPlaying) togglePlayPause() })

        return () => {
            safeSet('play', null)
            safeSet('pause', null)
            safeSet('previoustrack', null)
            safeSet('nexttrack', null)
            safeSet('seekbackward', null)
            safeSet('seekforward', null)
            safeSet('seekto', null)
            safeSet('stop', null)
        }
    }, [isPlaying, currentTime, duration, togglePlayPause, prevSong, nextSong, playerRef, setCurrentTime])

    // Position state — lets the OS scrubber reflect/control playhead
    useEffect(() => {
        if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
        if (!currentSong || !duration || !isFinite(duration)) return
        if (typeof navigator.mediaSession.setPositionState !== 'function') return
        try {
            navigator.mediaSession.setPositionState({
                duration,
                position: Math.min(currentTime, duration),
                playbackRate: 1,
            })
        } catch { /* ignore invalid values */ }
    }, [currentSong, currentTime, duration])

    return null
}
