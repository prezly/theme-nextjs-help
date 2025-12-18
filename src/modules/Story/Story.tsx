import type { ExtendedStory, Story as StoryType } from '@prezly/sdk';
import type { DocumentNode } from '@prezly/story-content-format';
import { ImageNode, TextAlignment } from '@prezly/story-content-format';
import classNames from 'classnames';

import { FormattedDate } from '@/adapters/client';
import { app } from '@/adapters/server';
import { CategoriesList } from '@/components/CategoriesList';
import { ContentRenderer } from '@/components/ContentRenderer';
import type { ThemeSettings } from '@/theme-settings';

import { Embargo } from './Embargo';
import { HeaderImageRenderer } from './HeaderImageRenderer';
import { HeaderRenderer } from './HeaderRenderer';
import { getHeaderAlignment } from './lib';
import { RelatedStories } from './RelatedStories';
import { StoryNavigation } from './StoryNavigation';

import styles from './Story.module.scss';

interface AdjacentStory {
    slug: string;
    title: string;
}

type Props = {
    showDate: ThemeSettings['show_date'];
    story: ExtendedStory;
    relatedStories: StoryType[];
    withHeaderImage: ThemeSettings['header_image_placement'];
    withBadges: boolean;
    hasRelatedStories?: boolean;
    adjacentStories?: {
        previousStory: AdjacentStory | null;
        nextStory: AdjacentStory | null;
    };
};

export async function Story({
    relatedStories,
    showDate,
    story,
    withBadges,
    withHeaderImage,
    hasRelatedStories,
    adjacentStories,
}: Props) {
    const nodes = JSON.parse(story.content);
    const [headerImageDocument, mainDocument] = pullHeaderImageNode(nodes, withHeaderImage);

    const headerAlignment = getHeaderAlignment(nodes);

    const categories = await app().translatedCategories(story.culture.code, story.categories);
    const newsroom = await app().newsroom();

    return (
        <div className={styles.container}>
            <article className={styles.story}>
                <Embargo story={story} />
                {withHeaderImage === 'above' && headerImageDocument && (
                    <HeaderImageRenderer nodes={headerImageDocument} />
                )}
                {categories.length > 0 && (
                    <CategoriesList
                        categories={categories}
                        external={false}
                        showAllCategories
                        withBadges={withBadges}
                    />
                )}
                <HeaderRenderer nodes={mainDocument} />
                <div
                    className={classNames(styles.linksAndDateWrapper, {
                        [styles.left]:
                            headerAlignment === TextAlignment.LEFT ||
                            headerAlignment === TextAlignment.JUSTIFY,
                        [styles.right]: headerAlignment === TextAlignment.RIGHT,
                        [styles.center]: headerAlignment === TextAlignment.CENTER,
                    })}
                >
                    {showDate && story.published_at && (
                        <p className={styles.date}>
                            <FormattedDate value={story.published_at} />
                        </p>
                    )}
                </div>
                <ContentRenderer story={story} nodes={mainDocument} />
            </article>
            {adjacentStories && (
                <StoryNavigation
                    previousStory={adjacentStories.previousStory}
                    nextStory={adjacentStories.nextStory}
                />
            )}
            <RelatedStories
                hasRelatedStories={hasRelatedStories}
                newsroom={newsroom}
                stories={relatedStories}
            />
        </div>
    );
}

function pullHeaderImageNode(
    documentNode: DocumentNode,
    withHeaderImage: ThemeSettings['header_image_placement'],
): [DocumentNode | null, DocumentNode] {
    const { children } = documentNode;
    const [firstNode] = children;

    if (ImageNode.isImageNode(firstNode) && withHeaderImage === 'above') {
        return [
            { ...documentNode, children: [firstNode] },
            { ...documentNode, children: children.slice(1) },
        ];
    }

    return [null, documentNode];
}
