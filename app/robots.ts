import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/home', '/library', '/liked', '/profile', '/settings', '/add-song', '/search', '/playlist'],
            },
        ],
        sitemap: 'https://wavify-grdhravan.vercel.app/sitemap.xml',
    }
}
