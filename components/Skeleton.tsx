'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

export function Skeleton({ width, height, borderRadius = 6, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
    />
  )
}

export function SongListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 12,
          }}
        >
          <Skeleton width={42} height={42} borderRadius={8} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {/* eslint-disable-next-line react-hooks/purity */}
            <Skeleton height={12} width={`${35 + Math.random() * 30}%`} borderRadius={4} />
            <Skeleton height={10} width="20%" borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Skeleton width={42} height={42} borderRadius={12} />
          <div>
            <Skeleton height={22} width={50} borderRadius={6} />
            <Skeleton height={10} width={60} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 20,
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <Skeleton width="100%" height={160} borderRadius={12} />
          <Skeleton height={16} width="70%" borderRadius={4} />
          <Skeleton height={12} width="40%" borderRadius={4} />
        </div>
      ))}
    </div>
  )
}