export default function AppLoading() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 36 }}>
        <div className="skeleton" style={{ height: 14, width: 120, borderRadius: 6, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 44, width: '45%', borderRadius: 10, marginBottom: 12 }} />
      </div>

      {/* Stats skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 44 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18,
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
            <div>
              <div className="skeleton" style={{ height: 22, width: 50, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Song list skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: 'rgba(255,255,255,0.02)', borderRadius: 12,
          }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div className="skeleton" style={{ height: 12, width: `${35 + Math.random() * 30}%`, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 10, width: '20%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
