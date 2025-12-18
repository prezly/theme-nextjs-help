import type { Category, ExtendedStory } from '@prezly/sdk';

import type { ListStory } from '@/types';

import { enrichStoriesWithTags } from './enrichStoriesWithTags';

interface AdjacentStory {
    slug: string;
    title: string;
}

interface AdjacentStories {
    previousStory: AdjacentStory | null;
    nextStory: AdjacentStory | null;
}

/**
 * Extracts the numeric tag number from a story's tags (e.g., "#1" -> 1)
 */
function getNumericTagNumber(tags: string[]): number | null {
    for (const tag of tags) {
        const match = tag.match(/^#(\d+)$/);
        if (match) {
            return Number.parseInt(match[1], 10);
        }
    }
    return null;
}

/**
 * Gets the featured category from a story's categories
 */
function getFeaturedCategory(
    storyCategories: Category[],
    allCategories: Category[],
): Category | null {
    for (const storyCategory of storyCategories) {
        const fullCategory = allCategories.find((c) => c.id === storyCategory.id);
        if (fullCategory?.is_featured) {
            return fullCategory;
        }
    }
    return null;
}

/**
 * Finds adjacent stories (previous and next) based on numeric tag ordering
 * within a featured category.
 *
 * @param story - The current story
 * @param storyTags - The current story's tags
 * @param allCategories - All categories (needed to check is_featured)
 * @param categoryStories - Stories in the featured category (already fetched)
 * @returns Object with previousStory and nextStory (or null for each)
 */
export async function getAdjacentStoriesByTag(
    story: ExtendedStory,
    storyTags: string[],
    allCategories: Category[],
    categoryStories: ListStory[],
): Promise<AdjacentStories> {
    const result: AdjacentStories = {
        previousStory: null,
        nextStory: null,
    };

    // Check if story has a numeric tag
    const currentTagNumber = getNumericTagNumber(storyTags);
    if (currentTagNumber === null) {
        return result;
    }

    // Check if story has a featured category
    const featuredCategory = getFeaturedCategory(story.categories, allCategories);
    if (!featuredCategory) {
        return result;
    }

    // Enrich stories with tags if not already
    const enrichedStories = await enrichStoriesWithTags(categoryStories);

    // Find previous story (tag number - 1)
    const previousTagNumber = currentTagNumber - 1;
    if (previousTagNumber >= 0) {
        const previousStory = enrichedStories.find((s) => {
            if (s.uuid === story.uuid) return false;
            const tags = s.tags || [];
            const tagNumber = getNumericTagNumber(tags);
            return tagNumber === previousTagNumber;
        });

        if (previousStory) {
            result.previousStory = {
                slug: previousStory.slug,
                title: previousStory.title,
            };
        }
    }

    // Find next story (tag number + 1)
    const nextTagNumber = currentTagNumber + 1;
    const nextStory = enrichedStories.find((s) => {
        if (s.uuid === story.uuid) return false;
        const tags = s.tags || [];
        const tagNumber = getNumericTagNumber(tags);
        return tagNumber === nextTagNumber;
    });

    if (nextStory) {
        result.nextStory = {
            slug: nextStory.slug,
            title: nextStory.title,
        };
    }

    return result;
}

/**
 * Fetches the tags for a single story from the v2 API
 */
export async function fetchStoryTags(storyUuid: string): Promise<string[]> {
    try {
        const response = await fetch(`https://api.prezly.com/v2/stories/${storyUuid}`, {
            headers: {
                Authorization: `Bearer ${process.env.PREZLY_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const v2Story = await response.json();
            return v2Story.story?.tag_names || [];
        }
    } catch (error) {
        console.warn(`Failed to fetch tags for story ${storyUuid}:`, error);
    }

    return [];
}
