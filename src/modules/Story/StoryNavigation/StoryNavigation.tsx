'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Link } from '@/components/Link';

import styles from './StoryNavigation.module.scss';

interface AdjacentStory {
    slug: string;
    title: string;
}

interface Props {
    previousStory?: AdjacentStory | null;
    nextStory?: AdjacentStory | null;
}

export function StoryNavigation({ previousStory, nextStory }: Props) {
    if (!previousStory && !nextStory) {
        return null;
    }

    return (
        <nav className={styles.navigation} aria-label="Article navigation">
            <div className={styles.container}>
                {previousStory ? (
                    <Link
                        href={{
                            routeName: 'story',
                            params: { slug: previousStory.slug },
                        }}
                        className={styles.link}
                    >
                        <ChevronLeft className={styles.icon} />
                        <div className={styles.content}>
                            <span className={styles.label}>Previous</span>
                            <span className={styles.title}>{previousStory.title}</span>
                        </div>
                    </Link>
                ) : (
                    <div className={styles.placeholder} />
                )}

                {nextStory ? (
                    <Link
                        href={{
                            routeName: 'story',
                            params: { slug: nextStory.slug },
                        }}
                        className={`${styles.link} ${styles.next}`}
                    >
                        <div className={styles.content}>
                            <span className={styles.label}>Next</span>
                            <span className={styles.title}>{nextStory.title}</span>
                        </div>
                        <ChevronRight className={styles.icon} />
                    </Link>
                ) : (
                    <div className={styles.placeholder} />
                )}
            </div>
        </nav>
    );
}
