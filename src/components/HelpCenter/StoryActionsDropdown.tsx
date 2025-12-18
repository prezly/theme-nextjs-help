'use client';

import { ACTIONS, DOWNLOAD } from '@prezly/analytics-nextjs';
import { Check, ChevronDown, Copy, FileDown, FolderDown, Link2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/ui/button';
import { cn } from '@/lib/utils';
import { copyStoryText } from '@/modules/Story/Share/utils/copyStoryText';
import { getAssetsArchiveDownloadUrl } from '@/modules/Story/Share/utils/getAssetsArchiveDownloadUrl';
import { getStoryPdfUrl } from '@/modules/Story/Share/utils/getStoryPdfUrl';
import type { StoryActions } from '@/theme-settings';
import { analytics } from '@/utils';

interface Props {
    actions: StoryActions;
    storyUrl: string | null;
    storyUuid: string;
    storyTitle: string;
    storySlug: string;
    uploadcareAssetsGroupUuid: string | null;
}

interface ActionItem {
    id: string;
    label: string;
    icon: typeof Copy;
    onClick: () => void;
    isLoading?: boolean;
    successLabel?: string;
    isSuccess?: boolean;
    href?: string;
}

export function StoryActionsDropdown({
    actions,
    storyUrl,
    storyUuid,
    storyTitle,
    storySlug,
    uploadcareAssetsGroupUuid,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedText, setCopiedText] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const assetsUrl = uploadcareAssetsGroupUuid
        ? getAssetsArchiveDownloadUrl(uploadcareAssetsGroupUuid, storySlug)
        : undefined;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const handleCopyUrl = async () => {
        if (!storyUrl) return;
        analytics.track(ACTIONS.COPY_STORY_LINK, { id: storyUuid });
        await navigator.clipboard.writeText(storyUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleCopyText = async () => {
        analytics.track(ACTIONS.COPY_STORY_TEXT, { id: storyUuid });
        copyStoryText();
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    };

    const handleDownloadPdf = async () => {
        analytics.track(DOWNLOAD.STORY_PDF, { id: storyUuid });
        try {
            setIsDownloadingPdf(true);
            const pdfUrl = await getStoryPdfUrl(storyUuid);
            if (!pdfUrl) return;

            const link = document.createElement('a');
            link.setAttribute('href', pdfUrl);
            link.setAttribute('download', `${storyTitle}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleDownloadAssets = () => {
        analytics.track(DOWNLOAD.STORY_ASSETS, { id: storyUuid });
    };

    // Build list of available actions
    const availableActions: ActionItem[] = [];

    if (actions.show_copy_content) {
        availableActions.push({
            id: 'copy-text',
            label: 'Copy text',
            successLabel: 'Copied!',
            icon: Copy,
            onClick: handleCopyText,
            isSuccess: copiedText,
        });
    }

    if (actions.show_copy_url && storyUrl) {
        availableActions.push({
            id: 'copy-url',
            label: 'Copy URL',
            successLabel: 'Copied!',
            icon: Link2,
            onClick: handleCopyUrl,
            isSuccess: copiedUrl,
        });
    }

    if (actions.show_download_pdf) {
        availableActions.push({
            id: 'download-pdf',
            label: 'Download PDF',
            icon: FileDown,
            onClick: handleDownloadPdf,
            isLoading: isDownloadingPdf,
        });
    }

    if (actions.show_download_assets && assetsUrl) {
        availableActions.push({
            id: 'download-assets',
            label: 'Download assets',
            icon: FolderDown,
            onClick: handleDownloadAssets,
            href: assetsUrl,
        });
    }

    if (availableActions.length === 0) {
        return null;
    }

    const primaryAction = availableActions[0];
    const dropdownActions = availableActions.slice(1);
    const hasDropdown = dropdownActions.length > 0;

    const renderActionButton = (action: ActionItem, isPrimary: boolean) => {
        const Icon = action.isSuccess ? Check : action.icon;
        const label = action.isSuccess ? action.successLabel : action.label;

        const buttonContent = (
            <>
                <Icon className={cn('h-4 w-4', action.isSuccess && 'text-green-500')} />
                <span>{action.isLoading ? 'Generating...' : label}</span>
            </>
        );

        const className = cn(
            'h-8 px-3 text-sm font-medium gap-2',
            isPrimary && hasDropdown && 'rounded-r-none border-r-0',
            action.isLoading && 'opacity-50 cursor-not-allowed',
        );

        if (action.href) {
            return (
                <a href={action.href} onClick={action.onClick} className="text-decoration-none">
                    <Button variant="outline" size="sm" className={className}>
                        {buttonContent}
                    </Button>
                </a>
            );
        }

        return (
            <Button
                variant="outline"
                size="sm"
                className={className}
                onClick={action.onClick}
                disabled={action.isLoading}
            >
                {buttonContent}
            </Button>
        );
    };

    return (
        <div className="relative flex" ref={dropdownRef}>
            {/* Primary action button */}
            {renderActionButton(primaryAction, true)}

            {/* Dropdown toggle */}
            {hasDropdown && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 rounded-l-none"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <ChevronDown
                        className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')}
                    />
                </Button>
            )}

            {/* Dropdown menu */}
            {hasDropdown && isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-background border shadow-lg ring-1 ring-black/5 z-[100]">
                    <div className="p-1">
                        {dropdownActions.map((action) => {
                            const Icon = action.isSuccess ? Check : action.icon;
                            const label = action.isSuccess ? action.successLabel : action.label;

                            if (action.href) {
                                return (
                                    <a
                                        key={action.id}
                                        href={action.href}
                                        onClick={action.onClick}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                                            'text-foreground hover:bg-accent hover:text-accent-foreground',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-4 w-4',
                                                action.isSuccess && 'text-green-500',
                                            )}
                                        />
                                        <span>{label}</span>
                                    </a>
                                );
                            }

                            return (
                                <button
                                    key={action.id}
                                    onClick={action.onClick}
                                    disabled={action.isLoading}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                                        'text-foreground hover:bg-accent hover:text-accent-foreground',
                                        action.isLoading && 'opacity-50 cursor-not-allowed',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-4 w-4',
                                            action.isSuccess && 'text-green-500',
                                        )}
                                    />
                                    <span>{action.isLoading ? 'Generating...' : label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
