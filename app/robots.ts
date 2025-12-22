import { Robots } from '@prezly/theme-kit-nextjs/server';
import type { MetadataRoute } from 'next';

import { app } from '@/adapters/server';

import { retrieveBaseUrlWithBasePath } from './sitemap';

export default async function robots(): Promise<MetadataRoute.Robots> {
    return Robots.generate({
        newsroom: app().newsroom,
        // Use full URL with basePath for sitemap reference
        baseUrl: await retrieveBaseUrlWithBasePath(),
    });
}
