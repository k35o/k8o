import { Heading } from '@k8ordo/ui';
import type { ComponentProps, FC } from 'react';

import { JsonLd } from '@/components/site/json-ld/json-ld';
import { talkEventsJsonLd } from '@/shared/site/json-ld';

import { TalkCard } from '../talk-card/talk-card';

import styles from './talks-index.module.css';

type Talk = ComponentProps<typeof TalkCard> & { id: number };

export const TalksIndex: FC<{ talks: readonly Talk[] }> = ({ talks }) => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">Talks</Heading>
      <div className={styles.list}>
        <JsonLd data={talkEventsJsonLd(talks)} />
        {talks.map((talk) => (
          <TalkCard key={talk.id} {...talk} />
        ))}
      </div>
    </div>
  </div>
);
