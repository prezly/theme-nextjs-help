'use client';

import { ACTIONS, DOWNLOAD } from '@prezly/analytics-nextjs';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Check, ChevronDown, Copy, FileDown, FolderDown, Link2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Button } from '@/components/ui/ui/button';
import { cn } from '@/lib/utils';
import { getAssetsArchiveDownloadUrl } from '@/modules/Story/Share/utils/getAssetsArchiveDownloadUrl';
import { getStoryPdfUrl } from '@/modules/Story/Share/utils/getStoryPdfUrl';
import { copyStoryText } from '@/modules/Story/Share/utils/copyStoryText';
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

export function StoryActionsDropdown({
    actions,
    storyUrl,
    storyUuid,
    storyTitle,
    storySlug,
    uploadcareAssetsGroupUuid,
}: Props) {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedText, setCopiedText] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const assetsUrl = uploadcareAssetsGroupUuid
        ? getAssetsArchiveDownloadUrl(uploadcareAssetsGroupUuid, storySlug)
        : undefined;

    const hasAnyAction =
        actions.show_copy_url ||
        actions.show_copy_content ||
        actions.show_download_pdf ||
        (actions.show_download_assets && assetsUrl);

    if (!hasAnyAction) {
        return null;
    }

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

    return (
        <Menu as="div" className="relative">
            <MenuButton as={Fragment}>
                <Button variant="outline" size="sm" className="h-8 px-3 text-sm font-medium gap-1">
                    Actions
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </MenuButton>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-background border shadow-lg ring-1 ring-black/5 focus:outline-none z-[100]">
                    <div className="p-1">
                        {actions.show_copy_url && storyUrl && (
                            <MenuItem>
                                {({ focus }) => (
                                    <button
                                        onClick={handleCopyUrl}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                                            focus
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-foreground',
                                        )}
                                    >
                                        {copiedUrl ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Link2 className="h-4 w-4" />
                                        )}
                                        <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                                    </button>
                                )}
                            </MenuItem>
                        )}

                        {actions.show_copy_content && (
                            <MenuItem>
                                {({ focus }) => (
                                    <button
                                        onClick={handleCopyText}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                                            focus
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-foreground',
                                        )}
                                    >
                                        {copiedText ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                        <span>{copiedText ? 'Copied!' : 'Copy text'}</span>
                                    </button>
                                )}
                            </MenuItem>
                        )}

                        {actions.show_download_pdf && (
                            <MenuItem>
                                {({ focus }) => (
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={isDownloadingPdf}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                                            focus
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-foreground',
                                            isDownloadingPdf && 'opacity-50 cursor-not-allowed',
                                        )}
                                    >
                                        <FileDown className="h-4 w-4" />
                                        <span>
                                            {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
                                        </span>
                                    </button>
                                )}
                            </MenuItem>
                        )}

                        {actions.show_download_assets && assetsUrl && (
                            <MenuItem>
                                {({ focus }) => (
                                    <a
                                        href={assetsUrl}
                                        onClick={handleDownloadAssets}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                                            focus
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-foreground',
                                        )}
                                    >
                                        <FolderDown className="h-4 w-4" />
                                        <span>Download assets</span>
                                    </a>
                                )}
                            </MenuItem>
                        )}
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    );
}
