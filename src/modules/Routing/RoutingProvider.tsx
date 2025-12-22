import type { ReactNode } from 'react';

import { BasePathProvider, BaseRoutingContextProvider } from '@/adapters/client';
import { app, routing } from '@/adapters/server';

interface Props {
    children: ReactNode;
}

export async function RoutingProvider({ children }: Props) {
    const { router, basePath } = await routing();
    const locales = await app().locales();
    const defaultLocale = await app().defaultLocale();

    return (
        <BaseRoutingContextProvider
            routes={router.dump()}
            locales={locales}
            defaultLocale={defaultLocale}
        >
            <BasePathProvider basePath={basePath}>{children}</BasePathProvider>
        </BaseRoutingContextProvider>
    );
}
