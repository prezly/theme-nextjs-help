import type { Locale } from '@prezly/theme-kit-nextjs';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { app, generatePageMetadata, getSearchSettings, routing } from '@/adapters/server';
import { HelpCenterLayout } from '@/components/HelpCenter';
import { Story } from '@/modules/Story';
import { parsePreviewSearchParams } from '@/utils';

interface Props {
    params: Promise<{
        localeCode: Locale.Code;
    }>;
    searchParams: Promise<{
        preview?: string;
    }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const { generateAbsoluteUrl } = await routing();

    return generatePageMetadata(
        {
            locale: params.localeCode,
            generateUrl: (locale) => generateAbsoluteUrl('index', { localeCode: locale }),
        },
        {
            alternates: {
                types: {
                    'application/rss+xml': generateAbsoluteUrl('feed'),
                },
            },
        },
    );
}

export default async function HomePage(props: Props) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { localeCode } = params;

    // Fetch the pinned/first story (list view)
    const { stories } = await app().stories({
        limit: 1,
        locale: { code: localeCode },
    });

    const [pinnedStoryPreview] = stories;

    // If no stories exist, show not found
    if (!pinnedStoryPreview) {
        notFound();
    }

    // Fetch the full story data
    const pinnedStory = await app().story({ slug: pinnedStoryPreview.slug });
    if (!pinnedStory) {
        notFound();
    }

    const newsroom = await app().newsroom();
    const language = await app().languageOrDefault(localeCode);
    const settings = await app().themeSettings();
    const searchSettings = getSearchSettings();
    const themeSettings = parsePreviewSearchParams(searchParams, settings);

    // Get story categories for breadcrumbs (empty for homepage)
    const storyCategories = await app().translatedCategories(
        pinnedStory.culture.code,
        pinnedStory.categories,
    );

    // Get categories for sidebar
    const categories = await app().categories();
    const translatedCategories = await app().translatedCategories(
        localeCode,
        categories.filter((category) => category.i18n[localeCode]?.public_stories_number > 0),
    );

    // Fetch stories for each featured category to show in sidebar
    const featuredCategories = categories.filter((category) => category.is_featured);
    const categoryStories: Record<number, any[]> = {};

    for (const category of featuredCategories) {
        const { stories: catStories } = await app().stories({
            categories: [{ id: category.id }],
            limit: 8,
            locale: { code: localeCode },
        });
        categoryStories[category.id] = catStories;
    }

    // Get related stories (excluding the pinned one)
    const { stories: relatedStories } = await app().stories({
        limit: 3,
        locale: localeCode,
        query: JSON.stringify({ uuid: { $ne: pinnedStory.uuid } }),
    });

    return (
        <HelpCenterLayout
            localeCode={localeCode}
            categories={categories}
            translatedCategories={translatedCategories}
            showTableOfContents={true}
            content={pinnedStory.content}
            newsroom={newsroom}
            information={language.company_information}
            searchSettings={searchSettings}
            categoryStories={categoryStories}
            breadcrumbCategories={storyCategories}
            storyTitle={pinnedStory.title}
            isHomepage={true}
            mainSiteUrl={themeSettings.main_site_url}
            accentColor={themeSettings.accent_color}
            currentStorySlug={pinnedStory.slug}
        >
            <Story
                story={pinnedStory}
                showDate={themeSettings.show_date}
                withHeaderImage={themeSettings.header_image_placement}
                relatedStories={themeSettings.show_read_more ? relatedStories : []}
                hasRelatedStories={themeSettings.show_read_more}
                actions={{
                    show_copy_content: themeSettings.show_copy_content,
                    show_copy_url: themeSettings.show_copy_url,
                    show_download_assets: themeSettings.show_download_assets,
                    show_download_pdf: themeSettings.show_download_pdf,
                }}
                sharingOptions={{
                    sharing_placement: themeSettings.sharing_placement,
                    sharing_actions: themeSettings.sharing_actions,
                }}
                withBadges={themeSettings.story_card_variant === 'boxed'}
            />
        </HelpCenterLayout>
    );
}
