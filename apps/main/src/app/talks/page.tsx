import { JsonLd } from '@/app/_components/json-ld';
import { getTalks } from '@/features/talks/interface/queries';
import { talkEventsJsonLd } from '@/shared/site/json-ld';

import { TalkCard } from './_components/talk-card';

import styles from './page.module.css';

export default async function Page() {
  const talks = await getTalks();
  return (
    <div className={styles.root}>
      <JsonLd data={talkEventsJsonLd(talks)} />
      {talks.map((talk) => (
        <TalkCard key={talk.id} {...talk} />
      ))}
    </div>
  );
}
