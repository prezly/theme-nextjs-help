import type { UrlGenerator } from '@prezly/theme-kit-nextjs';
import { Route, Router, RoutingAdapter } from '@prezly/theme-kit-nextjs/server';
import { headers } from 'next/headers';

import { app } from './app';
import { environment } from './environment';

export type AppRouter = ReturnType<typeof configureAppRouter>;
export type AppRoutes = AppRouter['routes'];
export type AppUrlGenerator = UrlGenerator<AppRouter>;
export type AppUrlGeneratorParams = UrlGenerator.Params<AppRouter>;

/**
 * Get the base path from X-Base-Path header or BASE_PATH env variable.
 * This allows the app to be deployed behind a reverse proxy at a subfolder.
 */
export async function getBasePath(): Promise<string> {
    const requestHeaders = await headers();
    const headerBasePath = requestHeaders.get('X-Base-Path');
    if (headerBasePath) {
        // Ensure it starts with / and doesn't end with /
        return normalizeBasePath(headerBasePath);
    }
    const env = environment(requestHeaders);
    return normalizeBasePath(env.BASE_PATH || '');
}

function normalizeBasePath(basePath: string): string {
    if (!basePath) return '';
    // Ensure it starts with / and doesn't end with /
    let normalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
    normalized = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
    return normalized;
}

const { useRouting: baseRouting } = RoutingAdapter.connect(configureAppRouter, async () => {
    const [newsroom, locales, defaultLocale] = await Promise.all([
        app().newsroom(),
        app().locales(),
        app().defaultLocale(),
    ]);
    return {
        defaultLocale,
        locales,
        origin: new URL(newsroom.url).origin as `http://${string}` | `https://${string}`,
    };
});

/**
 * Wrapped routing function that prepends basePath to generated URLs.
 */
export async function routing() {
    const basePath = await getBasePath();
    const {
        router,
        generateUrl: baseGenerateUrl,
        generateAbsoluteUrl: baseGenerateAbsoluteUrl,
    } = await baseRouting();

    return {
        router,
        basePath,
        generateUrl: ((routeName: string, params?: Record<string, unknown>) => {
            const url = baseGenerateUrl(routeName as keyof AppRoutes, params as never);
            return `${basePath}${url}` as `/${string}`;
        }) as AppUrlGenerator,
        generateAbsoluteUrl: ((routeName: string, params?: Record<string, unknown>) => {
            const url = baseGenerateAbsoluteUrl(routeName as keyof AppRoutes, params as never);
            // For absolute URLs, we need to insert basePath after the origin
            if (basePath) {
                const urlObj = new URL(url);
                urlObj.pathname = `${basePath}${urlObj.pathname}`;
                return urlObj.toString() as `http://${string}` | `https://${string}`;
            }
            return url;
        }) as UrlGenerator.Absolute<AppRouter>,
    };
}

export function configureAppRouter() {
    const route = Route.create;

    return Router.create({
        index: route('/(:localeSlug)', '/:localeCode'),
        category: route('(/:localeSlug)/category/:slug', '/:localeCode/category/:slug'),
        tag: route('(/:localeSlug)/tag/:tag', '/:localeCode/tag/:tag'),
        media: route('(/:localeSlug)/media', '/:localeCode/media'),
        mediaGallery: route('(/:localeSlug)/media/album/:uuid', '/:localeCode/media/album/:uuid'),
        search: route('(/:localeSlug)/search', '/:localeCode/search'),
        privacyPolicy: route('(/:localeSlug)/privacy-policy', '/:localeCode/privacy-policy'),

        previewStory: route('/s/:uuid', '/:localeCode/preview/:uuid', {
            check(_, searchParams) {
                return searchParams.has('preview');
            },
            generate(pattern, params) {
                return `${pattern.stringify(params)}?preview` as `/${string}`;
            },
            resolveLocale({ uuid }) {
                return app()
                    .story({ uuid })
                    .then((story) => story?.culture.code);
            },
        }),

        secretStory: route('/s/:uuid', '/:localeCode/secret/:uuid', {
            check(_, searchParams) {
                return !searchParams.has('preview');
            },
            resolveLocale({ uuid }) {
                return app()
                    .story({ uuid })
                    .then((story) => story?.culture.code);
            },
        }),

        story: route('/:slug', '/:localeCode/:slug', {
            resolveLocale({ slug }) {
                return app()
                    .story({ slug })
                    .then((story) => story?.culture.code);
            },
        }),

        feed: route('/feed', '/feed'),
    });
}
