import type { Locale } from '@prezly/theme-kit-nextjs';
import { notFound, permanentRedirect } from 'next/navigation';

import { app, generateStoryPageMetadata, getSearchSettings } from '@/adapters/server';
import { HelpCenterLayout } from '@/components/HelpCenter';
import { Story } from '@/modules/Story';
import { fetchStoryTags, getAdjacentStoriesByTag, parsePreviewSearchParams } from '@/utils';

import { Broadcast } from '../components';

interface Props {
    params: Promise<{
        localeCode: Locale.Code;
        slug: string;
    }>;
    searchParams: Promise<Record<string, string>>;
}

async function resolve(params: Props['params']) {
    const { localeCode, slug } = await params;

    const story = await app().story({ slug });
    if (!story) notFound();

    // Redirect to canonical URL if set (308 permanent redirect)
    if (story.seo_settings.canonical_url) {
        permanentRedirect(story.seo_settings.canonical_url);
    }

    const { stories: relatedStories } = await app().stories({
        limit: 3,
        locale: localeCode,
        query: JSON.stringify({ slug: { $ne: slug } }),
    });

    return { relatedStories, story };
}

export async function generateMetadata({ params }: Props) {
    const { story } = await resolve(params);

    return generateStoryPageMetadata({ story });
}

export default async function StoryPage(props: Props) {
    const { localeCode } = await props.params;
    const searchParams = await props.searchParams;
    const { story, relatedStories } = await resolve(props.params);
    const newsroom = await app().newsroom();
    const language = await app().languageOrDefault(localeCode);
    const settings = await app().themeSettings();
    const searchSettings = getSearchSettings();
    const themeSettings = parsePreviewSearchParams(searchParams, settings);

    // Get story categories for breadcrumbs
    const storyCategories = await app().translatedCategories(story.culture.code, story.categories);

    // Get categories for sidebar
    const categories = await app().categories();
    const translatedCategories = await app().translatedCategories(
        localeCode,
        categories.filter((category) => category.i18n[localeCode]?.public_stories_number > 0),
    );

    // Fetch stories for each featured category to show in sidebar
    const featuredCategories = categories.filter((category) => category.is_featured);
    const featuredCategoryIds = new Set(featuredCategories.map((c) => c.id));

    // Filter breadcrumb categories to only show featured ones
    const breadcrumbCategories = storyCategories.filter((cat) => featuredCategoryIds.has(cat.id));

    const categoryStories: Record<number, any[]> = {};

    for (const category of featuredCategories) {
        const { stories } = await app().stories({
            categories: [{ id: category.id }],
            limit: 8, // Show up to 8 articles per category
            locale: { code: localeCode },
        });
        categoryStories[category.id] = stories;
    }

    // Fetch adjacent stories for prev/next navigation
    // Only if the story is in a featured category and has a numeric tag
    const storyTags = await fetchStoryTags(story.uuid);
    const storyFeaturedCategory = story.categories.find((cat) =>
        featuredCategories.some((fc) => fc.id === cat.id),
    );

    let adjacentStories: {
        previousStory: { slug: string; title: string } | null;
        nextStory: { slug: string; title: string } | null;
    } = { previousStory: null, nextStory: null };
    if (storyFeaturedCategory && storyTags.length > 0) {
        // Get all stories in the featured category for navigation
        const { stories: allCategoryStories } = await app().stories({
            categories: [{ id: storyFeaturedCategory.id }],
            limit: 100, // Get enough stories to find adjacent ones
            locale: { code: localeCode },
        });
        adjacentStories = await getAdjacentStoriesByTag(
            story,
            storyTags,
            categories,
            allCategoryStories,
        );
    }

    return (
        <>
            <Broadcast story={story} />
            <HelpCenterLayout
                localeCode={localeCode}
                categories={categories}
                translatedCategories={translatedCategories}
                showTableOfContents={true}
                content={story.content}
                newsroom={newsroom}
                information={language.company_information}
                searchSettings={searchSettings}
                categoryStories={categoryStories}
                breadcrumbCategories={breadcrumbCategories}
                storyTitle={story.title}
                isHomepage={false}
                mainSiteUrl={themeSettings.main_site_url}
                accentColor={themeSettings.accent_color}
                currentStorySlug={story.slug}
                storyActionsData={{
                    actions: {
                        show_copy_content: themeSettings.show_copy_content,
                        show_copy_url: themeSettings.show_copy_url,
                        show_download_assets: themeSettings.show_download_assets,
                        show_download_pdf: themeSettings.show_download_pdf,
                    },
                    storyUrl: story.links.short || story.links.newsroom_view,
                    storyUuid: story.uuid,
                    storyTitle: story.title,
                    storySlug: story.slug,
                    uploadcareAssetsGroupUuid: story.uploadcare_assets_group_uuid,
                }}
            >
                <Story
                    story={story}
                    withHeaderImage={themeSettings.header_image_placement}
                    relatedStories={themeSettings.show_read_more ? relatedStories : []}
                    hasRelatedStories={themeSettings.show_read_more}
                    adjacentStories={adjacentStories}
                />
            </HelpCenterLayout>
        </>
    );
}
