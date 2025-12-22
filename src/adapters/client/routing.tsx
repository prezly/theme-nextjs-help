'use client';

import { RoutingAdapter } from '@prezly/theme-kit-nextjs';
import { createContext, useContext } from 'react';

import type { AppRoutes, AppUrlGenerator } from '../server/routing';

export type * from '../server/routing';

const { useRouting: baseUseRouting, RoutingContextProvider: BaseRoutingContextProvider } =
    RoutingAdapter.connect<AppRoutes>();

export { BaseRoutingContextProvider };

// Context for basePath
const BasePathContext = createContext<string>('');

export function BasePathProvider({
    basePath,
    children,
}: {
    basePath: string;
    children: React.ReactNode;
}) {
    return <BasePathContext.Provider value={basePath}>{children}</BasePathContext.Provider>;
}

export function useBasePath(): string {
    return useContext(BasePathContext);
}

/**
 * Wrapped useRouting hook that prepends basePath to generated URLs.
 */
export function useRouting() {
    const basePath = useBasePath();
    const { generateUrl: baseGenerateUrl } = baseUseRouting();

    return {
        generateUrl: ((routeName: string, params?: Record<string, unknown>) => {
            const url = baseGenerateUrl(routeName as keyof AppRoutes, params as never);
            return `${basePath}${url}` as `/${string}`;
        }) as AppUrlGenerator,
    };
}
