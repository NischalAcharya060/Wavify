'use client'

import dynamic from 'next/dynamic'

// Dynamic imports for heavy components - improves initial page load
// The components will only be loaded when needed

export const DynamicMusicPlayer = dynamic(
  () => import('@/components/MusicPlayer'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 90,
        background: 'rgba(12,10,22,0.95)', borderTop: '1px solid rgba(139,92,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Loading player...</span>
      </div>
    ),
  }
)

export const DynamicQueuePanel = dynamic(
  () => import('@/components/QueuePanel'),
  {
    ssr: false,
    loading: () => <div style={{ width: 320, background: 'rgba(12,10,22,0.95)', height: '100%' }} />,
  }
)

export const DynamicAddSongModal = dynamic(
  () => import('@/components/AddSongModal'),
  {
    ssr: false,
    loading: () => null,
  }
)