import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Wavify — Stream Your World'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #08080f 0%, #1e1b4b 50%, #08080f 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Decorative circles */}
                <div
                    style={{
                        position: 'absolute',
                        top: -80,
                        right: -80,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -100,
                        left: -100,
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    }}
                />

                {/* Music icon */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 100,
                        height: 100,
                        borderRadius: 28,
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        marginBottom: 32,
                        boxShadow: '0 20px 60px rgba(124,58,237,0.4)',
                    }}
                >
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 700,
                        color: '#ffffff',
                        letterSpacing: '-2px',
                        marginBottom: 12,
                    }}
                >
                    Wavify
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 28,
                        color: 'rgba(167,139,250,0.8)',
                        fontWeight: 400,
                        letterSpacing: '0.5px',
                    }}
                >
                    Stream Your World
                </div>

                {/* Tags */}
                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        marginTop: 40,
                    }}
                >
                    {['Playlists', 'YouTube Sync', 'Personal Library'].map((tag) => (
                        <div
                            key={tag}
                            style={{
                                padding: '8px 20px',
                                borderRadius: 20,
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: 16,
                            }}
                        >
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    )
}
