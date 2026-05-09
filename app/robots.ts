import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/home', '/library', '/liked', '/profile', '/settings', '/add-song', '/search', '/playlist', '/api'],
                crawlDelay: 1,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/home', '/library', '/liked', '/profile', '/settings', '/add-song', '/search', '/playlist', '/api'],
                crawlDelay: 2,
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/home', '/library', '/liked', '/profile', '/settings', '/add-song', '/search', '/playlist', '/api', '/offline'],
                crawlDelay: 3,
            },
        ],
        sitemap: 'https://wavify.acharyanischal.com.np/sitemap.xml',
        host: 'https://wavify.acharyanischal.com.np',
    }
}
