import type { FC } from 'react';

import { PdfPage } from '@/components/talks/pdf-page/pdf-page';
import { SlideDeck } from '@/components/talks/slide-deck/slide-deck/slide-deck';
import { getPdfDeck, pdfPageSources } from '@/features/talks/interface/queries';
import { SITE_URL } from '@/shared/site/site-url';

import styles from './pdf-deck-article.module.css';

// PDF から作ったデッキを、MDX のデッキと同じ枠で描く
export const PdfDeckArticle: FC<{ slug: string; title: string }> = async ({
  slug,
  title,
}) => {
  const deck = await getPdfDeck(slug);
  const base = `/talks/${slug}`;
  const slides = deck.pages.map((page, index) => ({
    content: [
      <PdfPage
        blocks={page.blocks}
        height={page.height}
        key="page"
        label={`${(index + 1).toString()}枚目`}
        links={page.links}
        {...pdfPageSources(slug, index + 1)}
        width={page.width}
      />,
    ],
    notes:
      page.notes === ''
        ? []
        : [
            <p className={styles.notes} key="notes">
              {page.notes}
            </p>,
          ],
  }));
  return (
    <SlideDeck
      bleed
      qrUrl={`${SITE_URL}${base}`}
      slides={slides}
      slug={slug}
      title={title}
    />
  );
};
