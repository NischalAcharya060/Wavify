import { Skeleton, SongListSkeleton, StatsSkeleton } from '@/components/Skeleton'

export default function AppLoading() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <Skeleton height={14} width={120} />
        <div style={{ marginBottom: 12 }} />
        <Skeleton height={44} width="45%" borderRadius={10} />
      </div>

      <div style={{ marginBottom: 44 }}>
        <StatsSkeleton count={4} />
      </div>

      <SongListSkeleton count={8} />
    </div>
  )
}
