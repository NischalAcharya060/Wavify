// One-shot script to generate PWA PNG icons from public/icons/icon.svg.
// Run with: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const iconsDir = resolve(root, 'public/icons')

const svg = await readFile(resolve(iconsDir, 'icon.svg'))

// Maskable icons need ~20% safe padding around the logo so Android/iOS can
// crop to any mask shape without clipping the mark. We render the SVG smaller
// onto a solid brand-colored square of the target size.
async function renderMaskable(size) {
    const inner = Math.round(size * 0.6)
    const logo = await sharp(svg).resize(inner, inner).png().toBuffer()
    const bg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#7c6af7"/>
                    <stop offset="100%" stop-color="#3b2fa8"/>
                </linearGradient>
            </defs>
            <rect width="${size}" height="${size}" fill="url(#g)"/>
        </svg>`
    )
    return sharp(bg)
        .composite([{ input: logo, gravity: 'center' }])
        .png()
        .toBuffer()
}

async function renderStandard(size) {
    return sharp(svg).resize(size, size).png().toBuffer()
}

await mkdir(iconsDir, { recursive: true })

const tasks = [
    ['icon-192.png', await renderStandard(192)],
    ['icon-512.png', await renderStandard(512)],
    ['icon-maskable-192.png', await renderMaskable(192)],
    ['icon-maskable-512.png', await renderMaskable(512)],
    ['apple-touch-icon.png', await renderStandard(180)],
    ['favicon-32.png', await renderStandard(32)],
    ['favicon-16.png', await renderStandard(16)],
]

for (const [name, buf] of tasks) {
    await writeFile(resolve(iconsDir, name), buf)
    console.log('✓', name)
}
