import { notFound } from '@k8ordo/framework';
import type { MDXContent } from 'mdx/types';
import type { FC } from 'react';

import { MdxContent } from '@/components/site/mdx-base/mdx-base';
import { slideMdxComponents } from '@/components/slides/slide-mdx-components/slide-mdx-components';
import { loadersBySlug } from '@/shared/glob/loaders-by-slug';

const decks = import.meta.glob<MDXContent>('@content/slides/*/content.mdx', {
  import: 'default',
});

const loadDeck = loadersBySlug(decks, /\/slides\/([a-z0-9-]+)\/content\.mdx$/u);

export const SlideArticle: FC<{ slug: string }> = async ({ slug }) => {
  const load = loadDeck.get(slug);
  if (load === undefined) {
    notFound();
  }
  const Deck = await load();
  return <MdxContent Content={Deck} components={slideMdxComponents} />;
};
