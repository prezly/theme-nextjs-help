'use client';

import type { Newsroom, NewsroomCompanyInformation, TranslatedCategory } from '@prezly/sdk';
import type { Locale } from '@prezly/theme-kit-nextjs';
import { Menu, X } from 'lucide-react';
import Image, { type ImageLoaderProps } from 'next/image';

import { Link } from '@/components/Link';
import { Button } from '@/components/ui/ui/button';
import { cn } from '@/lib/utils';
import { SearchWidget } from '@/modules/Header/ui/SearchWidget';
import type { SearchSettings } from '@/types';
import { getUploadcareImage } from '@/utils';

import { Breadcrumbs } from './Breadcrumbs';

interface Props {
    localeCode: Locale.Code;
    newsroom: Newsroom;
    information: NewsroomCompanyInformation;
    className?: string;
    searchSettings?: SearchSettings;
    categories?: TranslatedCategory[];
    storyTitle?: string;
    isHomepage?: boolean;
    accentColor?: string;
    isSearchOpen?: boolean;
    onSearchClose?: () => void;
    isSidebarOpen?: boolean;
    onSidebarToggle?: () => void;
}

export function LinearHeader({
    localeCode,
    newsroom,
    information,
    className,
    searchSettings,
    categories = [],
    storyTitle,
    isHomepage = false,
    accentColor,
    isSearchOpen = false,
    onSearchClose,
    isSidebarOpen = false,
    onSidebarToggle,
}: Props) {
    const newsroomName = information.name || newsroom.name;
    const logoLoader = ({ src }: ImageLoaderProps) => src;

    return (
        <header
            className={cn(
                'sticky top-0 w-full z-[60] border-b bg-background transition-all duration-200',
                className,
            )}
        >
            <div className="flex h-14 items-center justify-between md:justify-start">
                {/* Logo section - aligned with sidebar width (320px = w-80) on desktop */}
                <div
                    className={cn(
                        'flex-shrink-0 px-4 md:px-6 flex items-center justify-between transition-all duration-200',
                        'md:w-80',
                        isSearchOpen ? 'md:border-r-muted/30' : 'md:border-r',
                    )}
                >
                    <Link
                        href={{ routeName: 'index', params: { localeCode } }}
                        className="flex items-center space-x-2 text-decoration-none"
                    >
                        {newsroom.newsroom_logo && (
                            <Image
                                src={getUploadcareImage(newsroom.newsroom_logo)?.cdnUrl ?? ''}
                                alt={newsroomName}
                                width={120}
                                height={24}
                                className="h-6 w-auto object-contain"
                                loader={logoLoader}
                                unoptimized
                                priority
                            />
                        )}
                        {!newsroom.newsroom_logo && (
                            <span className="font-bold">{newsroomName}</span>
                        )}
                    </Link>
                </div>

                {/* Mobile actions - Open app button and hamburger menu */}
                <div className="flex items-center space-x-2 px-4 md:hidden">
                    <a
                        href="https://rock.prezly.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                    >
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 text-sm font-medium text-white border-0 hover:opacity-90"
                            style={{
                                backgroundColor: accentColor || '#2EAE67',
                                color: '#ffffff',
                            }}
                        >
                            Open app
                        </Button>
                    </a>
                    {onSidebarToggle && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                            onClick={onSidebarToggle}
                        >
                            {isSidebarOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Menu className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>

                {/* Breadcrumbs section - hidden on mobile */}
                <div className="hidden md:flex flex-1 items-center justify-between px-6">
                    <Breadcrumbs
                        localeCode={localeCode}
                        categories={categories}
                        storyTitle={storyTitle}
                        isHomepage={isHomepage}
                    />

                    {/* Right side actions */}
                    <div className="flex items-center space-x-2">
                        {/* Open app button - Linear Docs style with dynamic accent color */}
                        <a
                            href="https://rock.prezly.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                        >
                            <Button
                                variant="default"
                                size="sm"
                                className={cn(
                                    'h-8 px-3 text-sm font-medium text-white border-0 transition-all duration-200',
                                    isSearchOpen ? 'opacity-60' : 'hover:opacity-90',
                                )}
                                style={{
                                    backgroundColor: accentColor || '#2EAE67',
                                    color: '#ffffff',
                                }}
                            >
                                Open app
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {searchSettings && onSearchClose && (
                <SearchWidget
                    settings={searchSettings}
                    localeCode={localeCode}
                    categories={categories}
                    isOpen={isSearchOpen}
                    isSearchPage={false}
                    onClose={onSearchClose}
                    newsrooms={[newsroom]}
                    newsroomUuid={newsroom.uuid}
                    className="z-[70]"
                />
            )}
        </header>
    );
}
