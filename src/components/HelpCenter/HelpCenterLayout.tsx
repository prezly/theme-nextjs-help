'use client';

import type { Category, TranslatedCategory } from '@prezly/sdk';
import type { Locale } from '@prezly/theme-kit-nextjs';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { StoryActions } from '@/theme-settings';
import type { SearchSettings } from '@/types';
import { isPreviewActive } from '@/utils';

import { CategorySidebar } from './CategorySidebar';
import { LinearHeader } from './LinearHeader';
import { TableOfContents } from './TableOfContents';

interface StoryActionsData {
    actions: StoryActions;
    storyUrl: string | null;
    storyUuid: string;
    storyTitle: string;
    storySlug: string;
    uploadcareAssetsGroupUuid: string | null;
}

interface Props {
    localeCode: Locale.Code;
    categories: Category[];
    translatedCategories: TranslatedCategory[];
    children: ReactNode;
    selectedCategorySlug?: string;
    showTableOfContents?: boolean;
    content?: string;
    newsroom?: any;
    information?: any;
    searchSettings?: SearchSettings;
    categoryStories?: Record<number, any[]>;
    breadcrumbCategories?: TranslatedCategory[];
    storyTitle?: string;
    isHomepage?: boolean;
    mainSiteUrl?: string | null;
    accentColor?: string;
    currentStorySlug?: string;
    storyActionsData?: StoryActionsData;
}

export function HelpCenterLayout({
    localeCode,
    categories,
    translatedCategories,
    children,
    selectedCategorySlug,
    showTableOfContents = false,
    content,
    newsroom,
    information,
    searchSettings,
    categoryStories = {},
    breadcrumbCategories = [],
    storyTitle,
    isHomepage = false,
    mainSiteUrl,
    accentColor,
    currentStorySlug,
    storyActionsData,
}: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    // Prevent hydration mismatch and check preview status
    useEffect(() => {
        setIsHydrated(true);
        setIsPreview(isPreviewActive());
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (typeof selectedCategorySlug !== 'undefined') {
            setIsSidebarOpen(false);
        }
    }, [selectedCategorySlug]);

    return (
        <div className="min-h-screen bg-background">
            {/* Linear-style Header */}
            {newsroom && information && (
                <LinearHeader
                    localeCode={localeCode}
                    newsroom={newsroom}
                    information={information}
                    searchSettings={searchSettings}
                    categories={breadcrumbCategories}
                    storyTitle={storyTitle}
                    isHomepage={isHomepage}
                    accentColor={accentColor}
                    isSearchOpen={isSearchOpen}
                    onSearchClose={() => setIsSearchOpen(false)}
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    storyActionsData={storyActionsData}
                />
            )}

            <div className="flex min-h-[calc(100vh-3.5rem)]">
                {/* Left Sidebar - Navigation - Fixed/Sticky */}
                <aside
                    className={cn(
                        'fixed bottom-0 left-0 z-[60] transition-all duration-200',
                        'transform transition-transform duration-300 ease-in-out',
                        // Mobile: full width, solid background
                        'w-full bg-background',
                        // Desktop: fixed width, with border and backdrop blur
                        'md:w-80 md:backdrop-blur',
                        isSearchOpen
                            ? 'md:border-r-muted/30'
                            : 'md:border-r md:bg-background/95 md:supports-[backdrop-filter]:bg-background/60',
                        isHydrated && isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                        'md:translate-x-0', // Always visible on desktop
                        isPreview ? 'top-[calc(3.5rem+44px)]' : 'top-14',
                    )}
                >
                    <ScrollArea className="h-full">
                        <CategorySidebar
                            localeCode={localeCode}
                            categories={categories}
                            translatedCategories={translatedCategories}
                            selectedCategorySlug={selectedCategorySlug}
                            onCategorySelect={() => setIsSidebarOpen(false)}
                            categoryStories={categoryStories}
                            currentStorySlug={currentStorySlug}
                            isSearchOpen={isSearchOpen}
                            onSearchOpen={() => setIsSearchOpen(true)}
                            mainSiteUrl={mainSiteUrl}
                        />
                    </ScrollArea>
                </aside>

                {/* Main content area - positioned next to fixed sidebar */}
                <div className="flex-1 flex min-w-0 ml-0 md:ml-80">
                    {/* Article content - centered between sidebars */}
                    <main
                        className={cn(
                            'flex-1 min-w-0 flex justify-center',
                            showTableOfContents ? 'max-w-none' : 'max-w-6xl mx-auto',
                        )}
                    >
                        <div
                            className={cn(
                                'w-full px-6 py-8 md:px-8 lg:py-12',
                                showTableOfContents ? 'max-w-5xl xl:px-12' : 'max-w-6xl',
                            )}
                        >
                            {children}
                        </div>
                    </main>

                    {/* Right Sidebar - Table of Contents - Sticky */}
                    {showTableOfContents && (
                        <aside className="hidden xl:block w-80 flex-shrink-0">
                            <div className="sticky top-20 p-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
                                <TableOfContents content={content} />
                            </div>
                        </aside>
                    )}
                </div>

                {/* Overlay for mobile sidebar or search */}
                {isHydrated && (isSidebarOpen || isSearchOpen) && (
                    <div
                        className={cn(
                            'fixed inset-0 bg-black/50 transition-opacity duration-200',
                            // When search is open, overlay should be below search panel but above everything else
                            isSearchOpen ? 'z-[65]' : 'z-30 md:hidden',
                        )}
                        onClick={() => {
                            if (isSearchOpen) {
                                setIsSearchOpen(false);
                            } else {
                                setIsSidebarOpen(false);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                if (isSearchOpen) {
                                    setIsSearchOpen(false);
                                } else {
                                    setIsSidebarOpen(false);
                                }
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={isSearchOpen ? 'Close search' : 'Close sidebar'}
                    />
                )}
            </div>
        </div>
    );
}
