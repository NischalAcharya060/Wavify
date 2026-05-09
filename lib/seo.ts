import type { Metadata } from 'next'

const SITE_URL = 'https://wavify.acharyanischal.com.np'
const PARENT_URL = 'https://acharyanischal.com.np'
const SITE_NAME = 'Wavify'
const SITE_DESCRIPTION = 'A modern music streaming platform with YouTube music integration. Create playlists, manage your library, and enjoy seamless music playback.'

export const siteConfig = {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    parentUrl: PARENT_URL,
    ogImage: `${SITE_URL}/og-image.png`,
    twitterHandle: '@acharyanischal',
}

export function createMetadata(override: Partial<Metadata>): Metadata {
    return {
        metadataBase: new URL(SITE_URL),
        ...override,
    }
}

export function generateOGImage(title?: string) {
    return {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: title || siteConfig.name,
        type: 'image/png' as const,
    }
}

export function generateOpenGraph(
    title: string,
    description: string,
    url: string,
    type: 'website' | 'article' = 'website'
) {
    return {
        type,
        locale: 'en_US',
        url,
        siteName: SITE_NAME,
        title,
        description,
        images: [generateOGImage(title)],
    }
}

export function generateTwitterMeta(title: string, description: string) {
    return {
        card: 'summary_large_image' as const,
        title,
        description,
        images: [siteConfig.ogImage],
        creator: siteConfig.twitterHandle,
    }
}

export function generateStructuredData(
    type: 'WebApplication' | 'WebSite' | 'Organization' | 'BreadcrumbList',
    data: Record<string, unknown>
) {
    return {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    }
}

export const robotsConfig = {
    index: true,
    follow: true,
    googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
    },
}

export const protectedPageRobots = {
    index: false,
    follow: false,
}
