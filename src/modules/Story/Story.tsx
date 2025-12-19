import type { ExtendedStory, Story as StoryType } from '@prezly/sdk';
import type { DocumentNode } from '@prezly/story-content-format';
import { ImageNode } from '@prezly/story-content-format';

import { app } from '@/adapters/server';
import { ContentRenderer } from '@/components/ContentRenderer';
import type { ThemeSettings } from '@/theme-settings';

import { Embargo } from './Embargo';
import { HeaderImageRenderer } from './HeaderImageRenderer';
import { HeaderRenderer } from './HeaderRenderer';
import { RelatedStories } from './RelatedStories';
import { StoryNavigation } from './StoryNavigation';

import styles from './Story.module.scss';

interface AdjacentStory {
    slug: string;
    title: string;
}

type Props = {
    story: ExtendedStory;
    relatedStories: StoryType[];
    withHeaderImage: ThemeSettings['header_image_placement'];
    hasRelatedStories?: boolean;
    adjacentStories?: {
        previousStory: AdjacentStory | null;
        nextStory: AdjacentStory | null;
    };
};

export async function Story({
    relatedStories,
    story,
    withHeaderImage,
    hasRelatedStories,
    adjacentStories,
}: Props) {
    const nodes = JSON.parse(story.content);
    const [headerImageDocument, mainDocument] = pullHeaderImageNode(nodes, withHeaderImage);

    const newsroom = await app().newsroom();

    return (
        <div className={styles.container}>
            <article className={styles.story}>
                <Embargo story={story} />
                {withHeaderImage === 'above' && headerImageDocument && (
                    <HeaderImageRenderer nodes={headerImageDocument} />
                )}
                <HeaderRenderer nodes={mainDocument} />
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
