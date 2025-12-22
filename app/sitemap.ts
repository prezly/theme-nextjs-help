import { Sitemap } from '@prezly/theme-kit-nextjs';
import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

import { app, environment, getBasePath, routing } from '@/adapters/server';

export const revalidate = 900; // 15 * 60 (minute)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { generateUrl } = await routing();

    return Sitemap.generate(
        {
            generateUrl,
            categories: app().categories,
            newsroom: app().newsroom,
            locales: app().locales,
            stories: app().allStories,
        },
        {
            // baseUrl is just the origin; generateUrl already includes basePath
            baseUrl: await retrieveBaseUrl(),
        },
    );
}

/**
 * Get the base URL origin (without basePath).
 * Used for sitemap where generateUrl already includes basePath.
 */
export async function retrieveBaseUrl() {
    const { NEXT_PUBLIC_BASE_URL } = environment();
    const appHeaders = await headers();
    return NEXT_PUBLIC_BASE_URL ?? `https://${appHeaders.get('host')}`;
}

/**
 * Get the full base URL including basePath.
 * Used for robots.txt sitemap reference.
 */
export async function retrieveBaseUrlWithBasePath() {
    const origin = await retrieveBaseUrl();
    const basePath = await getBasePath();
    return `${origin}${basePath}`;
}
