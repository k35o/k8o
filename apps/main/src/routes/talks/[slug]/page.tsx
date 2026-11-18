import type { PageProps } from '@k8ordo/framework';

import { PageMeta } from '@/components/site/page-meta/page-meta';
import { DeckFrame } from '@/components/talks/deck-frame/deck-frame';
import { PdfDeckArticle } from '@/components/talks/pdf-deck-article/pdf-deck-article';
import { SlideArticle } from '@/components/talks/slide-article/slide-article';
import { getTalkDeck } from '@/features/talks/interface/queries';

export default async function TalkDeckPage({
  params,
}: PageProps<'/talks/:slug'>) {
  const { slug } = params;
  const talk = await getTalkDeck(slug);

  return (
    <>
      <PageMeta
        article={{ publishedTime: talk.eventDate }}
        description={`${talk.eventName}で発表したスライドです。`}
        image={{ path: `/talks/${slug}/og.png`, alt: talk.title }}
        path={`/talks/${slug}`}
        title={talk.title}
        titleTemplate={false}
        twitterCard="summary_large_image"
      />
      <DeckFrame>
        {talk.deck.kind === 'pdf' ? (
          <PdfDeckArticle key={slug} slug={slug} title={talk.title} />
        ) : (
          <SlideArticle key={slug} slug={slug} />
        )}
      </DeckFrame>
    </>
  );
}
